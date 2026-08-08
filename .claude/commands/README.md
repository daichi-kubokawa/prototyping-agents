# commands/ ―― スラッシュコマンド

Claude Code が起動時に走査し、**ファイル名をそのままコマンド名にする**。登録作業は不要。

```
draft.md      →  /draft
develop.md    →  /develop
preflight.md  →  /preflight
```

## 使い分け

| コマンド | いつ叩くか | 止まるか |
|---|---|---|
| `/preflight` | 商談・デモの**直前** | ―（点検のみ） |
| `/draft` | **商談中**。ヒアリング直後 | **止まらない**（目標8分で画面へ） |
| `/develop` | **商談後**。自分の机で | **止まる**（各ゲートでサインオフ待ち） |

`/draft` は引数でヒアリング内容を渡せる。FigJam MCP が使えないときのフォールバックになる。

```
/draft 夜勤の看護師が、巡回しながら片手でバイタルを記録したい。手袋着用。廊下は薄暗い。
/draft @inputs/parentsync-hearing.md
```

## コマンドは「起動の仕方」しか持たない

**手順そのものは `../../prompts/inception_briefing.md` にある。** コマンドはそれを読ませているだけ。

```
① /draft と打つ           → commands/draft.md の本文が展開される
② 本文が手順書を読ませる    → prompts/inception_briefing.md
③ 手順に沿って実行          → DR-1 → DR-2 → DR-3
④ Task で委譲              → ../agents/ の3体
⑤ 方法論を読む             → ../knowledge/
```

だから**手順を直したいときは `prompts/` を触る。** ここは基本もう触らない。

## 書式

- frontmatter の `description` → `/help` の一覧に出る
- 本文 → 打った瞬間、そのままプロンプトとして展開される
- `$ARGUMENTS` → コマンド名の後ろのテキストが差し込まれる

## 注意

- 変更は **Claude Code を再起動しないと反映されない**（起動時に読むため）
- `/preflight` の出力は画面共有される可能性がある。
  **`FIGJAM_URL` や鍵を出力しない**指示が入っている。編集時に消さないこと
- `/draft` の「一切停止しない」は、Claude Code の**権限プロンプトには勝てない**。
  リハーサルで1回通し、権限を「常に許可」で埋めておくこと
