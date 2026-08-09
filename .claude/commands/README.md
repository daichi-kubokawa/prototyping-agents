# commands/ ―― スラッシュコマンド

Claude Code が起動時に走査し、**ファイル名をそのままコマンド名にする**。登録作業は不要。

```
preflight.md  →  /preflight
draft.md      →  /draft
log.md        →  /log
develop.md    →  /develop
```

## 使い分け

| コマンド | いつ叩くか | 止まるか |
|---|---|---|
| `/preflight` | 商談・デモの**直前**（Meet 開始前に済ませる） | ―（点検のみ） |
| `/draft` | **商談中**。ヒアリング直後 | **止まらない** |
| `/log` | **商談中**。反復のたび | ―（1行追記のみ・数秒） |
| `/develop` | **商談後**。自分の机で | **止まる**（各ゲートでサインオフ待ち） |

### `/draft` ―― 引数で完結する

商談中に `local_env.json` を編集しないで済むよう、**`<案件名> <入力ソース>`** を引数で渡せる。
引数は `local_env.json` より優先される。

```
/draft                                          local_env.json のみ
/draft field-inspection                         案件名だけ（OUTPUT_DIR を導出）
/draft 設備点検アプリ https://figma.com/board/x  案件名 + FigJam
/draft 設備点検アプリ @inputs/hearing.md         案件名 + 外部ファイル
/draft 設備点検アプリ 屋外で手袋をつけた作業員が… 案件名 + 直接メモ
```

入力ソースは形で自動判別する（`http` → FigJam / `@` → ファイル / それ以外 → メモ本文）。
解決した出力先は報告の冒頭に明示される。

> ⚠️ FigJam URL を引数で打つと**画面に映る**。画面共有中は `local_env.json` に置いたままにする。

### `/log` ―― 反復ログを数秒で残す

DR-3（顧客反復）で使う。**所要時間は前行との差から自動算出**されるので、時計を見る必要はない。

```
/log もっと明るく → 背景トークン
/log 押しにくい → W/D
```

このログは「速さ」を裏づける**唯一の証跡**である。仕様書に速度は残らない。

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
