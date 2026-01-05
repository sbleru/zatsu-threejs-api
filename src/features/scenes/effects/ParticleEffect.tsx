import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Points, Vector3 } from "three";

type ParticleEffectProps = {
  particleCount?: number;
  beatIntensity?: number;
};

export const ParticleEffect = ({
  particleCount = 1000,
  beatIntensity = 0,
}: ParticleEffectProps) => {
  const pointsRef = useRef<Points>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const originalPositionsRef = useRef<Float32Array | null>(null);

  // パーティクルの初期位置と速度を生成
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // 同心円状の初期配置（文字の奥側）
      const angle = (i / particleCount) * Math.PI * 4; // 複数の円を作成
      const radius = 2 + Math.random() * 3; // 半径をランダムに
      const height = -5 - Math.random() * 2; // 奥側に配置

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius;
      positions[i3 + 2] = height;

      // 手前に向かう速度ベクトル
      const direction = new Vector3(
        Math.cos(angle) * 0.5, // 外側に広がる
        Math.sin(angle) * 0.5,
        1, // 手前に向かう
      ).normalize();

      velocities[i3] = direction.x * (0.02 + Math.random() * 0.03);
      velocities[i3 + 1] = direction.y * (0.02 + Math.random() * 0.03);
      velocities[i3 + 2] = direction.z * (0.05 + Math.random() * 0.05);
    }

    return { positions, velocities };
  }, [particleCount]);

  // 参照を保存
  velocitiesRef.current = velocities;
  originalPositionsRef.current = positions.slice();

  useFrame((state, delta) => {
    if (pointsRef.current && velocitiesRef.current) {
      const positions = pointsRef.current.geometry.attributes.position
        .array as Float32Array;
      const velocities = velocitiesRef.current;
      const time = state.clock.getElapsedTime();

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // ビートに合わせて速度を調整
        const speedMultiplier = 1 + beatIntensity * 2;

        // パーティクルを移動
        positions[i3] += velocities[i3] * speedMultiplier;
        positions[i3 + 1] += velocities[i3 + 1] * speedMultiplier;
        positions[i3 + 2] += velocities[i3 + 2] * speedMultiplier;

        // パーティクルが手前に来すぎたらリセット
        if (positions[i3 + 2] > 8) {
          const angle = (i / particleCount) * Math.PI * 4;
          const radius = 2 + Math.random() * 3;

          positions[i3] = Math.cos(angle) * radius;
          positions[i3 + 1] = Math.sin(angle) * radius;
          positions[i3 + 2] = -5 - Math.random() * 2;
        }

        // ビートに合わせた微細な振動
        if (beatIntensity > 0.1) {
          positions[i3] += Math.sin(time * 10 + i) * beatIntensity * 0.01;
          positions[i3 + 1] += Math.cos(time * 10 + i) * beatIntensity * 0.01;
        }
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05 + beatIntensity * 0.1}
        color="#4f46e5"
        transparent
        opacity={0.6 + beatIntensity * 0.4}
        sizeAttenuation
        blending={2} // AdditiveBlending
      />
    </points>
  );
};
