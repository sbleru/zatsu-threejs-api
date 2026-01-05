import { useEffect, useState } from "react";
import { Player } from "textalive-app-api";

type Beat = {
  startTime: number;
  length?: number;
  duration?: number;
};

const DEFAULT_BEAT_DURATION = 500;
const BEAT_MAX_INTENSITY = 1.0;
const BEAT_LOW_INTENSITY = 0.1;

export const useBeatDetection = (player: Player | null) => {
  const [beatIntensity, setBeatIntensity] = useState(0);
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);

  useEffect(() => {
    if (!player) return;

    const updateBeat = () => {
      const now = player.timer.position;

      // ビート情報を取得
      if (player.data.songMap && player.data.songMap.beats) {
        const beats = player.data.songMap.beats;

        // 現在時刻に最も近いビートを見つける（より精密に）
        const currentBeatData = beats.find((beat) => {
          const beatStart = beat.startTime;
          const beatEnd = beatStart + (beat.duration ?? DEFAULT_BEAT_DURATION);
          return now >= beatStart && now <= beatEnd;
        });

        if (currentBeatData) {
          setCurrentBeat(currentBeatData);

          // ビートの開始からの経過時間を計算
          const timeSinceStart = now - currentBeatData.startTime;
          const beatDuration =
            currentBeatData.duration ?? DEFAULT_BEAT_DURATION;

          // ビート開始時に最大、時間経過とともに減衰するような強度計算
          // ビート開始から100ms以内は最大強度、その後減衰
          let intensity = 0;
          if (timeSinceStart <= 100) {
            intensity = BEAT_MAX_INTENSITY; // ビート開始直後は最大強度
          } else if (timeSinceStart <= beatDuration * 0.3) {
            // ビート期間の30%まで徐々に減衰
            intensity =
              BEAT_MAX_INTENSITY -
              (timeSinceStart - 100) / (beatDuration * 0.3 - 100);
          } else {
            // それ以降は低い強度
            intensity = BEAT_LOW_INTENSITY;
          }

          setBeatIntensity(
            Math.max(0, Math.min(BEAT_MAX_INTENSITY, intensity)),
          );
        } else {
          // ビートがない場合は徐々に減衰
          setBeatIntensity((prev) => prev * 0.9);
        }
      }
    };

    // 定期的にビート情報を更新
    const interval = setInterval(updateBeat, 50); // 20fps

    return () => {
      clearInterval(interval);
    };
  }, [player]);

  return { beatIntensity, currentBeat };
};
