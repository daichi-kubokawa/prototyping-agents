<spec_driven_inception_framework>

# 1. プロジェクト設定パラメータ（手動入力エリア）

=========================================
【PROJECT_NAME】 : {{PROJECT_NAME}}
【PROJECT_SUMMARY】 : {{PROJECT_SUMMARY}}
【FIGJAM_URL】 : {{FIGJAM_URL}}
【RAW_HEARING_MEMO】 : {{RAW_HEARING_MEMO}}
=========================================

# 2. 実行前提とアーキテクチャ方針

私たちは、新規プロダクト【PROJECT_NAME】の開発において、「仕様駆動開発（Spec-Driven Development）」のワークフローを厳格に回します。
本プロンプトは、人間が定義した最上流のインプット情報（PROJECT_SUMMARY / FIGJAM_URL / RAW_HEARING_MEMO）を「単一の真実のソース（Single Source of Truth）」とし、そこから各ドキュメントを最も専門的なペルソナ（プロフェッショナル）にコンテキストスイッチした上で、一切の矛盾なく自律自動展開するためのフレームワークです。

# 3. ディレクトリ構成と役割分担

.
├── briefing.md <-- ★【最上流：手動配備】顧客ヒアリング、利用文脈、設計の原点生メモ
│

# ── 以下、フェーズ2にて各プロフェッショナルロールが自律生成 ──

├── requirements.md <-- [担当: AI Product Manager] ユーザーストーリー、スコープ、JSONスキーマ
├── design.md <-- [担当: AI Technical Lead] 画面構成、DOM操作方針、状態遷移（Mermaid）
├── Guidelines.md <-- [担当: AI UI/UX Designer] タイポグラフィ、カラー、モーション規約
├── tasks.md <-- [担当: AI QA Lead] DoD（完了定義）を伴うフェーズ別詳細実装タスク
├── figma_make_prompt.md <-- [担当: AI Prompt Engineer] Figma Make / v0 用の変数疎結合プロンプト
├── README.md <-- [担当: AI Technical Writer] プロジェクト概要、技術選定の意思決定、セキュリティ設計
└── prompts/
└── inception_briefing.md <-- ★【最優先】本プロンプト全文（Prompt Ops履歴として保存）

---

# 4. 実行ステップ

## 【フェーズ1：原点（briefing.md）の構築】

1. 本リポジトリには、Prompt Ops（プロンプト運用）の資産として、変数化されたクリーンなプロンプト雛形が【prompts/inception_briefing.md】として事前に手動配備されています。
   AIエージェントは、本テンプレートをロードし、Git追跡外の【local_env.json】からパラメータ（PROJECT_NAME, FIGJAM_URL等）を動的にインジェクション（バインド）して実行してください。
   実データが含まれるプロンプト全文を物理ファイルとしてリポジトリ内に再保存・上書きすることは、シークレットリーク防止の観点から厳格に禁止します。

2. バインドされた設定情報をもとに、Figma MCP経由で【FIGJAM_URL】（またはRAW_HEARING_MEMO）を深くパースし、すべての設計判断の原点となる【briefing.md】をプロジェクトルート直下に生成してください。
   この段階では、設計意図の合意形成（サインオフ）のゲートを厳格に敷くため、他のMarkdownや index.html の生成は絶対に行わないでください。

## 【フェーズ2：仕様（Specs）の自律自動展開（※フェーズ1合意後に実行）】

生成された `briefing.md` の記述内容を深く分析し、そこに潜む利用シーンや制約から逆算して、各プロフェッショナルロールになりきって以下の仕様ドキュメント群を一括生成してください。

### ❶ requirements.md (担当: AI Product Manager)

- briefing.mdに完全にアラインしたペルソナ、Must/Should/Won't Haveの厳密な境界線。
- セキュリティ要件（sessionStorage一時保持、textContent徹底によるXSS対策）と、キー未設定/エラー時に安全にフォールバックするモック動作のJSONスキーマ定義。

### ❷ design.md (担当: AI Technical Lead)

- 操作特性から逆算したレスポンシブコンポーネント構造。
- 設定モーダルのMermaid（stateDiagram-v2）による状態遷移図。
- textContentエスケープ方針と、仕分け関数のインターフェース設計。

### ❸ Guidelines.md (担当: AI UI/UX Designer)

- briefing.mdに定義された「利用シーン（暗さ、屋外、片手など）」に最も調和するデザインシステム規約。
- Typography: 雰囲気と可読性を両立する特定のWebフォント選定（見出し用・本文用）とCDN読み込み規約。
- Color: 利用シーンの光量を考慮し、意味のある役割を持たせたベースカラーと、各要素を識別するシャープなアクセントカラー（面で塗らず点と線で使うルール）の決定。
- Motion: リスト追加時の快適なアニメーション仕様（staggered revealやスライドインの速度、イージング）。
- Atmosphere: 背景の奥行きを出すグラデーションや幾何学的パターンの規約。

### ❹ tasks.md (担当: AI QA Lead)

- 実装をPhase 1（静的ベース）からPhase 4（インタラクション適用）に切り分け、詳細な完了定義（Definition of Done）を伴うチェックリストを構築。

### ❺ figma_make_prompt.md (担当: AI Prompt Engineer)

- Figma Make（Task/Context/Elements/Behavior/Constraints）およびv0のベストプラクティス構造に基づき、上記の要件・設計・規約をプレースホルダー（{{Requirements}}等）でバインドするコピペ用プロンプト。

### ❻ README.md (担当: AI Technical Writer)

- 製品README。Next.js見送りの合理的な判断、sessionStorage/XSS対策のセキュリティ設計思想。

# 5. 実行手順

まずは `prompts/inception_briefing.md` を物理保存した上で、フェーズ1の `briefing.md` を生成（または読み込み完了）し、フェーズ2の自律展開を行うための準備が整ったことを報告してください。
</spec_driven_inception_framework>

# 6. ガードレール

- briefing.md を唯一の正とし、下流ドキュメントは必ず briefing.md に根拠を持つこと。
- briefing.md に存在しない情報を確定事項として補完しないこと。
- 推測が必要な場合は Assumption として明示すること。
- 不足情報は Open Questions として列挙すること。
- FIGJAM_URL が取得不能な場合は RAW_HEARING_MEMO を使用し、取得失敗を明示すること。
- 各ドキュメント生成後、相互矛盾を検査すること。
- 矛盾がある場合の優先順位は以下とする。
  1. briefing.md
  2. requirements.md
  3. design.md
  4. guidelines.md
  5. tasks.md
  6. figma_make_prompt.md
  7. README.md
