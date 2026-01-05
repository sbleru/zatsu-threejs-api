import React, { createContext, ReactNode, useContext, useState } from "react";

// 演出タイプの定義
export type EffectType = "flowingLyrics" | "animatedPhrase";

// 演出設定の型定義
export interface EffectSettings {
  type: EffectType;
  showParticles: boolean;
  showSteelFrame: boolean;
}

// コンテキストの値の型定義
interface SceneEffectContextValue {
  effectSettings: EffectSettings;
  setEffectType: (type: EffectType) => void;
  setShowParticles: (show: boolean) => void;
  setShowSteelFrame: (show: boolean) => void;
}

// デフォルト設定
const defaultEffectSettings: EffectSettings = {
  type: "animatedPhrase",
  showParticles: true,
  showSteelFrame: false,
};

// コンテキストの作成
const SceneEffectContext = createContext<SceneEffectContextValue | null>(null);

// プロバイダーコンポーネント
interface SceneEffectProviderProps {
  children: ReactNode;
}

export const SceneEffectProvider: React.FC<SceneEffectProviderProps> = ({
  children,
}) => {
  const [effectSettings, setEffectSettings] = useState<EffectSettings>(
    defaultEffectSettings,
  );

  const setEffectType = (type: EffectType) => {
    setEffectSettings((prev) => ({ ...prev, type }));
  };

  const setShowParticles = (show: boolean) => {
    setEffectSettings((prev) => ({ ...prev, showParticles: show }));
  };

  const setShowSteelFrame = (show: boolean) => {
    setEffectSettings((prev) => ({ ...prev, showSteelFrame: show }));
  };

  const contextValue: SceneEffectContextValue = {
    effectSettings,
    setEffectType,
    setShowParticles,
    setShowSteelFrame,
  };

  return (
    <SceneEffectContext.Provider value={contextValue}>
      {children}
    </SceneEffectContext.Provider>
  );
};

// カスタムフック
export const useSceneEffect = (): SceneEffectContextValue => {
  const context = useContext(SceneEffectContext);
  if (!context) {
    throw new Error("useSceneEffect must be used within a SceneEffectProvider");
  }
  return context;
};
