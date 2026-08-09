---
description: 確定した仕様から実装する（tasks.md → index.html → 検証ゲート3）
---

あなたは**オーケストレータ**です。確定した仕様を消費して、動くものを作ります。

## 1. 対象案件の決定

```
/build                    案件を一覧表示して選択させる
/build field-inspection   直接指定
```

$ARGUMENTS

引数が無ければ `examples/` 配下を一覧表示し、番号で選ばせる。

## 2. 準備

1. `prompts/inception_briefing.md` を Read で読み込む
2. `MODE` = **BUILD**
3. 対象案件配下の成果物をすべて Read で読み込む

## 3. 前提チェック

**BUILD は仕様を消費するパスである。仕様が固まっていなければ実行しない。**

| 状態 | 判定 | 動作 |
|---|---|---|
| `design.md` / `Guidelines.md` が無い | ❌ | 停止。`/draft` から始めるよう促す |
| `review_history.md` に検証ゲート1・2 の記録が無い | ⚠️ | **未検証の仕様で実装することを警告**して続行可否を問う |
| ゲート1・2 に未解消の `FAIL` がある | ❌ | 停止。`/iterate` での解消を促す |
| すべて `PASS` | ✅ | 実行 |

**未検証・FAIL 残存のまま実装すると、矛盾した仕様がそのままコードになる。**
仕様の欠陥はコードの欠陥より安く直せる。順序を飛ばさないこと。

## 4. 実行

### BD-1: 実装計画（`tasks.md`）

`.claude/knowledge/quality-agent/delivery-planning.md` に従い、`quality-agent` へ委譲する。

- Bolt 分解と依存 DAG。**最初の Bolt は必ず Walking Skeleton**（端から端まで貫通する最小構成）
- リスクの高い要素（外部連携、未検証の前提）を早い Bolt に前倒しする
- 各 Bolt に **機能・セキュリティ・UX・耐障害性**の4観点の DoD
- DoD は「実装した」ではなく「**何がどうなれば完了か**」を検証可能な文で書く

### BD-2: 実装

`design.md` / `screens.md` / `content.md` / `Guidelines.md` / `tasks.md` を入力として実装する。

- **`Guidelines.md` のトークン以外の具体値を持ち込まない。** 新しい色や寸法を発明しない
- **`content.md` がある場合、本文テキストはそこから転記する。** ダミーテキストを書かない
- `.claude/knowledge/shared/frontend-security.md` の DOM バインド規約を厳守する

### BD-3: 検証ゲート3

`quality-agent` へ委譲する。

- `tasks.md` の DoD 各項目に `PASS` / `FAIL` を付す
- **禁止識別子の静的チェックを実行し、0件を確認する**

  ```
  python3 scripts/check_forbidden.py examples/<案件名>/
  python3 scripts/check_contrast.py examples/<案件名>/Guidelines.md
  ```

  **目視ではなく終了コードで判定する。** 両方 0 でなければ FAIL とする
- 空状態・エラー状態・条件分岐が `screens.md` の定義どおり動くかを確認する

### BD-4: ドキュメント化（`README.md`）

技術構成の選定理由は **`design.md` の ADR に由来していなければならない**。
ADR に無い決定を README で創作してはならない。

## 5. 完了時の出力

- 生成したファイルのパス
- 検証ゲート3 の判定（DoD の PASS / FAIL 件数）
- **禁止識別子の検出結果（0件であること）**
- 未達の DoD があれば、その一覧と原因

`review_history.md` に `## 検証ゲート3: 実装 DoD 検証` として追記し、人間の最終確認を待って停止する。
