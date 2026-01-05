import { FontData, Text3D } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Group, Vector3 } from "three";

import notoSansJp from "../../assets/fonts/Noto_Sans_JP_Regular.json";

type WordInfo = {
  text: string;
  startTime: number;
  endTime: number;
};

type PhraseInfo = {
  text: string;
  startTime: number;
  endTime: number;
  nextStartTime?: number;
};

type FlowingLyrics3DProps = {
  phrase: PhraseInfo | null;
  word: WordInfo | null;
  currentTime: number;
  beatIntensity: number;
  fontSize?: number;
};

type CircularPhrase = {
  id: string;
  text: string;
  chars: CircularChar[];
  isActive: boolean;
  createdAt: number;
  radius: number;
  yOffset: number;
  zOffset: number;
  startAngle: number; // 開始角度を記録
  endAngle: number; // 終了角度を記録
};

type CircularChar = {
  char: string;
  angle: number;
  position: Vector3;
  targetPosition: Vector3;
  opacity: number;
  scale: number;
  isHighlighted: boolean;
  isMovingForward: boolean;
  forwardProgress: number;
  wasHighlighted: boolean; // 一度でもハイライトされたかのフラグ
};

// 中央の暗い部分により集中した配置パラメータ
const MODEL_RADIUS = 2.0; // さらに縮小
const CIRCLE_LAYERS = 3; // 層数を増やして重なりを減らす
const MAX_PHRASES = 4; // フレーズ数も減らして見やすく
const MIN_ANGLE_GAP = 0.3; // フレーズ間の最小角度間隔

/**
 * 歌詞をモデルの周りに円状に配置して流れるように表示するコンポーネント
 * FIXME: ハイライトされる時間が短くて消えない文字がたまに発生する
 */
export const FlowingLyrics3D = ({
  phrase,
  word,
  currentTime,
  beatIntensity,
  fontSize = 0.28, // フォントサイズを少し小さく
}: FlowingLyrics3DProps) => {
  const groupRef = useRef<Group>(null);
  const [circularPhrases, setCircularPhrases] = useState<CircularPhrase[]>([]);
  const lastPhraseRef = useRef<string>("");
  const frameCountRef = useRef(0);

  // 角度の重複チェック関数
  const checkAngleOverlap = useCallback(
    (
      newStartAngle: number,
      newEndAngle: number,
      existingPhrases: CircularPhrase[],
      newRadius: number,
    ) => {
      return existingPhrases.some((phrase) => {
        // 同じ層（半径が近い）のフレーズのみチェック
        if (Math.abs(phrase.radius - newRadius) > 0.5) return false;

        // 角度の正規化
        const normalizeAngle = (angle: number) => {
          while (angle < 0) angle += Math.PI * 2;
          while (angle >= Math.PI * 2) angle -= Math.PI * 2;
          return angle;
        };

        const existingStart = normalizeAngle(phrase.startAngle);
        const existingEnd = normalizeAngle(phrase.endAngle);
        const newStart = normalizeAngle(newStartAngle);
        const newEnd = normalizeAngle(newEndAngle);

        // 重複チェック
        return (
          (newStart >= existingStart - MIN_ANGLE_GAP &&
            newStart <= existingEnd + MIN_ANGLE_GAP) ||
          (newEnd >= existingStart - MIN_ANGLE_GAP &&
            newEnd <= existingEnd + MIN_ANGLE_GAP) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        );
      });
    },
    [],
  );

  // 新しいフレーズを円状に配置（重複を避けて）
  const generateCircularPhrase = useCallback(
    (phraseText: string, existingPhrases: CircularPhrase[]) => {
      const charList = phraseText
        .split("")
        .filter((char) => char.trim() !== "");

      // フレーズの長さに応じて円の半径と配置を調整
      const charCount = charList.length;

      // 文字間の角度を計算（より密集させる）
      const maxAngle = Math.min(Math.PI * 1.2, charCount * 0.2); // 最大216度、さらに密集

      // 重複しない位置を探す
      let attempts = 0;
      let layerIndex, radius, startAngle;

      do {
        layerIndex = Math.floor(Math.random() * CIRCLE_LAYERS);
        radius = MODEL_RADIUS + layerIndex * 0.1; // 層間の距離をさらに縮小
        startAngle = Math.random() * Math.PI * 2; // ランダムな開始角度
        attempts++;
      } while (
        attempts < 20 &&
        checkAngleOverlap(
          startAngle,
          startAngle + maxAngle,
          existingPhrases,
          radius,
        )
      );

      const yOffset = (Math.random() - 0.5) * 0.8; // Y軸のオフセットをさらに縮小
      const zOffset = (Math.random() - 0.5) * 0.4; // Z軸のオフセットをさらに縮小

      const angleStep = maxAngle / Math.max(charCount - 1, 1);
      const adjustedStartAngle = startAngle - maxAngle / 2;

      const chars: CircularChar[] = charList.map((char, index) => {
        const angle = adjustedStartAngle + angleStep * index;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 1.0 + yOffset; // Y軸の潰しを0.9に調整（より円に近く）
        const z = zOffset;

        return {
          char,
          angle,
          position: new Vector3(x, y, z),
          targetPosition: new Vector3(x * 1.6, y + 1.5, z + 5), // 手前への移動距離を調整
          opacity: 0.7,
          scale: 1,
          isHighlighted: false,
          isMovingForward: false,
          forwardProgress: 0,
          wasHighlighted: false,
        };
      });

      return {
        id: `phrase-${Date.now()}`,
        text: phraseText,
        chars,
        isActive: false,
        createdAt: Date.now(),
        radius,
        yOffset,
        zOffset,
        startAngle: adjustedStartAngle,
        endAngle: adjustedStartAngle + maxAngle,
      };
    },
    [checkAngleOverlap],
  );

  // 新しいフレーズが来たときの処理
  useEffect(() => {
    if (!phrase?.text || phrase.text === lastPhraseRef.current) return;

    setCircularPhrases((prev) => {
      const newPhrase = generateCircularPhrase(phrase.text, prev);
      const newPhrases = [...prev, newPhrase];
      // 最大フレーズ数を制限
      return newPhrases.length > MAX_PHRASES
        ? newPhrases.slice(-MAX_PHRASES)
        : newPhrases;
    });

    lastPhraseRef.current = phrase.text;
  }, [phrase?.text, generateCircularPhrase]);

  const highlightedCharIndices = useMemo(() => {
    if (!word?.text || !phrase?.text) return new Set<number>();

    const isCurrentWordPlaying =
      currentTime >= word.startTime && currentTime <= word.endTime;

    if (!isCurrentWordPlaying) return new Set<number>();

    const wordStartIndex = phrase.text.indexOf(word.text);
    if (wordStartIndex === -1) return new Set<number>();

    const wordEndIndex = wordStartIndex + word.text.length - 1;
    const indices = new Set<number>();

    for (let i = wordStartIndex; i <= wordEndIndex; i++) {
      indices.add(i);
    }

    return indices;
  }, [word, phrase, currentTime]);

  // フレームごとの更新
  useFrame((state, delta) => {
    frameCountRef.current++;

    // 30FPSで更新
    if (frameCountRef.current % 2 !== 0) return;

    const now = Date.now();
    const time = state.clock.getElapsedTime();

    setCircularPhrases((prev) =>
      prev.filter((circularPhrase) => {
        const age = now - circularPhrase.createdAt;
        const maxAge = 5000; // 5秒で完全削除（短縮）

        // 手前に移動中の文字がある場合、それらが完全に消えるまで待つ
        const hasMovingChars = circularPhrase.chars.some(
          (char) => char.isMovingForward,
        );
        const hasVisibleChars = circularPhrase.chars.some(
          (char) => char.opacity > 0.01,
        );

        // 時間切れまたは全ての文字が見えなくなったら削除
        if (age > maxAge || (!hasVisibleChars && !hasMovingChars)) {
          return false;
        }

        // アクティブなフレーズかどうかを判定
        const isActive = circularPhrase.text === phrase?.text;
        circularPhrase.isActive = isActive;

        // 各文字の更新
        circularPhrase.chars.forEach((char, index) => {
          // ハイライト状態を更新
          const isHighlighted = isActive && highlightedCharIndices.has(index);
          char.isHighlighted = isHighlighted;

          // 一度でもハイライトされたらフラグを立てる
          if (isHighlighted) {
            char.wasHighlighted = true;
          }

          // ハイライトされた文字は手前に移動開始
          if (isHighlighted && !char.isMovingForward) {
            char.isMovingForward = true;
            char.forwardProgress = 0;
          }

          // 手前への移動処理
          if (char.isMovingForward) {
            char.forwardProgress += delta * 3.0; // 移動速度をさらに上げる
            const progress = Math.min(char.forwardProgress, 1);

            // イージング関数
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            // 位置を補間
            char.position.lerpVectors(
              new Vector3(
                Math.cos(char.angle) * circularPhrase.radius,
                Math.sin(char.angle) * circularPhrase.radius * 1.0 +
                  circularPhrase.yOffset,
                circularPhrase.zOffset,
              ),
              char.targetPosition,
              easeProgress,
            );

            // 単語の再生が終わっているかチェック
            const isWordEnded = !word || currentTime > word.endTime;

            // 透明度の変化を改善（単語の再生が終わってから開始）
            if (!isWordEnded) {
              // 単語の再生中は明るく保つ
              char.opacity = 1.2;
            } else {
              // 単語の再生が終わったら透明度変化を開始
              if (progress < 0.1) {
                char.opacity = 1.2; // 最初は明るく保つ
              } else if (progress > 0.4) {
                // より早くフェードアウト開始
                const fadeProgress = (progress - 0.4) / 0.6;
                char.opacity = Math.max(
                  0,
                  1.2 * (1 - fadeProgress * fadeProgress),
                ); // 二次関数でより急激に
              } else {
                char.opacity = 1.2;
              }

              // 完全に透明になったら非表示
              if (progress >= 1.0) {
                char.opacity = 0;
              }
            }

            // スケールの変化
            if (progress < 0.8) {
              char.scale = 1 + Math.sin(progress * Math.PI) * 0.4;
            } else {
              // 最後は縮小して消える
              const shrinkProgress = (progress - 0.8) / 0.2;
              char.scale =
                (1 + Math.sin(0.8 * Math.PI) * 0.4) * (1 - shrinkProgress);
            }
          } else {
            // 円状配置での通常の動き（ゆっくり回転）
            const rotationSpeed = 0.03; // 回転速度をさらに遅く
            const rotatedAngle = char.angle + time * rotationSpeed;

            char.position.set(
              Math.cos(rotatedAngle) * circularPhrase.radius,
              Math.sin(rotatedAngle) * circularPhrase.radius * 1.0 +
                circularPhrase.yOffset,
              circularPhrase.zOffset,
            );

            // 非アクティブなフレーズは時間と共に薄くなる
            if (!isActive) {
              const fadeStartTime = 3000; // 3秒後からフェード開始
              if (age > fadeStartTime) {
                const fadeProgress =
                  (age - fadeStartTime) / (maxAge - fadeStartTime);
                char.opacity = Math.max(0, 0.5 * (1 - fadeProgress));
              } else {
                char.opacity = 0.5;
              }
              char.scale = 0.85;
            } else {
              // アクティブなフレーズでも、一度もハイライトされていない文字は時間経過で薄くする
              if (!char.wasHighlighted && age > 3000) {
                const fadeProgress = (age - 3000) / 2000; // 2秒かけてフェード
                char.opacity = Math.max(0.3, 0.9 * (1 - fadeProgress));
                char.scale = Math.max(0.8, 1.1 * (1 - fadeProgress * 0.3));
              } else {
                char.opacity = 0.9;
                char.scale = 1.1;
              }
            }
          }

          // ビートに合わせた軽微な変化
          if (beatIntensity > 0.3 && isActive && !char.isMovingForward) {
            char.scale *= 1 + beatIntensity * 0.1;
          }
        });

        return true;
      }),
    );

    // 全体的な浮遊効果を最小限に
    if (groupRef.current) {
      const floatOffset = Math.sin(time * 0.1) * 0.005;
      groupRef.current.position.y = floatOffset;
    }
  });

  // メモ化されたマテリアル（コントラストを強化）
  const materials = useMemo(
    () => ({
      normal: {
        color: "#4ecdc4",
        emissive: "#4ecdc4",
        emissiveIntensity: 0.15,
      },
      active: {
        color: "#66d9ef",
        emissive: "#66d9ef",
        emissiveIntensity: 0.5,
      },
      highlighted: {
        color: "#ff6b6b",
        emissive: "#ff6b6b",
        emissiveIntensity: 1.0, // より強い発光
      },
    }),
    [],
  );

  if (circularPhrases.length === 0) return null;

  return (
    <group ref={groupRef}>
      {circularPhrases.map((circularPhrase) => (
        <group key={circularPhrase.id}>
          {circularPhrase.chars.map((char, index) => {
            // 透明度が極めて低い場合は描画しない
            if (char.opacity < 0.01) return null;

            let material;
            if (char.isHighlighted) {
              material = materials.highlighted;
            } else if (circularPhrase.isActive) {
              material = materials.active;
            } else {
              material = materials.normal;
            }

            return (
              <group
                key={`${circularPhrase.id}-${index}`}
                position={char.position}
                scale={char.scale}
              >
                {/* 3Dテキスト */}
                <Text3D
                  font={notoSansJp as unknown as FontData}
                  size={fontSize}
                  height={0.05}
                  curveSegments={4}
                  bevelEnabled={false}
                >
                  {char.char}
                  <meshStandardMaterial
                    color={material.color}
                    transparent
                    opacity={char.opacity}
                    emissive={material.emissive}
                    emissiveIntensity={material.emissiveIntensity}
                    alphaTest={0.01} // 極めて透明な部分は描画しない
                  />
                </Text3D>

                {/* ハイライト時の光の効果 */}
                {char.isHighlighted && char.opacity > 0.1 && (
                  <pointLight
                    position={[0, 0, 0.5]}
                    intensity={2.0 * char.opacity} // 透明度に応じて光も弱くする
                    color="#ff6b6b"
                    distance={3}
                  />
                )}

                {/* アクティブフレーズの雰囲気ライト */}
                {circularPhrase.isActive &&
                  !char.isMovingForward &&
                  char.opacity > 0.1 && (
                    <pointLight
                      position={[0, 0, 0.2]}
                      intensity={0.3 * char.opacity} // 透明度に応じて光も弱くする
                      color="#66d9ef"
                      distance={1.2}
                    />
                  )}
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
};
