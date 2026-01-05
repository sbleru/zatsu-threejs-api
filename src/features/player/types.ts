import { IPlayerApp, Player, PlayerListener } from "textalive-app-api";

export interface PlayerContextValue {
  player: Player | null;
  app: IPlayerApp | null;
  isReady: boolean;
}

export interface UseTextAlivePlayerOptions {
  token?: string;
  defaultSongUrl?: string;
}

export interface UsePlayerListenerOptions {
  onAppReady?: PlayerListener["onAppReady"];
  onVideoReady?: PlayerListener["onVideoReady"];
  onPlay?: PlayerListener["onPlay"];
  onPause?: PlayerListener["onPause"];
  onStop?: PlayerListener["onStop"];
  onSeek?: PlayerListener["onSeek"];
  onTimeUpdate?: PlayerListener["onTimeUpdate"];
}
