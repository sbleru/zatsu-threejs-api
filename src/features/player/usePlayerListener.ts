import { useEffect } from "react";
import { Player, PlayerListener } from "textalive-app-api";

import { UsePlayerListenerOptions } from "./types";

export const usePlayerListener = (
  player: Player | null,
  options: UsePlayerListenerOptions,
): void => {
  useEffect(() => {
    if (!player) {
      return;
    }

    const listener: PlayerListener = {};

    // 各イベントハンドラーを設定
    if (options.onAppReady) {
      listener.onAppReady = options.onAppReady;
    }
    if (options.onVideoReady) {
      listener.onVideoReady = options.onVideoReady;
    }
    if (options.onPlay) {
      listener.onPlay = options.onPlay;
    }
    if (options.onPause) {
      listener.onPause = options.onPause;
    }
    if (options.onStop) {
      listener.onStop = options.onStop;
    }
    if (options.onSeek) {
      listener.onSeek = options.onSeek;
    }
    if (options.onTimeUpdate) {
      listener.onTimeUpdate = options.onTimeUpdate;
    }

    // リスナーが空でない場合のみ登録
    if (Object.keys(listener).length > 0) {
      player.addListener(listener);

      return () => {
        player.removeListener(listener);
      };
    }
  }, [player, options]);
};
