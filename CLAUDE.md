# AI Developer Rules（リポジトリ共通）

本リポジトリで作業する AI エージェント（Claude Code 等）が遵守すべき、リポジトリ横断の制約と規約を定義する。
**案件固有のルールは、各案件ディレクトリ配下の `projects/<案件名>/CLAUDE.md` に置くこと。本ファイルに案件固有の具体値を書いてはならない。**

---

## 1. リポジトリの二層構造（最重要）

本リポジトリは、**プロダクトに依存しない再利用層**と、**個別案件の成果物である案件層**の二層で構成される。
この分離を壊す変更を行ってはならない。

| 層 | 場所 | 性質 |
|---|---|---|
| **再利用層** | `.claude/agents/` `prompts/` | プロダクト非依存。具体的な色値・フォント名・レイアウト形状を含んではならない |
| **案件層** | `projects/<案件名>/` | 案件固有。利用文脈と、そこから導出された具体値が置かれる |

再利用層のエージェントは、案件層の `requirements.md`（利用文脈）を入力変数として、具体値を**導出**する。
再利用層に具体値をハードコードすることは、本リポジトリにおける最も重大な設計違反とみなす。

---

## 2. ディレクトリ構成

```
aidlc-learning/
├── .claude/
│   └── agents/                    再利用層：エージェント定義（Claude Code が自動認識）
│       ├── product-agent.md       AI Product Manager
│       ├── design-agent.md        AI Technical Lead & UX Designer
│       └── quality-agent.md       AI QA Lead & Technical Writer
│
├── prompts/                       再利用層：ワークフロー定義
│   └── inception_briefing.md      仕様駆動インセプション・フレームワーク
│
├── projects/                      案件層
│   └── <案件名>/
│       ├── CLAUDE.md              案件固有ルール
│       ├── briefing.md            SSoT（Why & Who）
│       ├── requirements.md        要件定義（利用文脈 C-1〜C-5）
│       ├── design.md              技術設計（ADR: D-01 輝度極性 / D-02 操作アンカー）
│       ├── Guidelines.md          デザインシステム規約（トークン）
│       ├── figma_make_prompt.md   Figma Make 連携プロンプト
│       ├── review_history.md      人間とAIのレビュー履歴・サインオフ証跡
│       ├── tasks.md               DoD 付き実装タスク（顧客反復の収束後に生成）
│       └── index.html             プロトタイプ本体
│
├── CLAUDE.md                      本ファイル
├── README.md                      リポジトリの入口
└── local_env.json                 動的パラメータ（Git 追跡外）
```

---

## 3. エージェントの起動

エージェント定義は `.claude/agents/` に配置されており、Claude Code のサブエージェントとして登録される。
登録状況は `/agents` で確認できる。

エージェント間の委譲はオーケストレータ（人間または上位セッション）が行う。
各エージェントは `disallowedTools: Task` により、自らサブエージェントを起動することを禁止されている。

---

## 4. 共通ガードレール

### 🛡️ シークレットの完全遮断
`local_env.json` に含まれる外部サービスの実URL・アクセスキー・個人が特定される生ヒアリング内容を、
ソースコードおよび生成される Markdown へ平文で出力してはならない。
必ず `[Confidential]` 等のプレースホルダーへマスクすること。Git 公開時の漏洩リスクを物理的に遮断する。

### 🔒 DOM XSS 防御（OWASP 準拠）
ユーザー入力・外部応答・AI 生成テキストを DOM へ展開する際、
`innerHTML` / `outerHTML` / `insertAdjacentHTML` / `document.write`、
およびテンプレートリテラルによる HTML 文字列組み立てを**全面的に禁止**する。
要素は `document.createElement()` で生成し、テキストは `.textContent` 経由でのみバインドすること。
フレームワークのエスケープ回避 API（`dangerouslySetInnerHTML`、`v-html` 等）も同様に禁止する。

### 🗣️ 言語規約
思考プロセス（Reasoning）、および生成するすべての Markdown・プロンプトは、洗練された**日本語**で統一する。
技術用語・トークン名・コード識別子は原語のまま用いてよいが、説明文・見出し・論証は例外なく日本語とする。

### 📐 層の厳守
- 要件（`requirements.md`）に技術的解法を書いてはならない。書くのは目的と制約である
- 設計（`design.md`）の具体値は、すべて利用文脈まで遡る導出根拠を持たなければならない
- 上流に存在しない情報を、下流で確定事項として捏造してはならない。推測は Assumptions、不足は Open Questions として明示する

### 🔁 整合性の優先順位
仕様間で矛盾が生じた場合、以下の序列で解決する。

1. `briefing.md` → 2. `requirements.md` → 3. `design.md` → 4. `Guidelines.md`
→ 5. `figma_make_prompt.md` → 6. `tasks.md` → 7. `README.md`

---

## 5. 開発・品質コマンド

- **プレビュー**: `projects/<案件名>/index.html` をブラウザで直接開く。ビルドパイプラインもバンドラも持たない（YAGNI 原則）
- **品質・セキュリティ監査**: `.claude/agents/quality-agent.md` を起動する
- **レビュー履歴**: すべてのアーキテクチャ意思決定と人間/AI のレビューは、
  `projects/<案件名>/review_history.md` へ**追記（アペンド）**する。過去の記録を上書き・削除してはならない
