#!/usr/bin/env python3
"""PostToolUse フック ―― 書き込まれたファイルに応じて決定論的な検査を走らせる。

自己点検チェックリストは「指示」であり、静かにサボられうる。
本フックは「機械が判定できるもの」だけを引き受け、判断が要るものには触れない。

  Guidelines.md   → コントラスト比の検算（check_contrast.py）
  実装コード       → 禁止識別子の検出（check_forbidden.py）

違反時は終了コード 2 を返し、内容を Claude に差し戻す。
ここで止めるのは「モードによらず緩まないガードレール」に限る（CLAUDE.md §3）。
検査そのものは常に走り、モードが変えてよいのは停止するかどうかだけである。
"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE_EXT = {".html", ".htm", ".js", ".mjs", ".jsx", ".ts", ".tsx", ".vue", ".svelte"}


def run(script, path):
    return subprocess.run(
        [sys.executable, os.path.join(HERE, script), path],
        capture_output=True, text=True)


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0  # 入力を解釈できないときは黙って通す。ワークフローを壊さない

    path = (payload.get("tool_input") or {}).get("file_path") or ""
    if not path or not os.path.exists(path):
        return 0

    base = os.path.basename(path)
    if base == "Guidelines.md":
        script = "check_contrast.py"
    elif os.path.splitext(path)[1] in CODE_EXT:
        script = "check_forbidden.py"
    else:
        return 0

    r = run(script, path)
    if r.returncode == 1:
        sys.stderr.write((r.stderr or r.stdout).strip() + "\n\n")
        sys.stderr.write(
            "上記は自動検査による検出です。修正してから次へ進んでください。\n"
            "コントラストは値を変えて再計算し、表の申告値も更新すること。\n")
        return 2  # Claude へ差し戻す
    return 0


if __name__ == "__main__":
    sys.exit(main())
