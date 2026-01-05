import React, { ReactNode, useEffect, useState } from "react";
import { IPlayerApp, Player, PlayerListener } from "textalive-app-api";

import { PlayerContext } from "./context";
import { PlayerContextValue, UseTextAlivePlayerOptions } from "./types";

interface PlayerProviderProps {
  children: ReactNode;
  mediaElement: HTMLDivElement | null;
  options?: UseTextAlivePlayerOptions;
}

/**
 * textalive-app-api の Player インスタンスを作成する
 * 
 * NOTE:
 * マジカルミライ 2025 対象楽曲
 * 
 * ストリートライト by 加賀(ネギシャワーP)
 * https://songle.jp/songs/piapro.jp%2Ft%2FULcJ%2F20250205120202
 * https://piapro.jp/t/ULcJ/20250205120202
 * 
 * アリフレーション by 雨良 Amala
 * https://songle.jp/songs/piapro.jp%2Ft%2FSuQO%2F20250127235813
 * https://piapro.jp/t/SuQO/20250127235813

 * インフォーマルダイブ by 99piano
 * https://songle.jp/songs/piapro.jp%2Ft%2FPpc9%2F20241224135843
 * https://piapro.jp/t/Ppc9/20241224135843

 * ハロー、フェルミ。 by ど～ぱみん
 * https://songle.jp/songs/piapro.jp%2Ft%2FoTaJ%2F20250204234235
 * https://piapro.jp/t/oTaJ/20250204234235

 * パレードレコード by きさら
 * https://songle.jp/songs/piapro.jp%2Ft%2FGCgy%2F20250202202635
 * https://piapro.jp/t/GCgy/20250202202635

 * ロンリーラン by 海風太陽
 * https://songle.jp/songs/piapro.jp%2Ft%2FCyPO%2F20250128183915
 * https://piapro.jp/t/CyPO/20250128183915
 */
export const PlayerProvider: React.FC<PlayerProviderProps> = ({
  children,
  mediaElement,
  options = {},
}) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [app, setApp] = useState<IPlayerApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  const {
    token = import.meta.env.VITE_TEXTALIVE_TOKEN || "elLljAkPmCHHiGDP",
    defaultSongUrl = "https://piapro.jp/t/ULcJ/20250205120202",
  } = options;

  useEffect(() => {
    if (typeof window === "undefined" || !mediaElement) {
      return;
    }

    console.log("--- [app] create Player instance ---");
    const p = new Player({
      app: {
        token,
      },
      mediaElement,
    });

    const playerListener: PlayerListener = {
      onAppReady: (app) => {
        console.log("--- [app] initialized as TextAlive app ---");
        console.log("managed:", app.managed);
        console.log("host:", app.host);
        console.log("song url:", app.songUrl);

        if (!app.songUrl) {
          // マジカルミライ 2025 対象楽曲
          // ストリートライト by 加賀(ネギシャワーP)
          // https://songle.jp/songs/piapro.jp%2Ft%2FULcJ%2F20250205120202
          p.createFromSongUrl(defaultSongUrl);
        }
        setApp(app);
      },
      onVideoReady: () => {
        console.log("--- [app] video is ready ---");
        console.log("player:", p);
        console.log("player.data.song:", p.data.song);
        console.log("player.data.song.name:", p.data.song.name);
        console.log("player.data.song.artist.name:", p.data.song.artist.name);
        console.log("player.data.songMap:", p.data.songMap);
        setIsReady(true);
      },
    };

    p.addListener(playerListener);
    setPlayer(p);

    return () => {
      console.log("--- [app] shutdown ---");
      p.removeListener(playerListener);
      p.dispose();
      setPlayer(null);
      setApp(null);
      setIsReady(false);
    };
  }, [mediaElement, token, defaultSongUrl]);

  const contextValue: PlayerContextValue = { player, app, isReady };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};
