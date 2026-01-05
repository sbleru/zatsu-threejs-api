# Miku's Lyric Stage

初音ミクの3D歌詞演出アプリケーション。TextAlive App APIを使用して、音楽に合わせた美しい3D歌詞演出を実現します。

## 主な機能

- **3D歌詞演出**: 音楽に合わせて歌詞が3D空間で動的に表示
- **初音ミクモデル**: 3Dミクモデルのアニメーション
- **ビート連動エフェクト**: 音楽のビートに合わせたパーティクルエフェクト
- **複数の演出モード**:
  - 円形配置の歌詞演出（FlowingLyrics3D）
  - アニメーション付きフレーズ表示（AnimatedPhrase3D）
- **インタラクティブエフェクト**:
  - パーティクルエフェクト
  - スチールフレームエフェクト
  - カメラ切り替え機能

## 開発環境のセットアップ

### 必要な環境

- [Node.js](https://nodejs.org/) (推奨: v18以上)

### 環境変数の設定

TextAlive API を使用するためには、APIトークンが必要です。

1. [TextAlive for Developers](https://developer.textalive.jp/profile) でAPIトークンを取得
2. `.env` ファイルを作成し、`VITE_TEXTALIVE_TOKEN` に取得したトークンを設定

```
VITE_TEXTALIVE_TOKEN=your_token_here
```

### 開発サーバーの起動

```sh
npm install
npm run dev
```

### ビルド

```sh
npm run build
```

## 使用技術

- **React 19** + **TypeScript**
- **Three.js** + **@react-three/fiber** - 3D演出
- **@react-three/drei** - 3D UI コンポーネント
- **TextAlive App API** - 音楽・歌詞データ
- **Tailwind CSS** - スタイリング
- **Vite** - ビルドツール

## TextAlive App API について

TextAlive App API は、音楽に合わせてタイミングよく歌詞が動く Web アプリケーション（リリックアプリ）を開発できる JavaScript 用のライブラリです。

詳しくは [TextAlive for Developers](https://developer.textalive.jp/) をご覧ください。

## ライセンス

MIT License

## クレジット

- 初音ミクモデル: [Sketchfab](https://sketchfab.com/3d-models/hatsune-miku-a25f6548a8684500ac0004559484a4f9)
- TextAlive App API: [TextAlive for Developers](https://developer.textalive.jp/)
