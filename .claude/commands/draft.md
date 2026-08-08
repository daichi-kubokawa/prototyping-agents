---
description: DRAFT パスを実行する（商談中・止まらない・目標8分で画面へ）
---

あなたは**オーケストレータ**です。以下を順に実行してください。

## 1. 準備

1. `prompts/inception_briefing.md` を Read で読み込む（**これが実行手順の正**。以下は起動指示にすぎない）
2. `local_env.json` から `PROJECT_NAME` / `OUTPUT_DIR` / `PROJECT_SUMMARY` / `FIGJAM_URL` / `RAW_HEARING_MEMO` をバインドする
3. `MODE` = **DRAFT**

引数が渡されている場合、それを `RAW_HEARING_MEMO` として **`local_env.json` の値より優先**する。

- 引数が**ファイルパス**（`@inputs/xxx.md` 等）なら、その中身を Read して入力とする
- 引数が**テキスト**ならそのまま入力とする
- 外部整理ツール（NotebookLM 等）の出力を渡された場合は、
  `.claude/knowledge/product-agent/hearing-inputs.md` の「取り込み方」に従い、
  **二次情報である旨を `briefing.md` の Assumptions に明記**する

$ARGUMENTS

## 2. 実行

`inception_briefing.md` の **DRAFT パス（DR-1 → DR-2 → DR-3）** を実行する。

- 各工程は Task ツールで担当サブエージェント（`product-agent` / `design-agent`）へ委譲する
- **一切停止しない。** 確認を求めず、承認を待たず、DR-2 の完了まで走り切る
- 検証は **advisory**。`FAIL` は `review_history.md` の `## 保留指摘（DRAFT）` へ追記して次へ進む。差し戻しも再生成もしない
- `FIGJAM_URL` の MCP 接続は **2回失敗したら即座に `RAW_HEARING_MEMO` へフォールバック**する。接続で粘らない
- C-3（装置）／C-4（物理環境）が欠けていたら、推測で埋めて Open Questions に記録し、進む

### 進行を止めずに警告する3つ

以下だけは、報告の**冒頭に1行**で警告する（ただし進行は止めない）。

1. 機密情報が平文で混入している
2. `innerHTML` 系の危険なバインドが設計に混入している
3. 利用文脈 C-3 または C-4 が**完全に**欠落している

## 3. 完了時の出力（重要：簡潔に）

**長い要約は書かないこと。** 商談中に読む時間はない。以下だけを出力する。

1. ⚠️ 上記3警告があれば1行で
2. 生成したファイルのパス一覧
3. **D-01（輝度極性）**: 決定 ＋ 根拠を1行
4. **D-02（操作アンカー）**: 決定 ＋ 根拠を1行
5. 保留指摘の件数（内容は列挙しない）
6. **`figma_make_prompt.md` の全文を、そのままコピーできる形でコードブロックに出力**

6が最優先です。これを Figma Make に貼るところまでが DRAFT パスの目的です。
