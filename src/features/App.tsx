import { useState } from "react";

import { PlayerProvider, usePlayer } from "./player";
import { PlayerControl } from "./PlayerControl";
import { Scene } from "./scenes/Scene";
import { SceneEffectProvider } from "./scenes/SceneEffectContext";

const AppContent = () => {
  const { player, app } = usePlayer();

  return (
    <>
      {player && app && <PlayerControl disabled={app.managed} />}
      <Scene />
    </>
  );
};

export const App = () => {
  const [mediaElement, setMediaElement] = useState<HTMLDivElement | null>(null);

  return (
    <PlayerProvider mediaElement={mediaElement}>
      <SceneEffectProvider>
        <AppContent />
        <div
          className="absolute right-2.5 bottom-2.5 z-20"
          ref={setMediaElement}
        />
      </SceneEffectProvider>
    </PlayerProvider>
  );
};
