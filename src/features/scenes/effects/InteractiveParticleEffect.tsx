import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, Points } from "three";

type InteractiveParticleEffectProps = {
  particleCount?: number;
  beatIntensity?: number;
  char?: string;
  word?: string;
  phrase?: string;
};

export const InteractiveParticleEffect = ({
  particleCount = 1200,
  beatIntensity = 0,
  char = "",
  word = "",
  phrase = "",
}: InteractiveParticleEffectProps) => {
  const pointsRef = useRef<Points>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const originalPositionsRef = useRef<Float32Array | null>(null);
  const colorsRef = useRef<Float32Array | null>(null);
  const sizesRef = useRef<Float32Array | null>(null);
  const twinklePhaseRef = useRef<Float32Array | null>(null);
  const previousCharRef = useRef<string>("");
  const previousWordRef = useRef<string>("");
  const previousPhraseRef = useRef<string>("");

  // パーティクルの初期設定
  const { positions, velocities, colors, sizes, twinklePhases } =
    useMemo(() => {
      const positions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      const twinklePhases = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // 広範囲にランダム配置（星空のように）
        positions[i3] = (Math.random() - 0.5) * 20;
        positions[i3 + 1] = (Math.random() - 0.5) * 15;
        positions[i3 + 2] = (Math.random() - 0.5) * 15;

        // 非常にゆっくりとした動き
        velocities[i3] = (Math.random() - 0.5) * 0.002;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.002;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.001;

        // 星のような色（白、薄い青、薄い黄色）
        const colorType = Math.random();
        let baseColor;
        if (colorType < 0.4) {
          baseColor = new Color("#ffffff"); // 白
        } else if (colorType < 0.7) {
          baseColor = new Color("#e0f2fe"); // 薄い青
        } else {
          baseColor = new Color("#fefce8"); // 薄い黄色
        }

        colors[i3] = baseColor.r;
        colors[i3 + 1] = baseColor.g;
        colors[i3 + 2] = baseColor.b;

        // 様々なサイズの星
        sizes[i] = 0.02 + Math.random() * 0.08;

        // 煌めきの位相をランダムに
        twinklePhases[i] = Math.random() * Math.PI * 2;
      }

      return { positions, velocities, colors, sizes, twinklePhases };
    }, [particleCount]);

  // 参照を保存
  velocitiesRef.current = velocities;
  originalPositionsRef.current = positions.slice();
  colorsRef.current = colors;
  sizesRef.current = sizes;
  twinklePhaseRef.current = twinklePhases;

  useFrame((state, delta) => {
    if (
      pointsRef.current &&
      velocitiesRef.current &&
      colorsRef.current &&
      sizesRef.current &&
      twinklePhaseRef.current
    ) {
      const positions = pointsRef.current.geometry.attributes.position
        .array as Float32Array;
      const velocities = velocitiesRef.current;
      const colors = colorsRef.current;
      const sizes = sizesRef.current;
      const twinklePhases = twinklePhaseRef.current;
      const time = state.clock.getElapsedTime();

      // 文字変化の検出（爆発エフェクトなし）
      if (char !== previousCharRef.current && char) {
        previousCharRef.current = char;
      }

      if (word !== previousWordRef.current && word) {
        previousWordRef.current = word;
      }

      if (phrase !== previousPhraseRef.current && phrase) {
        previousPhraseRef.current = phrase;
      }

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // ビートに合わせた基本的な動き
        const beatMultiplier = 1 + beatIntensity * 2;
        positions[i3] += velocities[i3] * beatMultiplier;
        positions[i3 + 1] += velocities[i3 + 1] * beatMultiplier;
        positions[i3 + 2] += velocities[i3 + 2] * beatMultiplier;

        // 境界でリセット（星空の範囲を維持）
        if (Math.abs(positions[i3]) > 12) {
          positions[i3] = (Math.random() - 0.5) * 20;
          velocities[i3] = (Math.random() - 0.5) * 0.002;
        }
        if (Math.abs(positions[i3 + 1]) > 10) {
          positions[i3 + 1] = (Math.random() - 0.5) * 15;
          velocities[i3 + 1] = (Math.random() - 0.5) * 0.002;
        }
        if (Math.abs(positions[i3 + 2]) > 10) {
          positions[i3 + 2] = (Math.random() - 0.5) * 15;
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.001;
        }

        // 星の煌めき効果
        const twinkleSpeed = 2 + Math.sin(i * 0.1) * 1.5;
        const twinkleIntensity =
          Math.sin(time * twinkleSpeed + twinklePhases[i]) * 0.5 + 0.5;

        // ビートに合わせて煌めきが強くなる
        const beatTwinkle = beatIntensity > 0.3 ? beatIntensity * 0.8 : 0;
        const finalTwinkle = Math.min(twinkleIntensity + beatTwinkle, 1.0);

        // サイズの煌めき
        const baseSizeIndex = Math.floor(i / 3);
        const baseSize = 0.02 + ((baseSizeIndex % 100) / 100) * 0.08;
        sizes[i] = baseSize * (0.3 + finalTwinkle * 1.2);

        // 色の煌めき（明度の変化）
        const originalColor = new Color(
          colorsRef.current[i3],
          colorsRef.current[i3 + 1],
          colorsRef.current[i3 + 2],
        );

        // HSL変換して明度を調整
        const hsl = { h: 0, s: 0, l: 0 };
        originalColor.getHSL(hsl);

        const twinkledColor = new Color().setHSL(
          hsl.h,
          hsl.s,
          Math.min(hsl.l * (0.4 + finalTwinkle * 1.2), 1.0),
        );

        colors[i3] = twinkledColor.r;
        colors[i3 + 1] = twinkledColor.g;
        colors[i3 + 2] = twinkledColor.b;

        // ビートに合わせた波動効果
        if (beatIntensity > 0.3) {
          const waveOffset = Math.sin(time * 8 + i * 0.1) * beatIntensity * 0.2;
          positions[i3] += Math.sin(time * 5 + i * 0.05) * waveOffset;
          positions[i3 + 1] += Math.cos(time * 5 + i * 0.05) * waveOffset;
        }

        // 歌詞データに基づく特別な煌めき
        if (char && Math.random() < 0.01) {
          colors[i3] = Math.min(colors[i3] + 0.3, 1.0);
          colors[i3 + 1] = Math.min(colors[i3 + 1] + 0.2, 1.0);
          sizes[i] *= 1.5;
        }
      }

      // ジオメトリの更新
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.color.needsUpdate = true;
      pointsRef.current.geometry.attributes.size.needsUpdate = true;
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
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={2} // AdditiveBlending
      />
    </points>
  );
};
