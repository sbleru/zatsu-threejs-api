import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { usePlayer, usePlayerListener } from "../player";

export const AnimatedModel = () => {
  const { scene, animations } = useLoader(
    GLTFLoader,
    // https://sketchfab.com/3d-models/hatsune-miku-a25f6548a8684500ac0004559484a4f9
    "/models/hatsune_miku.glb",
  );
  const { player } = usePlayer();
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  const [isPlaying, setIsPlaying] = useState(false);
  const actionRef = useRef<THREE.AnimationAction | null>(null);

  // playerの状態を監視
  usePlayerListener(player, {
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onStop: () => setIsPlaying(false),
  });

  useEffect(() => {
    if (animations.length > 0) {
      const action = mixer.clipAction(animations[0]);
      actionRef.current = action;
      action.play();

      // 初期状態では停止
      if (!isPlaying) {
        action.paused = true;
      }
    }
  }, [mixer, animations, isPlaying]);

  // playerの状態に応じてアニメーションの再生/停止を制御
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.paused = !isPlaying;
    }
  }, [isPlaying]);

  useFrame((_state, delta) => {
    // アニメーションが再生中の場合のみmixerを更新
    if (isPlaying) {
      mixer.update(delta);
    }
  });

  return (
    <>
      <hemisphereLight intensity={0.5} />
      <directionalLight position={[0, 2, 5]} castShadow intensity={1} />
      <directionalLight position={[0, -2, 5]} castShadow intensity={1} />
      <primitive object={scene} position={[0, -1, 1]} scale={[100, 100, 100]} />
    </>
  );
};
