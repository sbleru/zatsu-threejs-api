import { FontData, Text3D } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
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
  nextStartTime?: number; // 次のphraseの開始時間
};

type BeatSyncText3DProps = {
  phrase: PhraseInfo | null;
  word: WordInfo | null;
  currentTime: number;
  beatIntensity: number;
  fontSize?: number;
  position?: [number, number, number];
};

type CharData = {
  char: string;
  position: Vector3;
  isHighlighted: boolean;
  scale: number;
  opacity: number;
  index: number;
};

export const AnimatedPhrase3D = ({
  phrase,
  word,
  currentTime,
  beatIntensity,
  fontSize = 0.4,
  position = [0, 2, 0],
}: BeatSyncText3DProps) => {
  const groupRef = useRef<Group>(null);
  const [chars, setChars] = useState<CharData[]>([]);
  const [phraseVisible, setPhraseVisible] = useState(false);
  const [calculatedPosition, setCalculatedPosition] =
    useState<[number, number, number]>(position);
  const [isPositionCalculated, setIsPositionCalculated] = useState(false);
  const [groupScale, setGroupScale] = useState(1);
  const { camera, size } = useThree();

  const animationStateRef = useRef({
    targetY: position[1],
    currentY: position[1],
  });

  // カメラの画角に基づいて位置を計算
  useEffect(() => {
    if (!camera || isPositionCalculated) return;

    // カメラの視野角から画面の境界を計算
    const distance = Math.abs(camera.position.z);
    const fov = "fov" in camera ? camera.fov : 50;
    const aspect = size.width / size.height;

    // 視野角から画面の高さと幅を計算
    const vFOV = (fov * Math.PI) / 180;
    const height = 2 * Math.tan(vFOV / 2) * distance;
    const width = height * aspect;

    // 中心よりやや上の位置を計算
    const centerX = 0; // 画面中央に配置
    const upperY = height * 0.15; // 画面高さの15%上の位置（中心よりやや上）

    setCalculatedPosition([centerX, upperY, position[2]]);
    setIsPositionCalculated(true);

    // アニメーション状態も更新
    animationStateRef.current.targetY = upperY;
    animationStateRef.current.currentY = upperY;
  }, [camera, size, fontSize, position, isPositionCalculated]);

  // フレーズが変更されたときの処理
  useEffect(() => {
    if (!phrase?.text) {
      setChars([]);
      setPhraseVisible(false);
      return;
    }

    const charList = phrase.text.split("");
    const charSpacing = fontSize * 2.0; // 文字間隔を広げてハイライト時の重なりを防ぐ

    // テキストを中央揃えにするため、全体の幅を計算して開始位置を調整
    const totalWidth = (charList.length - 1) * charSpacing;
    const startX = -totalWidth / 2;

    const newChars: CharData[] = charList.map((char, index) => ({
      char,
      position: new Vector3(startX + index * charSpacing, 0, 0),
      isHighlighted: false,
      scale: 1,
      opacity: 0,
      index,
    }));

    setChars(newChars);
    setPhraseVisible(true);

    // フレーズの幅を計算してスケールを調整
    const phraseWidth = charList.length * charSpacing;

    // カメラの視野角から利用可能な幅を計算
    if (camera && size.width && size.height) {
      const distance = Math.abs(camera.position.z);
      const fov = "fov" in camera ? camera.fov : 50;
      const aspect = size.width / size.height;

      const vFOV = (fov * Math.PI) / 180;
      const height = 2 * Math.tan(vFOV / 2) * distance;
      const width = height * aspect;

      // 余白を考慮した利用可能幅（画面幅の90%を使用してより余裕を持たせる）
      const availableWidth = width * 0.9;

      // スケールを計算（最小0.2、最大1.0）
      const calculatedScale = Math.min(
        1.0,
        Math.max(0.2, availableWidth / phraseWidth),
      );
      setGroupScale(calculatedScale);
    }

    // ビートに合わせて順次表示
    charList.forEach((_, index) => {
      setTimeout(() => {
        setChars((prev) =>
          prev.map((char, i) =>
            i === index ? { ...char, opacity: 1, scale: 1.1 } : char,
          ),
        );
      }, index * 50); // 文字ごとに50msずつ遅延
    });
  }, [phrase?.text, fontSize]);

  // phraseの終了処理
  useEffect(() => {
    if (!phrase || !phraseVisible) return;

    const handlePhraseEnd = () => {
      // 次のphraseとの時間間隔を計算
      const timeGap = phrase.nextStartTime
        ? phrase.nextStartTime - phrase.endTime
        : 1000;

      // 時間間隔が500ms未満の場合は従来の処理（パッと切り替え）
      if (timeGap < 500) {
        return;
      }

      // 十分な時間がある場合は左から一文字ずつ消すアニメーション
      const charCount = phrase.text.length;

      for (let i = 0; i < charCount; i++) {
        setTimeout(() => {
          setChars((prev) =>
            prev.map((char, index) =>
              index === i ? { ...char, opacity: 0, scale: 0.8 } : char,
            ),
          );
        }, i * 30); // 文字ごとに30msずつ遅延（表示より早く消す）
      }
    };

    // phraseの終了時間に合わせてアニメーションを開始
    const timeUntilEnd = phrase.endTime - currentTime;

    if (timeUntilEnd > 0 && timeUntilEnd <= 100) {
      // 終了100ms前から準備
      const timer = setTimeout(handlePhraseEnd, timeUntilEnd);
      return () => clearTimeout(timer);
    }
  }, [phrase, currentTime, phraseVisible]);

  // 現在の単語をハイライト（現在の再生時間を基準により正確に）
  useEffect(() => {
    if (!word?.text || !phrase?.text) {
      // 必要な情報がない場合は全てのハイライトを解除
      setChars((prev) =>
        prev.map((char) => ({
          ...char,
          isHighlighted: false,
          scale: char.opacity > 0 ? 1.1 : 1,
        })),
      );
      return;
    }

    // 現在の単語が実際に再生されているかチェック
    const isCurrentWordPlaying =
      currentTime >= word.startTime && currentTime <= word.endTime;

    if (!isCurrentWordPlaying) {
      // 現在の単語が再生されていない場合はハイライトを解除
      setChars((prev) =>
        prev.map((char) => ({
          ...char,
          isHighlighted: false,
          scale: char.opacity > 0 ? 1.1 : 1,
        })),
      );
      return;
    }

    // フレーズ内で同じテキストが複数回出現する場合の処理
    const wordOccurrences: number[] = [];
    let searchIndex = 0;
    while (true) {
      const foundIndex = phrase.text.indexOf(word.text, searchIndex);
      if (foundIndex === -1) break;
      wordOccurrences.push(foundIndex);
      searchIndex = foundIndex + 1;
    }

    if (wordOccurrences.length === 0) {
      setChars((prev) =>
        prev.map((char) => ({
          ...char,
          isHighlighted: false,
          scale: char.opacity > 0 ? 1.1 : 1,
        })),
      );
      return;
    }

    // 複数の候補がある場合は、現在の再生時間を基準に最適な候補を選択
    let wordStartIndex = wordOccurrences[0]; // デフォルトは最初の出現位置

    if (wordOccurrences.length > 1) {
      // フレーズ内での現在の再生時間の進行率を計算
      const phraseProgress = Math.max(
        0,
        Math.min(
          1,
          (currentTime - phrase.startTime) /
            (phrase.endTime - phrase.startTime),
        ),
      );

      // 進行率に基づいて推定される文字位置を計算
      const estimatedCharPosition = Math.floor(
        phrase.text.length * phraseProgress,
      );

      // 推定位置に最も近い候補を選択
      let bestCandidate = wordOccurrences[0];
      let minDistance = Math.abs(estimatedCharPosition - bestCandidate);

      for (const candidate of wordOccurrences) {
        const distance = Math.abs(estimatedCharPosition - candidate);
        if (distance < minDistance) {
          minDistance = distance;
          bestCandidate = candidate;
        }
      }

      wordStartIndex = bestCandidate;
    }

    const wordEndIndex = wordStartIndex + word.text.length - 1;

    setChars((prev) =>
      prev.map((char, index) => {
        const isInWord = index >= wordStartIndex && index <= wordEndIndex;

        return {
          ...char,
          isHighlighted: isInWord,
          scale: isInWord ? 1.3 : char.opacity > 0 ? 1.1 : 1,
        };
      }),
    );
  }, [word, phrase, currentTime]);

  // ビートに合わせたアニメーション
  useEffect(() => {
    if (beatIntensity > 0.3) {
      animationStateRef.current.targetY =
        calculatedPosition[1] + beatIntensity * 0.5;

      // ハイライトされた単語のスケールを調整
      setChars((prev) =>
        prev.map((char) => ({
          ...char,
          scale: char.isHighlighted
            ? 1.3 + beatIntensity * 0.3
            : 1 + beatIntensity * 0.1,
        })),
      );
    } else {
      animationStateRef.current.targetY = calculatedPosition[1];
    }
  }, [beatIntensity, calculatedPosition]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // スムーズなY軸移動
    const smoothFactor = delta * 8;
    animationStateRef.current.currentY +=
      (animationStateRef.current.targetY - animationStateRef.current.currentY) *
      smoothFactor;

    groupRef.current.position.y = animationStateRef.current.currentY;

    // 軽微な浮遊効果
    const time = state.clock.getElapsedTime();
    const floatOffset = Math.sin(time * 1.5) * 0.05;
    groupRef.current.position.y += floatOffset;

    // ビートに合わせた全体的な振動
    if (beatIntensity > 0.2) {
      const vibration = Math.sin(time * 20) * beatIntensity * 0.02;
      groupRef.current.position.z = calculatedPosition[2] + vibration;
    }
  });

  if (!phraseVisible || chars.length === 0) return null;

  return (
    <group ref={groupRef} position={calculatedPosition} scale={groupScale}>
      {chars.map((char, index) => (
        <group key={`${phrase?.text}-${index}`} position={char.position}>
          {/* カラフルなボーダー効果用の文字（複数レイヤー） */}
          {/* 外側のボーダー（白） - 文字が十分に表示されている時のみ */}
          {/* {char.opacity > 0.8 && (
            <Text3D
              font={notoSansJp as unknown as FontData}
              size={fontSize * char.scale * 1.1}
              height={0.13}
              curveSegments={8}
              bevelEnabled
              bevelThickness={0.02}
              bevelSize={0.01}
              bevelSegments={3}
              position={[0, 0, -0.08]}
            >
              {char.char}
              <meshStandardMaterial
                color="#ff6b6b"
                transparent
                opacity={char.opacity}
                emissive="#ff6b6b"
                emissiveIntensity={0.4}
              />
            </Text3D>
          )} */}

          {/* メインの歌詞文字 */}
          <Text3D
            font={notoSansJp as unknown as FontData}
            size={fontSize * char.scale}
            height={0.15}
            curveSegments={8}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.01}
            bevelSegments={3}
          >
            {char.char}
            <meshStandardMaterial
              color={char.isHighlighted ? "#4ecdc4" : "#4ecdc4"}
              transparent
              opacity={char.opacity}
              emissive={char.isHighlighted ? "#4ecdc4" : "#1a4d4d"}
              emissiveIntensity={char.isHighlighted ? 0.4 : 0.2}
            />
          </Text3D>

          {/* ハイライト時の光の効果 */}
          {char.isHighlighted && beatIntensity > 0.2 && (
            <pointLight
              position={[0, 0, 1]}
              intensity={beatIntensity * 1.5}
              color="#ff6b6b"
              distance={5}
            />
          )}
        </group>
      ))}

      {/* 全体的な雰囲気作りのライト */}
      <pointLight
        position={[0, 2, 2]}
        intensity={0.5 + beatIntensity * 0.3}
        color="#4ecdc4"
        distance={8}
      />
    </group>
  );
};
