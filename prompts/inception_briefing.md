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

# 3. 最優先ガードレール（全フェーズ共通）

- **シークレット情報のマスク徹底（シークレットリーク防止）**：
  生成するすべての仕様 Markdown（`briefing.md`, `README.md` 等）において、`local_env.json` からバインドした生データのうち、`FIGJAM_URL` やアクセスキー、プライベートパス等の具体的なシークレット文字列情報を、そのままファイル内に平文出力してはなりません。ドキュメント上は必ず `[FigJam Board (Confidential)]` や `[非公開（Figma MCP経由でローカル解析済）]` のようにマスク処理を施し、Gitリポジトリを公開した際の漏洩リスクを物理的に100%遮断してください。
- **仕様の一貫性担保**：
  `briefing.md` を唯一の真実のソース（SSoT）とし、下流ドキュメント（`requirements.md`, `design.md` 等）は必ずここに記述された顧客の課題、利用文脈、設計の狙いに準拠し、根拠を持ってください。
- **推測・不足情報の可視化**：
  - `briefing.md` に存在しない情報を下流ドキュメントで確定事項として補完してはなりません。
  - 設計上、推測が必要な場合は必ず「Assumptions（前提・推測）」として明示してください。
  - 不足している重要情報は「Open Questions（要確認事項）」として明確に列挙してください。
- **整合性の優先順位**：
  仕様間で矛盾や競合が発生した場合の優先順位は以下とします。
  1. `briefing.md` （最上流）
  2. `requirements.md`
  3. `design.md`
  4. `Guidelines.md`
  5. `tasks.md`
  6. `figma_make_prompt.md`
  7. `README.md`

# 4. ディレクトリ構成と役割分担

.
├── briefing.md <-- ★【最上流：手動配備】顧客ヒアリング、利用文脈、設計の原点生メモ
├── review_history.md <-- ★【品質管理】人間とAIによる二重のレビュー履歴・意思決定（Sign-off）の証跡
│

# ── 以下、フェーズ2にて各プロフェッショナルロールが自律生成 ──

│
├── requirements.md <-- [担当: AI Product Manager] ユーザーストーリー、スコープ、JSONスキーマ
├── design.md <-- [担当: AI Technical Lead] 画面構成、DOM操作方針、状態遷移（Mermaid）
├── Guidelines.md <-- [担当: AI UI/UX Designer] タイポグラフィ、カラー、モーション規約
├── tasks.md <-- [担当: AI QA Lead] DoD（完了定義）を伴うフェーズ別詳細実装タスク
├── figma_make_prompt.md <-- [担当: AI Prompt Engineer] Figma Make / v0 用の変数疎結合プロンプト
├── README.md <-- [担当: AI Technical Writer] プロジェクト概要、技術選定の意思決定、セキュリティ設計
└── prompts/
└── inception_briefing.md <-- ★【最優先】本プロンプトテンプレート（Prompt Ops資産として保存）

# 5. 実行ステップ

## 【フェーズ1：原点（briefing.md）構築 ➔ AI自動品質レビュー】

1. **環境変数のバインド**：
   本リポジトリにPrompt Ops（プロンプト運用）の資産としてカプセル化されている本プロンプトをロードしてください。Git追跡外の【`local_env.json`】からプロジェクト設定パラメータ（PROJECT_NAME, FIGJAM_URL等）を動的にバインドして実行します。本プロンプトに実データを直接上書き保存することは、シークレットリーク防止の観点から厳格に禁止します。
2. **原点の自律生成**：
   バインドされた設定変数をもとにFigma MCPを起動して【FIGJAM_URL】（またはRAW_HEARING_MEMO）を深くパースし、すべての設計判断の原点となる【`briefing.md`】をプロジェクトルート直下に生成してください（実URL等は3章のガードレールに従い厳重にマスクすること）。
3. **【自動品質ゲート1】AI自律レビューの実行**：
   `briefing.md` の生成が完了したら、処理を止めずに「AI QA Lead」および「AI Technical Lead」として以下の観点から自律的に品質・セキュリティレビューを行ってください。
   - **セキュリティ監査**：APIキーの一時保持方針（sessionStorage保持の徹底）、textContent等のエスケープによるXSS（クロスサイトスクリプティング）対策の妥当性
   - **頑健性・エッジケース監査**：1文に複数カテゴリ（ログ＋ToDo）が混在する際のエッジケース、APIエラー時のローカル正規表現フォールバック（モック動作）仕様の安全性
   - **生理的UX・文脈監査**：深夜2時の抱っこ状態での片手操作におけるUI上の制約、暗闇での防眩プレミアムダークテーマ要件の一貫性
4. **レビュー履歴の自動生成**：
   上記の検証結果を、プロジェクトルート直下に【`review_history.md`】として新規自動生成して記録してください（「## briefing.md ➔ requirements.md への移行前レビュー」セクションに詳細をチェックリスト形式で記録すること）。
5. **一時停止とサインオフ待機**：
   ここまでの仕様生成と自動レビューが完了した段階で、人間（あなた）の最終レビューおよび手動サインオフ（署名・承認）を待つために、処理を一度完全に停止（一時停止）してください。

---

## 【フェーズ2：仕様（Specs）の自律自動展開 ➔ 仕様間クロスレビュー】

（※人間からチャットでレビューフィードバックを受け取り、サインオフ（PASS）の合意が得られた後に実行します）

1. **フィードバックのバインド**：
   人間からチャットで受け取った修正指摘、および合意したこだわりや設計の狙いを深くロードし、`review_history.md` の「人間のコメント」プレースホルダーに記録・同期してください。
2. **下流仕様の一括生成**：
   更新された `review_history.md` を唯一の追加要件（コンテキスト）とし、各担当プロフェッショナルロール（AI Product Manager, Technical Lead, UI/UX Designer, QA Lead, Prompt Engineer, Technical Writer）になりきって、一切の矛盾なく以下の下流仕様ドキュメント群を一括生成してください。
   - **`requirements.md`**：Must/Should/Won't Haveの厳密な境界線、一時保持のJSONスキーマ定義
   - **`design.md`**：コンポーネント構造、設定モーダルのMermaid状態遷移図、textContent適用箇所と仕分けインターフェース設計
   - **`Guidelines.md`**：防眩配色規約、特定Webフォント選定とCDN、 staggred revealモーション等
   - **`tasks.md`**：Phase 1〜4への実装切り分けと、詳細なDoD（完了定義）チェックリスト
   - **`figma_make_prompt.md`**：Figma Make（Task/Context/Elements/Behavior/Constraints）構造に準拠した変数バインド用コピペプロンプト
   - **`README.md`**：Next.js見送りの合理的な理由、sessionStorageとXSS対策のセキュリティ設計思想
3. **【自動品質ゲート2】AI仕様間自動クロスレビューの実行**：
   一括生成が完了した直後、即座に「AI QA Lead」として各仕様書間の論理的な一貫性をクロススキャンしてください。
   - 要件（`requirements.md`）と技術設計（`design.md`）の整合性（例：未キー時のフォールバック先が、状態遷移図や仕分けロジックと一致しているか等）
   - 設計（`design.md`）とデザインシステム（`Guidelines.md`）の整合性（例：コンポーネント幅やテーマ規約に矛盾がないか等）
4. **クロスレビュー履歴の追記**：
   検証した結果と対策を、`review_history.md` の下部に「## 下流仕様・設計の相互整合性レビュー（フェーズ2）」セクションとして自動でアペンド（追記）して記録してください。
5. **最終一時停止と待機**：
   すべての自動検証ログが記録された段階で、実装（`index.html` のコーディング）に入る前の人間の最終サインオフを待つため、再度処理を完全に停止してください。

</spec_driven_inception_framework>
