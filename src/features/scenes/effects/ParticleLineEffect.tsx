import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { LineSegments, Vector3 } from "three";

type ParticleEffectProps = {
  particleCount?: number;
  beatIntensity?: number;
  lineLength?: number;
};

export const ParticleEffect = ({
  particleCount = 500, // 線の数を少し減らす
  beatIntensity = 0,
  lineLength = 1.5, // 線の長さを長くする
}: ParticleEffectProps) => {
  const lineSegmentsRef = useRef<LineSegments>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const originalPositionsRef = useRef<Float32Array | null>(null);

  // 線パーティクルの初期位置と速度を生成
  const { positions, velocities } = useMemo(() => {
    // 各線は2つの頂点（開始点と終了点）を持つため、頂点数は particleCount * 2
    const positions = new Float32Array(particleCount * 2 * 3); // 2頂点 * 3座標
    const velocities = new Float32Array(particleCount * 3); // 線ごとの速度ベクトル

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const i6 = i * 6; // positions配列での開始インデックス（2頂点分）

      // 同心円状の初期配置（文字の奥側）
      const angle = (i / particleCount) * Math.PI * 4; // 複数の円を作成
      const radius = 2 + Math.random() * 3; // 半径をランダムに
      const height = -5 - Math.random() * 2; // 奥側に配置

      // 線の開始点
      const startX = Math.cos(angle) * radius;
      const startY = Math.sin(angle) * radius;
      const startZ = height;

      // 手前に向かう方向ベクトル
      const direction = new Vector3(
        Math.cos(angle) * 0.5, // 外側に広がる
        Math.sin(angle) * 0.5,
        1, // 手前に向かう
      ).normalize();

      // 線の終了点（開始点から lineLength 分だけ進行方向に延ばす）
      const endX = startX - direction.x * lineLength;
      const endY = startY - direction.y * lineLength;
      const endZ = startZ - direction.z * lineLength;

      // 開始点の座標を設定
      positions[i6] = startX;
      positions[i6 + 1] = startY;
      positions[i6 + 2] = startZ;

      // 終了点の座標を設定
      positions[i6 + 3] = endX;
      positions[i6 + 4] = endY;
      positions[i6 + 5] = endZ;

      // 速度ベクトル（線全体の移動速度）
      velocities[i3] = direction.x * (0.02 + Math.random() * 0.03);
      velocities[i3 + 1] = direction.y * (0.02 + Math.random() * 0.03);
      velocities[i3 + 2] = direction.z * (0.05 + Math.random() * 0.05);
    }

    return { positions, velocities };
  }, [particleCount, lineLength]);

  // 参照を保存
  velocitiesRef.current = velocities;
  originalPositionsRef.current = positions.slice();

  useFrame((state, delta) => {
    if (lineSegmentsRef.current && velocitiesRef.current) {
      const positions = lineSegmentsRef.current.geometry.attributes.position
        .array as Float32Array;
      const velocities = velocitiesRef.current;
      const time = state.clock.getElapsedTime();

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const i6 = i * 6;

        // ビートに合わせて速度を調整
        const speedMultiplier = 1 + beatIntensity * 2;

        // 線の両端を同じ速度で移動
        const deltaX = velocities[i3] * speedMultiplier;
        const deltaY = velocities[i3 + 1] * speedMultiplier;
        const deltaZ = velocities[i3 + 2] * speedMultiplier;

        // 開始点を移動
        positions[i6] += deltaX;
        positions[i6 + 1] += deltaY;
        positions[i6 + 2] += deltaZ;

        // 終了点を移動
        positions[i6 + 3] += deltaX;
        positions[i6 + 4] += deltaY;
        positions[i6 + 5] += deltaZ;

        // 線が手前に来すぎたらリセット
        if (positions[i6 + 2] > 8) {
          // 開始点のZ座標をチェック
          const angle = (i / particleCount) * Math.PI * 4;
          const radius = 2 + Math.random() * 3;
          const height = -5 - Math.random() * 2;

          const startX = Math.cos(angle) * radius;
          const startY = Math.sin(angle) * radius;
          const startZ = height;

          const direction = new Vector3(
            Math.cos(angle) * 0.5,
            Math.sin(angle) * 0.5,
            1,
          ).normalize();

          const endX = startX - direction.x * lineLength;
          const endY = startY - direction.y * lineLength;
          const endZ = startZ - direction.z * lineLength;

          // 開始点をリセット
          positions[i6] = startX;
          positions[i6 + 1] = startY;
          positions[i6 + 2] = startZ;

          // 終了点をリセット
          positions[i6 + 3] = endX;
          positions[i6 + 4] = endY;
          positions[i6 + 5] = endZ;
        }

        // ビートに合わせた微細な振動
        if (beatIntensity > 0.1) {
          const vibrationX = Math.sin(time * 10 + i) * beatIntensity * 0.01;
          const vibrationY = Math.cos(time * 10 + i) * beatIntensity * 0.01;

          // 開始点に振動を追加
          positions[i6] += vibrationX;
          positions[i6 + 1] += vibrationY;

          // 終了点に振動を追加
          positions[i6 + 3] += vibrationX;
          positions[i6 + 4] += vibrationY;
        }
      }

      lineSegmentsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <lineSegments ref={lineSegmentsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount * 2} // 各線は2つの頂点
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#4f46e5"
        transparent
        opacity={0.7 + beatIntensity * 0.3}
        linewidth={3 + beatIntensity * 4} // 線を太くして、ビートに合わせてさらに太くする
      />
    </lineSegments>
  );
};
