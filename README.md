# Tarot Spread Canvas

Tarot Spread Canvasは、Rider–Waite–Smith Tarot 78枚からスプレッドを作成し、完成した配置をPNGまたはJPEGで保存できるブラウザアプリです。

テーマ・質問、日付、カード配置、画像生成はブラウザ内で処理されます。アカウント、外部API、解析サービス、クラウド保存は使用しません。

## 主な機能

- 8種類のスプレッドを1つの共通アプリで切替
- 78枚のカードピッカー、分類フィルター、重複配置防止
- 正位置／逆位置、役割名、テーマ・質問、日付、選択肢名
- PC向けドラッグ＆ドロップ、タッチ環境向けタップ操作
- 重複なしの「カードを配置」と「カードをすべて外す」
- 日本語／English、小アルカナ表記、ゴシック／明朝
- Light、Dark、Elegance、Malachite、Cosmic、Wood、単色背景
- PNG／JPEG、標準／高解像度、完成画像プレビュー
- 使い方、FAQ、プライバシー、免責を含むアプリ内ヘルプ

## 対応スプレッド

- ワンオラクル
- ツーオラクル
- ツーマインド
- スリーカード
- ホースシュー
- ヘキサグラム
- ケルト十字
- 選択式スプレッド（2択／3択／4択、共通カードON／OFF）

スプレッドはカード枚数と配置だけを定義します。テーマ、日付、期間、各カードの役割はユーザーが自由に設定できます。

## ローカル起動

ES Modulesを使用するため、ローカルHTTPサーバーから開いてください。ビルドやパッケージインストールは不要です。

```powershell
python -m http.server 4173
```

ブラウザで `http://localhost:4173/` を開きます。

スモークテスト：

```powershell
node tests/smoke.mjs
```

## GitHub Pages

依存ライブラリやビルド工程のない静的Webアプリです。すべての実行時アセットをリポジトリ相対パスで参照するため、`https://USERNAME.github.io/tarot-spread-canvas/` のようなプロジェクトサイト配下で動作します。

公開後はリポジトリのPages設定で、`main`ブランチのルートを公開元として選択できます。

## ディレクトリ

```text
index.html                 アプリ画面
css/style.css              GUIとレスポンシブ表示
js/                        データ、状態、描画、操作、保存処理
Cards/                     Canvas用カード画像78枚
assets/card-thumbnails/    カードピッカー用画像78枚
assets/backgrounds/        Cosmic／Woodの公開用WebP
tests/smoke.mjs            公開アセットと主要状態の検査
card-master-base.js        正式Card Master元データ
AGENTS.md                  開発・保守方針
```

背景元PNGは再変換用としてローカルの `assets/backgrounds/source/` に保持できますが、公開リポジトリには含めません。

## Ver1.0対象外

補助カード、5択以上、履歴、Undo／Redo、自動保存、アカウント、クラウド保存、SNS共有、外部API、PWAは対象外です。

## カード画像

本アプリでは、Rider–Waite–Smith Tarot をもとにしたカード画像を使用しています。原作品の著作権が満了している範囲で利用するとともに、本アプリで使用するデジタル画像については、購入元より商用利用を含む利用許諾を得ています。

© 2026 Suguru Mantic Works
