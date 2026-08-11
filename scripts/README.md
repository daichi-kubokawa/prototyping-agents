# scripts/ ―― 決定論的な検査

**AI の自己申告を検証とみなさないための仕組み。** 機械が判定できるものだけを引き受け、
判断が要るものには触れない。すべて Python 標準ライブラリのみで動く（依存パッケージなし）。

| スクリプト | 対象 | 見るもの |
|---|---|---|
| `check_no_hardcode.py` | 再利用層 | 散文に色値・既定書体名が無いか（**最も重大な違反**） |
| `check_contrast.py` | `Guidelines.md` | WCAG 相対輝度から比率を**再計算**し、要求値の充足を判定 |
| `check_upload_safety.py` | アップロード対象5点 | 生の発言・`briefing.md` 参照・実URL・資格情報 |
| `check_forbidden.py` | 回収した実装コード | `innerHTML` 等の禁止識別子、インライン `on*` |
| `verify_all.py` | 全体 | 上記4本の入口。案件は `examples/` から自動検出 |
| `hook_verify.py` | ― | PostToolUse フックの振り分け（Claude Code が呼ぶ） |

```
python3 scripts/verify_all.py
```

## 終了コードで判定する

目視の余地を残さないため、すべて終了コードを返す。`check_contrast.py` だけ3値を持つ。

```
0  すべて要求を満たす
1  実測が要求を下回る      本当の違反。色値そのものを変える
3  記載と実測が食い違う    帳簿の誤り。--fix で自動解消
```

**1 と 3 を区別するのが要点。** 比率の書き間違いは可読性の欠陥ではないため、商談を止める理由がない。

## 比率は人が書かない

`Guidelines.md` の比率の列は `—` のままにする。`--fix` が計算して埋める。

```
python3 scripts/check_contrast.py examples/<案件名>/Guidelines.md --fix
```

WCAG の相対輝度はガンマ補正を含む計算であり、**暗算させると遅く、かつ間違える。**
算術を書き手から取り上げることで、誤りと差し戻しの両方が消える。

## いつ走るか

| 経路 | タイミング | 止めるか |
|---|---|---|
| PostToolUse フック | `Guidelines.md` や実装コードを書いた瞬間 | 本当の違反のみ（exit 2） |
| `/draft` の S-5 | `product-agent` が返った直後 | 止めずにその場で直す |
| `/iterate` の検証ゲート | 商談後 | `FAIL` なら差し戻し |
| GitHub Actions | push のたび | CI が赤くなる |

**チェックリストは静かに飛ばされる。フックと CI は飛ばされない。**

## 変更するとき

- **偽陽性を出さない。** 一度でも誤検出すると、以後 `--no-verify` で回避される
- 検査を足したら `verify_all.py` に登録する。CI は `verify_all.py` しか知らない
- 依存パッケージを増やさない。**商談前に `pip install` が要る検査は、無いのと同じ**である
