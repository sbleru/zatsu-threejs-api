import { FontData, Text3D } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";

import notoSansJp from "../../assets/fonts/Noto_Sans_JP_Regular.json";

interface AnimatedText3DProps {
  text: string;
  fontSize?: number;
  color?: string;
  position?: [number, number, number];
  beatIntensity?: number; // ビートの強度 (0-1)
}

export const AnimatedText3D = ({
  text,
  fontSize = 3,
  color = "#1f4391",
  position = [-2, -1.5, 0],
  beatIntensity = 0,
}: AnimatedText3DProps) => {
  const groupRef = useRef<Group>(null);
  const baseScale = useRef(1);
  const targetScale = useRef(1);

  // ビートに合わせてスケールを変更
  useEffect(() => {
    if (beatIntensity > 0.1) {
      targetScale.current = 1 + beatIntensity * 0.5; // ビートの強度に応じてスケール
    } else {
      targetScale.current = 1;
    }
  }, [beatIntensity]);

  // アニメーションループ
  useFrame((state, delta) => {
    if (groupRef.current) {
      // スケールのスムーズな変化
      baseScale.current +=
        (targetScale.current - baseScale.current) * delta * 8;
      groupRef.current.scale.setScalar(baseScale.current);

      // 軽微な浮遊効果
      const time = state.clock.getElapsedTime();
      groupRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1;

      // ビートに合わせた回転効果
      if (beatIntensity > 0.2) {
        groupRef.current.rotation.z = Math.sin(time * 10) * beatIntensity * 0.1;
      } else {
        groupRef.current.rotation.z *= 0.95; // 回転を徐々に減衰
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Text3D
        font={notoSansJp as unknown as FontData}
        size={fontSize}
        height={0.2}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.03}
        bevelSize={0.02}
        bevelSegments={5}
      >
        {text}
        <meshNormalMaterial />
      </Text3D>

      {/* ビートに合わせた光の効果 */}
      {beatIntensity > 0.3 && (
        <pointLight
          position={[0, 0, 2]}
          intensity={beatIntensity * 2}
          color={color}
          distance={10}
        />
      )}
    </group>
  );
};
