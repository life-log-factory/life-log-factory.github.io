# LIFE LOG Factory — Design Guide

このサイト (life-log-factory.github.io) のデザインを統一するためのガイドライン。
新しいページやコンポーネントを追加するときは、このドキュメントのルールに従うこと。

## 1. ロゴ

- 正式ロゴ: `assets/img/LLF-img/LLF_2026.png`（透過PNG）
  - 常にこのロゴを使う。旧ロゴ (`LLF taitoru*.svg/png`, `LLFタイトル.png` など) は今後使用しない（既存ファイルは削除せず互換のため残すが、新規実装では参照しない）。
  - PNGを使う理由: 以前SVG版（フォント指定のテキストを直接描画する形式）を使っていたが、環境によって欠けたり位置がずれたりする問題があったため、見た目が環境に依存しないPNGに統一した。
  - ロゴ本体の文字色は `#00687A`（プライマリカラー）なので、背景は白 or ごく薄い色にする。
  - トップページのヒーロー（黒背景 + 星空）のように濃い背景に置く場合は、`filter: brightness(0) invert(1);` を img に当てて白抜き表示にする（`#logo img` を参照）。別途白抜き版のファイルを用意する必要はない。
- サブロゴ（長崎大学ロゴ等）はフッターにのみ、メインロゴの右側に並べる。

## 2. カラー

プライマリカラーは `#00687A`（ティール）。この1色から明度を変えた10段階のパレットを、背景・アクセント・ホバー等に使い分ける。

| 用途 | 変数名 | HEX |
| --- | --- | --- |
| Primary（最も濃い） | `--llf-primary` / `--llf-teal-900` | `#00687A` |
| | `--llf-teal-800` | `#1C7989` |
| | `--llf-teal-700` | `#398A98` |
| | `--llf-teal-600` | `#559AA6` |
| | `--llf-teal-500` | `#71ABB5` |
| | `--llf-teal-400` | `#8EBCC4` |
| | `--llf-teal-300` | `#AACDD3` |
| | `--llf-teal-200` | `#C6DDE1` |
| | `--llf-teal-100`（最も薄い） | `#E3EEF0` |
| Base Black | `--llf-black` | `#000000` |
| Base White | `--llf-white` | `#FFFFFF` |

CSS変数は `assets/css/style.css` の `:root` にまとめて定義してある。新しい色を使うときは新規のHEXを増やすのではなく、必ずこの変数を参照すること。

使い分けの指針:
- 本文の文字色: `--llf-black`（または黒に近いグレー）
- 見出し・リンク・アクセント・ボタン: `--llf-primary`
- ホバーや薄い背景（カード、タグの下地など）: `--llf-teal-100`〜`--llf-teal-300`
- 罫線・区切り線: `--llf-teal-200` または既存の薄いグレー
- 白背景 + 黒文字、または黒背景 + 白文字 を基本コントラストとし、ティールは「差し色」として使う（背景全面をティールにするのは強調したいセクションのみに限定）

## 3. フォント

デザイン基準画像のとおり、和文と英文でフォントを分けてペアリングする。

- 日本語見出し・ロゴ・強調テキスト: **BIZ UDP明朝 Medium**（Google Fonts: `BIZ UDPMincho`, weight 500）
- 英数字・ロゴタイプ: **Montserrat**
- 本文（段落など長文の可読性が必要な箇所）: 既存の `Noto Sans JP` を継続使用してよい（明朝体は長文には使わない）

`assets/css/style.css` の `:root` に以下を用意している。

```css
--llf-font-heading-ja: 'BIZ UDPMincho', serif;
--llf-font-heading-en: 'Montserrat', sans-serif;
--llf-font-body: 'Noto Sans JP', "Helvetica Neue", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif;
```

見出し(`h1`, `.service-main-title`, `.news-title`, `.project-title` など)には `font-family: var(--llf-font-heading-en), var(--llf-font-heading-ja);` を指定し、和文/英数字が混在しても両方のフォントが自然に効くようにする。

新しいページを作る場合は `<head>` に以下を追加すること（既存ページ全てに追加済み）。

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=BIZ+UDPMincho:wght@400;500;700&family=Montserrat:wght@400;500;700&display=swap" rel="stylesheet">
```

## 4. ページ構成 / 共通パーツ

サイトの各ページは以下の構成をテンプレートとする。

```
<head>
  sanitize.css → style.css → (フォントのGoogle Fonts link) → OGP等メタタグ → favicon
<body>
  <div id="header-placeholder"></div>   ← header.html を script.js が fetch して挿入
  (ページ固有のコンテンツ)
  <div id="footer-placeholder"></div>   ← footer.html を script.js が fetch して挿入
  <script src="./assets/js/script.js" defer></script>
```

- `header.html` / `footer.html` を編集すれば、全ページに反映される（サイト内共通パーツはこの2ファイルに集約する。ページごとに複製しない）。
- ヘッダーのロゴは `LLF_2026.png`、ナビゲーションリンクは `Home / About / NEWS / Schedule / History / Project(BREMONS / ID / Kazoo のドロップダウン) / Documents / Shop` を維持する。
- フッターはロゴ（LLF + 長崎大学）、SNSリンク、Sync/Adminリンクの3ブロック構成を維持する。

### Shop（グッズ・アプリ販売）

- `shop.html` が製品一覧ページ。表示内容は `assets/js/products-data.js` の `PRODUCTS` 配列から自動生成される。
- **新しい製品・アプリを追加するときは `products-data.js` に1項目追加するだけでよい。`shop.html` 側の修正は不要。**
- 物販（`type: 'physical'`）はBOOTH/BASE等、外部ECサービスの商品ページURLを `buyUrl` に入れる。まだ販売開始していない場合は `buyUrl: null` かつ `status: 'coming-soon'` にすると「準備中」表示になる。
- アプリ（`type: 'app'`）はPWA（ホーム画面に追加できるWebアプリ）を前提とし、`appUrl` に実際に開くURLを指定する。App Store/Google Playへの登録は行わない方針（詳細は各アプリのプロジェクトページ参照）。

## 5. 例外

- `bremons/` 以下（呼吸トレーニングゲーム BREMONS 本体）は独自のドット絵UI（`DotGothic16`）を持つミニアプリのため、本ガイドラインの対象外とする。サイト本体（トップページや各案内ページ）のみに適用する。

## 6. 今後の運用

- 新しい色・フォントを増やしたくなった場合は、まずこのファイルを更新してから実装する。
- 配色・フォントに関する変更は `assets/css/style.css` の `:root` を起点に行い、個別要素へのハードコードした色指定・フォント指定は避ける。
