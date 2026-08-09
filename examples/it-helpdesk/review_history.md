# review_history.md — レビュー履歴・改修ログ

> 追記専用。過去の記録を上書き・削除してはならない。

## 保留指摘（DRAFT）

- 2026-08-10 DR-2 完了直後の advisory スキャン（オーケストレータ自身が実施）
  - S-1（解法の混入）: 検出なし。`briefing.md` / `requirements.md` に配色・レイアウト・技術構成の指定は無い
  - S-2（機密の平文）: 検出なし。`FIGJAM_URL` は `briefing.md` 内で `[Confidential: FigJam board URL]` にマスク済み
  - S-3（DOM バインド）: `figma_make_prompt.md` の Constraints に innerHTML 系禁止と禁止識別子リストを確認
  - S-4（C-3/C-4 の欠落）: 完全欠落ではなく、Assumption ＋ Open Question として明示済み（`requirements.md` §1, §6）
  - S-5（アップロード安全性）: `scripts/check_upload_safety.py examples/it-helpdesk` を実行、0件（5ファイル走査）で PASS
  - 併せて `scripts/check_contrast.py` PASS（8トークン全件）、`scripts/check_forbidden.py` PASS（0件）を確認

## 顧客反復ログ

| # | 時刻 | お客様の言葉 | 写像先 | 所要 | 上流への反映 |
|---|---|---|---|---|---|
| 1 | 07:07:29 | 「ヘッダーに少し色が欲しい」 | — | — | — |

## 検証ゲート1: 上流ブリーフ ➔ 要件定義への移行前レビュー

（ITERATE パスで実施）

## 検証ゲート2: 下流仕様・設計の相互整合性レビュー

（ITERATE パスで実施）

## 検証ゲート3: 実装 DoD 検証

（BUILD パスで実施）
