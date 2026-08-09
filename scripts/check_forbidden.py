#!/usr/bin/env python3
"""禁止識別子の静的チェック（DOM XSS 防御・OWASP 準拠）。

frontend-security.md の禁止識別子リストを、生成物に対して機械的に検出する。
「転記したか」ではなく「実際に混入していないか」を判定することが目的である。

  使い方: python3 scripts/check_forbidden.py <file|dir> [...]
  終了コード: 0 = 検出0件 / 1 = 検出あり
"""
import os
import re
import sys

# 識別子 → 代替手段
FORBIDDEN = {
    "innerHTML": ".textContent を使う",
    "outerHTML": "createElement() で組み立てる",
    "insertAdjacentHTML": "createElement() + appendChild",
    "document.write": "DOM API で挿入する",
    "dangerouslySetInnerHTML": "children として渡す",
    "v-html": "マスタッシュ構文で束縛する",
    "eval(": "静的に書く",
    "new Function(": "静的に書く",
}
INLINE_ON = re.compile(r"\son[a-z]+\s*=\s*[\"']")
STR_TIMER = re.compile(r"set(?:Timeout|Interval)\s*\(\s*[\"']")
EXT = {".html", ".htm", ".js", ".mjs", ".jsx", ".ts", ".tsx", ".vue", ".svelte"}


def scan(path):
    hits = []
    try:
        lines = open(path, encoding="utf-8", errors="replace").read().split("\n")
    except OSError as e:
        return [(0, str(e), "")]
    for n, line in enumerate(lines, 1):
        for ident, fix in FORBIDDEN.items():
            if ident in line:
                hits.append((n, ident, fix))
        if INLINE_ON.search(line):
            hits.append((n, "インライン on* ハンドラ", "addEventListener を使う"))
        if STR_TIMER.search(line):
            hits.append((n, "文字列引数の setTimeout/setInterval", "関数を渡す"))
    return hits


def targets(args):
    for a in args:
        if os.path.isdir(a):
            for root, _, files in os.walk(a):
                if any(p in root for p in (".git", "node_modules", "_to_delete")):
                    continue
                for f in files:
                    if os.path.splitext(f)[1] in EXT:
                        yield os.path.join(root, f)
        elif os.path.splitext(a)[1] in EXT:
            yield a


def main():
    if len(sys.argv) < 2:
        print("usage: check_forbidden.py <file|dir> [...]", file=sys.stderr)
        return 0
    total, scanned = 0, 0
    for path in targets(sys.argv[1:]):
        scanned += 1
        hits = scan(path)
        for n, ident, fix in hits:
            print(f"{path}:{n}: 禁止識別子 {ident} ―― {fix}", file=sys.stderr)
        total += len(hits)
    if total:
        print(f"\n[FAIL] 禁止識別子 {total}件（{scanned}ファイル走査）", file=sys.stderr)
        return 1
    print(f"[PASS] 禁止識別子 0件（{scanned}ファイル走査）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
