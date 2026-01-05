import React, { useCallback, useState } from "react";
import { PlayerSeekbar } from "textalive-react-api";

import { usePlayer, usePlayerListener } from "./player";
import { EffectType, useSceneEffect } from "./scenes/SceneEffectContext";

type PlayerControlProps = {
  disabled: boolean;
};

// マジカルミライ 2025 対象楽曲リスト
const MAGICAL_MIRAI_2025_SONGS = [
  {
    title: "ストリートライト",
    artist: "加賀(ネギシャワーP)",
    url: "https://piapro.jp/t/ULcJ/20250205120202",
  },
  {
    title: "アリフレーション",
    artist: "雨良 Amala",
    url: "https://piapro.jp/t/SuQO/20250127235813",
  },
  {
    title: "インフォーマルダイブ",
    artist: "99piano",
    url: "https://piapro.jp/t/Ppc9/20241224135843",
  },
  {
    title: "ハロー、フェルミ。",
    artist: "ど～ぱみん",
    url: "https://piapro.jp/t/oTaJ/20250204234235",
  },
  {
    title: "パレードレコード",
    artist: "きさら",
    url: "https://piapro.jp/t/GCgy/20250202202635",
  },
  {
    title: "ロンリーラン",
    artist: "海風太陽",
    url: "https://piapro.jp/t/CyPO/20250128183915",
  },
];

// カメラキーマップ設定
const CAMERA_KEY_MAP = [
  { key: "E", description: "正面アップ" },
  { key: "D", description: "正面引き" },
  { key: "R", description: "正面右上" },
  { key: "W", description: "正面左上" },
  { key: "S", description: "正面左下" },
  { key: "F", description: "正面右下" },
  { key: "I", description: "背面アップ" },
  { key: "K", description: "背面引き" },
  { key: "O", description: "背面右上" },
  { key: "U", description: "背面左上" },
  { key: "J", description: "背面左下" },
  { key: "L", description: "背面右下" },
  { key: "Space", description: "ダイナミックカメラ" },
  { key: "その他", description: "初期位置" },
];

// 演出設定リスト
const EFFECT_TYPES = [
  {
    type: "animatedPhrase" as EffectType,
    name: "Animated Phrase",
    description: "",
  },
  {
    type: "flowingLyrics" as EffectType,
    name: "Flowing Lyrics",
    description: "",
  },
];

export const PlayerControl: React.FC<PlayerControlProps> = ({ disabled }) => {
  const { player } = usePlayer();
  const { effectSettings, setEffectType, setShowParticles, setShowSteelFrame } =
    useSceneEffect();
  const [status, setStatus] = useState<"play" | "pause" | "stop">("stop");
  const [showSeekbar, setShowSeekbar] = useState(false);
  const [showSongMenu, setShowSongMenu] = useState(false);
  const [showKeyMapMenu, setShowKeyMapMenu] = useState(false);
  const [showEffectMenu, setShowEffectMenu] = useState(false);

  // 現在の楽曲URLを取得
  const getCurrentSongUrl = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const songUrl = urlParams.get("ta_song_url");
    // デフォルト楽曲（ストリートライト）
    return songUrl || "https://piapro.jp/t/ULcJ/20250205120202";
  }, []);

  const currentSongUrl = getCurrentSongUrl();

  usePlayerListener(player, {
    onPlay: () => setStatus("play"),
    onPause: () => setStatus("pause"),
    onStop: () => setStatus("stop"),
  });

  const handlePlay = useCallback(
    () => player && player.requestPlay(),
    [player],
  );
  const handlePause = useCallback(
    () => player && player.requestPause(),
    [player],
  );

  const toggleSeekbar = useCallback(() => {
    setShowSeekbar(!showSeekbar);
  }, [showSeekbar]);

  const toggleSongMenu = useCallback(() => {
    setShowSongMenu(!showSongMenu);
    if (!showSongMenu) {
      setShowKeyMapMenu(false);
      setShowEffectMenu(false);
    }
  }, [showSongMenu]);

  const toggleKeyMapMenu = useCallback(() => {
    setShowKeyMapMenu(!showKeyMapMenu);
    if (!showKeyMapMenu) {
      setShowSongMenu(false);
      setShowEffectMenu(false);
    }
  }, [showKeyMapMenu]);

  const toggleEffectMenu = useCallback(() => {
    setShowEffectMenu(!showEffectMenu);
    if (!showEffectMenu) {
      setShowSongMenu(false);
      setShowKeyMapMenu(false);
    }
  }, [showEffectMenu]);

  const handleSongSelect = useCallback((songUrl: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("ta_song_url", songUrl);
    window.location.href = url.toString();
  }, []);

  const handleEffectTypeChange = useCallback(
    (type: EffectType) => {
      setEffectType(type);
    },
    [setEffectType],
  );

  const handleParticleToggle = useCallback(() => {
    setShowParticles(!effectSettings.showParticles);
  }, [effectSettings.showParticles, setShowParticles]);

  const handleSteelFrameToggle = useCallback(() => {
    setShowSteelFrame(!effectSettings.showSteelFrame);
  }, [effectSettings.showSteelFrame, setShowSteelFrame]);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* キーマップメニュー */}
      {showKeyMapMenu && (
        <div className="mb-2 bg-black/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/30 w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium text-sm">カメラ操作</h3>
            <button
              onClick={toggleKeyMapMenu}
              className="text-white hover:text-gray-300 transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CAMERA_KEY_MAP.map((keyMap, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-xs text-gray-300">
                  {keyMap.description}
                </span>
                <kbd className="px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600 font-mono">
                  {keyMap.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 楽曲選択メニュー */}
      {showSongMenu && (
        <div className="mb-2 bg-black/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/30 w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium text-sm">楽曲選択</h3>
            <button
              onClick={toggleSongMenu}
              className="text-white hover:text-gray-300 transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="max-h-100 overflow-y-auto">
            {MAGICAL_MIRAI_2025_SONGS.map((song, index) => {
              const isCurrentSong = song.url === currentSongUrl;
              return (
                <button
                  key={index}
                  onClick={() => handleSongSelect(song.url)}
                  className={`w-full text-left p-3 rounded transition-colors text-xs mb-2 relative cursor-pointer ${
                    isCurrentSong
                      ? "bg-blue-600/30 border border-blue-400/50 text-white hover:bg-blue-600/40"
                      : "hover:bg-white/10 text-white"
                  }`}
                >
                  <div className="flex items-center">
                    {isCurrentSong && (
                      <div className="mr-2 flex-shrink-0">
                        <svg
                          className="w-3 h-3 text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <div
                        className={`font-medium ${isCurrentSong ? "text-blue-100" : ""}`}
                      >
                        {song.title}
                      </div>
                      <div
                        className={`text-xs ${isCurrentSong ? "text-blue-200" : "text-gray-400"}`}
                      >
                        {song.artist}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 演出設定メニュー */}
      {showEffectMenu && (
        <div className="mb-2 bg-black/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/30 w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium text-sm">演出設定</h3>
            <button
              onClick={toggleEffectMenu}
              className="text-white hover:text-gray-300 transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 演出タイプ選択 */}
          <div className="mb-4">
            <h4 className="text-white text-xs font-medium mb-2">
              歌詞演出タイプ
            </h4>
            <div className="space-y-2">
              {EFFECT_TYPES.map((effect, index) => (
                <button
                  key={index}
                  onClick={() => handleEffectTypeChange(effect.type)}
                  className={`w-full text-left p-2 rounded transition-colors text-xs flex items-center ${
                    effectSettings.type === effect.type
                      ? "bg-blue-600/30 border border-blue-400/50 text-white"
                      : "hover:bg-white/10 text-white border border-transparent"
                  }`}
                >
                  {/* ラジオボタン風のアイコン */}
                  <div className="mr-2 flex-shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                        effectSettings.type === effect.type
                          ? "border-blue-400 bg-blue-600"
                          : "border-gray-400"
                      }`}
                    >
                      {effectSettings.type === effect.type && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{effect.name}</div>
                    <div className="text-xs text-gray-400">
                      {effect.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* エフェクト設定 */}
          <div>
            <h4 className="text-white text-xs font-medium mb-2">
              エフェクト設定
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleParticleToggle}
                className={`w-full text-left p-2 rounded transition-colors text-xs flex items-center ${
                  effectSettings.showParticles
                    ? "bg-green-600/30 border border-green-400/50 text-white"
                    : "hover:bg-white/10 text-white border border-transparent"
                }`}
              >
                {/* トグルボタン風のアイコン */}
                <div className="mr-2 flex-shrink-0">
                  <div
                    className={`w-3 h-3 rounded border-2 flex items-center justify-center ${
                      effectSettings.showParticles
                        ? "border-green-400 bg-green-600"
                        : "border-gray-400"
                    }`}
                  >
                    {effectSettings.showParticles && (
                      <svg
                        className="w-2 h-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="font-medium">パーティクル</div>
              </button>
              <button
                onClick={handleSteelFrameToggle}
                className={`w-full text-left p-2 rounded transition-colors text-xs flex items-center ${
                  effectSettings.showSteelFrame
                    ? "bg-green-600/30 border border-green-400/50 text-white"
                    : "hover:bg-white/10 text-white border border-transparent"
                }`}
              >
                {/* トグルボタン風のアイコン */}
                <div className="mr-2 flex-shrink-0">
                  <div
                    className={`w-3 h-3 rounded border-2 flex items-center justify-center ${
                      effectSettings.showSteelFrame
                        ? "border-green-400 bg-green-600"
                        : "border-gray-400"
                    }`}
                  >
                    {effectSettings.showSteelFrame && (
                      <svg
                        className="w-2 h-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="font-medium">フレーム</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* フローティングメニュー */}
      <div className="flex items-center gap-2">
        {/* メインメニューボタン */}
        <div className="bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center border border-white/30">
          {/* カメラキーマップボタン */}
          <button
            onClick={toggleKeyMapMenu}
            className="text-white hover:text-gray-300 transition-colors cursor-pointer"
            title="カメラ操作"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-white/30 mx-3" />

          {/* 楽曲選択ボタン */}
          <button
            onClick={toggleSongMenu}
            className="text-white hover:text-gray-300 transition-colors cursor-pointer"
            title="楽曲選択"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-white/30 mx-3" />

          {/* 演出設定ボタン */}
          <button
            onClick={toggleEffectMenu}
            className="text-white hover:text-gray-300 transition-colors cursor-pointer"
            title="演出設定"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-white/30 mx-3" />

          {/* 再生/一時停止アイコン */}
          <button
            onClick={status !== "play" ? handlePlay : handlePause}
            disabled={disabled}
            className="text-white hover:text-gray-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {status !== "play" ? (
              // 再生アイコン
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              // 一時停止アイコン
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-white/30 mx-3" />

          {/* Menuボタン（右端に移動） */}
          <button
            onClick={toggleSeekbar}
            className="text-white font-medium text-sm hover:text-gray-300 transition-colors cursor-pointer flex items-center justify-center"
          >
            {showSeekbar ? (
              // 閉じるアイコン（左向き矢印）
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            ) : (
              // 開くアイコン（右向き矢印）
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Seekbar - メニューの右側に表示 */}
        {showSeekbar && (
          <div className="bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg w-80 border border-white/30">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <PlayerSeekbar player={disabled ? undefined : (player as any)} />
          </div>
        )}
      </div>
    </div>
  );
};
