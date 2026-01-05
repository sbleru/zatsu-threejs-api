import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

import { usePlayer } from "../player";
import { useBeatDetection } from "../useBeatDetection";
import { usePlayingLyrics } from "../usePlayingLyrics";

import { AnimatedPhrase3D } from "./AnimatedPhrase3D";
import { CameraSwitcher } from "./CameraSwitcher";
import { ParticleEffect } from "./effects/ParticleEffect";
import { SteelFrameEffect } from "./effects/SteelFrameEffect";
import { FlowingLyrics3D } from "./FlowingLyrics3D";
import { useSceneEffect } from "./SceneEffectContext";
import {
  AnimationActionControls,
  AnimationActionDemo,
  AnimationActionProvider,
} from "./threejs-demos/AnimationActionDemo";

export const Scene = () => {
  const { player } = usePlayer();
  const { beatIntensity } = useBeatDetection(player);
  const { word, phrase, currentTime } = usePlayingLyrics();
  const { effectSettings } = useSceneEffect();

  return (
    <AnimationActionProvider>
      <div className="w-full h-full bg-[oklch(0_0_0)]">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 50 }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <color attach="background" args={["#151520"]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* パーティクルエフェクト */}
            {effectSettings.showParticles && (
              <ParticleEffect beatIntensity={beatIntensity} />
            )}

            {/* スチールフレームエフェクト */}
            {effectSettings.showSteelFrame && (
              <SteelFrameEffect beatIntensity={beatIntensity} />
            )}

            {/* 歌詞演出 */}
            {effectSettings.type === "flowingLyrics" && (
              <FlowingLyrics3D
                phrase={phrase}
                word={word}
                currentTime={currentTime}
                beatIntensity={beatIntensity}
                fontSize={0.3}
              />
            )}

            {effectSettings.type === "animatedPhrase" && (
              <AnimatedPhrase3D
                phrase={phrase}
                word={word}
                currentTime={currentTime}
                beatIntensity={beatIntensity}
                position={[0, 2, 0]}
              />
            )}

            {/* AnimationActionのデモ（試したい場合はこちらを有効化） */}
            <AnimationActionDemo />

            {/* 通常のAnimatedModel */}
            {/* <AnimatedModel /> */}
            <CameraSwitcher />
          </Suspense>
        </Canvas>

        {/* AnimationActionのコントロールUI（Canvasの外） */}
        <AnimationActionControls />
      </div>
    </AnimationActionProvider>
  );
};
