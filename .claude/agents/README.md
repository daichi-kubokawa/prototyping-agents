# agents/ ―― エージェント定義

各エージェントの**役割・担当ステージ・絶対禁止事項・自己検証**を定義する。
Claude Code が起動時に読み込み、サブエージェントとして登録する（`/agents` で確認できる）。

方法論の本体は `../knowledge/` にある。ここには**「常に効いていなければ困ること」だけ**を置く。

## 3体の分担

| ファイル | 役割 | 主な成果物 |
|---|---|---|
| `product-agent.md` | AI Product Manager | `briefing.md` / `requirements.md` ―― 利用文脈 C-1〜C-5 とスコープ |
| `design-agent.md` | AI Technical Lead & UX Designer | `design.md`（ADR）/ `screens.md` / `content.md` / `Guidelines.md` / `figma_make_prompt.md` |
| `quality-agent.md` | AI QA Lead & Technical Writer | `review_history.md` / `tasks.md`（引き渡し資料） |

本家 AI-DLC の11体構成を3体に集約している。`design-agent` が architect の設計権限を、
`quality-agent` が devsecops と delivery の責務を吸収する。
**各ファイルの冒頭に、どの責務を吸収したか明記してある。**

> 担当ステージの正は、各ファイルの「担当ステージ（Lead）」表である。本 README は要約しない。

## 受け渡しの契約

3体は以下の記号で会話する。**この鎖が切れると設計が導出できない。** 委譲は1エージェントにつき1回にまとめる。

```
product-agent          design-agent            quality-agent
─────────────          ────────────            ─────────────
C-1〜C-5          →    D-01 輝度極性      →    V-2 トレーサビリティ検査
（利用文脈）            D-02 操作アンカー         「D-01/D-02 は C のどれに由来？」
                                                 遡れなければ差し戻し
```

## 変更するとき

- **知識を足したくなったら、まず `../knowledge/` を検討する。** ここに書くのは、
  読み込みが失敗したときに事故になるもの（絶対禁止事項）に限る
- **4体目を作る前に、既存3体の責務を広げられないか考える。** エージェントが増えると
  受け渡しの契約も増え、整合性の検査コストが跳ね上がる
- 具体的な色値・フォント名・レイアウト形状を書いてはならない（再利用層のため）
