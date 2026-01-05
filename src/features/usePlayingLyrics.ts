import { useState } from "react";

import { usePlayer, usePlayerListener } from "./player";

type CharInfo = {
  text: string;
  startTime: number;
  endTime: number;
};

type WordInfo = {
  text: string;
  startTime: number;
  endTime: number;
};

type PhraseInfo = {
  text: string;
  startTime: number;
  endTime: number;
  nextStartTime?: number; // 次のphraseの開始時間
};

export const usePlayingLyrics = () => {
  const [char, setChar] = useState<CharInfo | null>(null);
  const [word, setWord] = useState<WordInfo | null>(null);
  const [phrase, setPhrase] = useState<PhraseInfo | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const { player } = usePlayer();

  // 文字、単語、フレーズのアニメーション用リスナー
  usePlayerListener(player, {
    onVideoReady: () => {
      if (!player) return;

      // 現在の再生時間を定期的に更新
      const updateCurrentTime = () => {
        if (player) {
          setCurrentTime(player.timer.position);
        }
      };

      // 50msごとに現在時間を更新
      const timeInterval = setInterval(updateCurrentTime, 50);

      // 文字のアニメーション設定
      let c = player.video.firstChar;
      while (c) {
        c.animate = (now: number, u) => {
          if (u.startTime <= now && u.endTime > now) {
            setChar({
              text: u.text,
              startTime: u.startTime,
              endTime: u.endTime,
            });
          }
        };
        c = c.next;
      }

      // 単語のアニメーション設定
      let w = player.video.firstWord;
      while (w) {
        w.animate = (now: number, u) => {
          if (u.startTime <= now && u.endTime > now) {
            setWord({
              text: u.text,
              startTime: u.startTime,
              endTime: u.endTime,
            });
          }
        };
        w = w.next;
      }

      // フレーズのアニメーション設定
      let p = player.video.firstPhrase;
      while (p) {
        p.animate = (now: number, u) => {
          if (u.startTime <= now && u.endTime > now) {
            setPhrase({
              text: u.text,
              startTime: u.startTime,
              endTime: u.endTime,
              nextStartTime: u.next ? u.next.startTime : undefined,
            });
          }
        };
        p = p.next;
      }

      // クリーンアップ関数を返す
      return () => {
        clearInterval(timeInterval);
      };
    },
  });

  return { char, word, phrase, currentTime };
};
