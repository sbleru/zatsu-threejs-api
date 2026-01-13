import { useFrame, useLoader } from "@react-three/fiber";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/**
 * AnimationActionのコントロール用コンテキスト
 */
interface AnimationActionContextType {
  mixer: THREE.AnimationMixer;
  actionRefs: React.MutableRefObject<THREE.AnimationAction[]>;
  currentActionIndex: number;
  setCurrentActionIndex: (index: number) => void;
  timeScale: number;
  setTimeScale: (value: number) => void;
  weight: number;
  setWeight: (value: number) => void;
  loopMode: THREE.AnimationActionLoopStyles;
  setLoopMode: (mode: THREE.AnimationActionLoopStyles) => void;
  repetitions: number;
  setRepetitions: (value: number) => void;
  clampWhenFinished: boolean;
  setClampWhenFinished: (value: boolean) => void;
  isPaused: boolean;
  setIsPaused: (value: boolean) => void;
  fadeDuration: number;
  setFadeDuration: (value: number) => void;
  warpStartScale: number;
  setWarpStartScale: (value: number) => void;
  warpEndScale: number;
  setWarpEndScale: (value: number) => void;
  warpDuration: number;
  setWarpDuration: (value: number) => void;
  handlePlay: () => void;
  handleStop: () => void;
  handleReset: () => void;
  handleFadeIn: () => void;
  handleFadeOut: () => void;
  handleStopFading: () => void;
  handleCrossFade: () => void;
  handleWarp: () => void;
  handleStopWarping: () => void;
  handleHalt: () => void;
  handleSyncWith: () => void;
  currentAction: THREE.AnimationAction | null;
}

export const AnimationActionContext =
  createContext<AnimationActionContextType | null>(null);

/**
 * AnimationActionの状態管理とContext Provider
 *
 * モデルについて
 * - hatsune_miku
 *   1 animationのみが存在する
 */
export const AnimationActionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { scene, animations } = useLoader(
    GLTFLoader,
    "/models/hatsune_miku.glb",
  );
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);

  // 複数のアクションを管理
  const actionRefs = useRef<THREE.AnimationAction[]>([]);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);

  // コントロール用の状態
  const [timeScale, setTimeScale] = useState(1);
  const [weight, setWeight] = useState(1);
  const [loopMode, setLoopMode] = useState<THREE.AnimationActionLoopStyles>(
    THREE.LoopRepeat,
  );
  const [repetitions, setRepetitions] = useState(Infinity);
  const [clampWhenFinished, setClampWhenFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [fadeDuration, setFadeDuration] = useState(1);
  const [warpStartScale, setWarpStartScale] = useState(1);
  const [warpEndScale, setWarpEndScale] = useState(2);
  const [warpDuration, setWarpDuration] = useState(2);

  // アニメーションの初期化
  useEffect(() => {
    if (animations.length > 0) {
      // 利用可能なすべてのアニメーションクリップからアクションを作成
      const actions = animations.map((clip) => {
        const action = mixer.clipAction(clip);
        actionRefs.current.push(action);
        return action;
      });

      // 最初のアクションを再生
      if (actions.length > 0) {
        actions[0].play();
      }
    }

    return () => {
      // クリーンアップ
      actionRefs.current.forEach((action) => {
        action.stop();
        action.reset();
      });
      actionRefs.current = [];
    };
  }, [mixer, animations]);

  // 現在のアクションを取得
  const currentAction = actionRefs.current[currentActionIndex] || null;

  // timeScaleの更新
  useEffect(() => {
    if (currentAction) {
      currentAction.timeScale = timeScale;
    }
  }, [timeScale, currentAction]);

  // weightの更新
  useEffect(() => {
    if (currentAction) {
      currentAction.weight = weight;
    }
  }, [weight, currentAction]);

  // loopModeの更新
  useEffect(() => {
    if (currentAction) {
      currentAction.setLoop(loopMode, repetitions);
    }
  }, [loopMode, repetitions, currentAction]);

  // clampWhenFinishedの更新
  useEffect(() => {
    if (currentAction) {
      currentAction.clampWhenFinished = clampWhenFinished;
    }
  }, [clampWhenFinished, currentAction]);

  // pausedの更新
  useEffect(() => {
    if (currentAction) {
      currentAction.paused = isPaused;
    }
  }, [isPaused, currentAction]);

  // メソッドの実行関数
  const handlePlay = () => {
    if (currentAction) {
      currentAction.play();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    if (currentAction) {
      currentAction.stop();
    }
  };

  const handleReset = () => {
    if (currentAction) {
      currentAction.reset();
    }
  };

  const handleFadeIn = () => {
    if (currentAction) {
      currentAction.fadeIn(fadeDuration);
    }
  };

  const handleFadeOut = () => {
    if (currentAction) {
      currentAction.fadeOut(fadeDuration);
    }
  };

  const handleStopFading = () => {
    if (currentAction) {
      currentAction.stopFading();
    }
  };

  const handleCrossFade = () => {
    if (actionRefs.current.length > 1 && currentAction) {
      const nextIndex = (currentActionIndex + 1) % actionRefs.current.length;
      const nextAction = actionRefs.current[nextIndex];

      if (nextAction) {
        // 現在のアクションから次のアクションへクロスフェード
        currentAction.crossFadeTo(nextAction, fadeDuration, false);
        setCurrentActionIndex(nextIndex);
      }
    }
  };

  const handleWarp = () => {
    if (currentAction) {
      currentAction.warp(warpStartScale, warpEndScale, warpDuration);
    }
  };

  const handleStopWarping = () => {
    if (currentAction) {
      currentAction.stopWarping();
    }
  };

  const handleHalt = () => {
    if (currentAction) {
      currentAction.halt(fadeDuration);
    }
  };

  const handleSyncWith = () => {
    if (actionRefs.current.length > 1 && currentAction) {
      const otherIndex = (currentActionIndex + 1) % actionRefs.current.length;
      const otherAction = actionRefs.current[otherIndex];

      if (otherAction) {
        currentAction.syncWith(otherAction);
      }
    }
  };

  // コンテキストに値を提供
  const contextValue: AnimationActionContextType = {
    mixer,
    actionRefs,
    currentActionIndex,
    setCurrentActionIndex,
    timeScale,
    setTimeScale,
    weight,
    setWeight,
    loopMode,
    setLoopMode,
    repetitions,
    setRepetitions,
    clampWhenFinished,
    setClampWhenFinished,
    isPaused,
    setIsPaused,
    fadeDuration,
    setFadeDuration,
    warpStartScale,
    setWarpStartScale,
    warpEndScale,
    setWarpEndScale,
    warpDuration,
    setWarpDuration,
    handlePlay,
    handleStop,
    handleReset,
    handleFadeIn,
    handleFadeOut,
    handleStopFading,
    handleCrossFade,
    handleWarp,
    handleStopWarping,
    handleHalt,
    handleSyncWith,
    currentAction,
  };

  return (
    <AnimationActionContext.Provider value={contextValue}>
      {children}
    </AnimationActionContext.Provider>
  );
};

/**
 * AnimationActionの様々なメソッドを試すためのデモコンポーネント（Three.jsオブジェクト部分）
 *
 * 試せるメソッド:
 * - play() / stop() / reset()
 * - fadeIn() / fadeOut()
 * - crossFadeFrom() / crossFadeTo()
 * - setLoop() / setDuration()
 * - warp() / halt()
 * - timeScale / weight の操作
 * - clampWhenFinished
 * - syncWith()
 */
export const AnimationActionDemo = () => {
  const { scene } = useLoader(GLTFLoader, "/models/hatsune_miku.glb");
  const context = useContext(AnimationActionContext);

  // フレーム更新（Canvas内でのみ使用可能）
  useFrame((_state, delta) => {
    if (context?.mixer) {
      context.mixer.update(delta);
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

/**
 * AnimationActionのコントロールUIコンポーネント（Canvasの外に配置）
 */
export const AnimationActionControls = () => {
  const context = useContext(AnimationActionContext);
  const [actionInfo, setActionInfo] = useState<{
    time: string;
    effectiveTimeScale: string;
    effectiveWeight: string;
    isRunning: boolean;
    isScheduled: boolean;
    clipName: string;
    clipDuration: string;
  } | null>(null);

  // アクション情報を定期的に更新
  useEffect(() => {
    if (!context) return;

    const interval = setInterval(() => {
      if (context.currentAction) {
        setActionInfo({
          time: context.currentAction.time.toFixed(2),
          effectiveTimeScale: context.currentAction
            .getEffectiveTimeScale()
            .toFixed(2),
          effectiveWeight: context.currentAction
            .getEffectiveWeight()
            .toFixed(2),
          isRunning: context.currentAction.isRunning(),
          isScheduled: context.currentAction.isScheduled(),
          clipName: context.currentAction.getClip().name,
          clipDuration: context.currentAction.getClip().duration.toFixed(2),
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [context]);

  if (!context) {
    return null;
  }

  const {
    actionRefs,
    currentActionIndex,
    setCurrentActionIndex,
    timeScale,
    setTimeScale,
    weight,
    setWeight,
    loopMode,
    setLoopMode,
    repetitions,
    setRepetitions,
    clampWhenFinished,
    setClampWhenFinished,
    isPaused,
    setIsPaused,
    fadeDuration,
    setFadeDuration,
    warpStartScale,
    setWarpStartScale,
    warpEndScale,
    setWarpEndScale,
    warpDuration,
    setWarpDuration,
    handlePlay,
    handleStop,
    handleReset,
    handleFadeIn,
    handleFadeOut,
    handleStopFading,
    handleCrossFade,
    handleWarp,
    handleStopWarping,
    handleHalt,
    handleSyncWith,
    currentAction,
  } = context;

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "20px",
        borderRadius: "8px",
        fontFamily: "monospace",
        fontSize: "12px",
        maxWidth: "400px",
        maxHeight: "80vh",
        overflowY: "auto",
        zIndex: 1000,
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "15px" }}>
        AnimationAction デモ
      </h2>

      {/* アクション情報 */}
      {actionInfo && (
        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "4px",
          }}
        >
          <div>
            <strong>Clip:</strong> {actionInfo.clipName}
          </div>
          <div>
            <strong>Duration:</strong> {actionInfo.clipDuration}s
          </div>
          <div>
            <strong>Time:</strong> {actionInfo.time}s
          </div>
          <div>
            <strong>Effective TimeScale:</strong>{" "}
            {actionInfo.effectiveTimeScale}
          </div>
          <div>
            <strong>Effective Weight:</strong> {actionInfo.effectiveWeight}
          </div>
          <div>
            <strong>Running:</strong> {actionInfo.isRunning ? "Yes" : "No"}
          </div>
          <div>
            <strong>Scheduled:</strong> {actionInfo.isScheduled ? "Yes" : "No"}
          </div>
        </div>
      )}

      {/* 基本操作 */}
      <div style={{ marginBottom: "15px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "10px" }}>基本操作</h3>
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          <button onClick={handlePlay} style={{ padding: "5px 10px" }}>
            play()
          </button>
          <button onClick={handleStop} style={{ padding: "5px 10px" }}>
            stop()
          </button>
          <button onClick={handleReset} style={{ padding: "5px 10px" }}>
            reset()
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{ padding: "5px 10px" }}
          >
            {isPaused ? "resume" : "pause"}
          </button>
        </div>
      </div>

      {/* フェード操作 */}
      <div style={{ marginBottom: "15px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "10px" }}>フェード操作</h3>
        <div style={{ marginBottom: "5px" }}>
          <label>
            Duration:
            <input
              type="number"
              value={fadeDuration}
              onChange={(e) => setFadeDuration(Number(e.target.value))}
              min="0"
              max="10"
              step="0.1"
              style={{ width: "60px", marginLeft: "5px" }}
            />
          </label>
        </div>
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          <button onClick={handleFadeIn} style={{ padding: "5px 10px" }}>
            fadeIn()
          </button>
          <button onClick={handleFadeOut} style={{ padding: "5px 10px" }}>
            fadeOut()
          </button>
          <button onClick={handleStopFading} style={{ padding: "5px 10px" }}>
            stopFading()
          </button>
          <button onClick={handleCrossFade} style={{ padding: "5px 10px" }}>
            crossFadeTo()
          </button>
        </div>
      </div>

      {/* プロパティ設定 */}
      <div style={{ marginBottom: "15px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "10px" }}>プロパティ</h3>
        <div style={{ marginBottom: "5px" }}>
          <label>
            timeScale:
            <input
              type="number"
              value={timeScale}
              onChange={(e) => setTimeScale(Number(e.target.value))}
              min="-2"
              max="2"
              step="0.1"
              style={{ width: "60px", marginLeft: "5px" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "5px" }}>
          <label>
            weight:
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              min="0"
              max="1"
              step="0.1"
              style={{ width: "60px", marginLeft: "5px" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "5px" }}>
          <label>
            Loop Mode:
            <select
              value={loopMode}
              onChange={(e) =>
                setLoopMode(
                  Number(e.target.value) as THREE.AnimationActionLoopStyles,
                )
              }
              style={{ marginLeft: "5px" }}
            >
              <option value={THREE.LoopRepeat}>LoopRepeat</option>
              <option value={THREE.LoopOnce}>LoopOnce</option>
              <option value={THREE.LoopPingPong}>LoopPingPong</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: "5px" }}>
          <label>
            Repetitions:
            <input
              type="number"
              value={repetitions === Infinity ? "∞" : repetitions}
              onChange={(e) => {
                const val = e.target.value;
                setRepetitions(val === "∞" ? Infinity : Number(val));
              }}
              min="1"
              style={{ width: "60px", marginLeft: "5px" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "5px" }}>
          <label>
            <input
              type="checkbox"
              checked={clampWhenFinished}
              onChange={(e) => setClampWhenFinished(e.target.checked)}
              style={{ marginRight: "5px" }}
            />
            clampWhenFinished
          </label>
        </div>
      </div>

      {/* 高度な操作 */}
      <div style={{ marginBottom: "15px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "10px" }}>高度な操作</h3>
        <div style={{ marginBottom: "5px" }}>
          <label>
            Warp Start:
            <input
              type="number"
              value={warpStartScale}
              onChange={(e) => setWarpStartScale(Number(e.target.value))}
              min="0"
              max="5"
              step="0.1"
              style={{ width: "60px", marginLeft: "5px" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "5px" }}>
          <label>
            Warp End:
            <input
              type="number"
              value={warpEndScale}
              onChange={(e) => setWarpEndScale(Number(e.target.value))}
              min="0"
              max="5"
              step="0.1"
              style={{ width: "60px", marginLeft: "5px" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "5px" }}>
          <label>
            Warp Duration:
            <input
              type="number"
              value={warpDuration}
              onChange={(e) => setWarpDuration(Number(e.target.value))}
              min="0"
              max="10"
              step="0.1"
              style={{ width: "60px", marginLeft: "5px" }}
            />
          </label>
        </div>
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          <button onClick={handleWarp} style={{ padding: "5px 10px" }}>
            warp()
          </button>
          <button onClick={handleStopWarping} style={{ padding: "5px 10px" }}>
            stopWarping()
          </button>
          <button onClick={handleHalt} style={{ padding: "5px 10px" }}>
            halt()
          </button>
          <button onClick={handleSyncWith} style={{ padding: "5px 10px" }}>
            syncWith()
          </button>
        </div>
      </div>

      {/* アクション切り替え */}
      {actionRefs.current.length > 1 && (
        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "10px" }}>
            アクション切り替え
          </h3>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {actionRefs.current.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  if (currentAction) {
                    currentAction.stop();
                  }
                  action.play();
                  setCurrentActionIndex(index);
                }}
                style={{
                  padding: "5px 10px",
                  background:
                    index === currentActionIndex ? "#4CAF50" : undefined,
                }}
              >
                {action.getClip().name || `Action ${index}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
