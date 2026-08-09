#!/usr/bin/env python3
"""アップロード対象ファイルに、外へ出してはならない情報が混入していないか検査する。

briefing.md を Figma Make へ渡さないという判断は、その中身が下流へ転記された時点で
無効になる。遮断はファイル単位では成立しないため、中身の移動を機械的に検出する。

  使い方: python3 scripts/check_upload_safety.py examples/<案件名>/
  終了コード: 0 = 検出0件 / 1 = 検出あり
"""
import os
import re
import sys

UPLOAD = ["requirements.md", "design.md", "screens.md", "content.md", "Guidelines.md"]

# (パターン, 指摘, 対処)
RULES = [
    (re.compile(r"発言引用|生の発言|ヒアリング発言"),
     "生の発言の引用マーカー", "由来を識別子（M-n / C-n）で示す"),
    (re.compile(r"briefing\.md"),
     "briefing.md への参照", "briefing.md は渡さない。参照も残さない"),
    (re.compile(r"https?://(?!www\.w3\.org|cheatsheetseries|www\.iso\.org)[^\s)\"'|]+"),
     "外部URL", "実URLは [Confidential] へ置換する"),
    (re.compile(r"(?i)(api[_-]?key|secret|token|password)\s*[:=]"),
     "資格情報らしき記述", "local_env.json から出さない"),
]


def main():
    if len(sys.argv) < 2:
        print("usage: check_upload_safety.py <案件ディレクトリ>", file=sys.stderr)
        return 0
    root = sys.argv[1]
    hits, scanned = 0, 0
    for name in UPLOAD:
        path = os.path.join(root, name)
        if not os.path.exists(path):
            continue
        scanned += 1
        for n, line in enumerate(open(path, encoding="utf-8"), 1):
            for pat, label, fix in RULES:
                if pat.search(line):
                    print(f"{path}:{n}: {label} ―― {fix}", file=sys.stderr)
                    print(f"    {line.strip()[:80]}", file=sys.stderr)
                    hits += 1
    if hits:
        print(f"\n[FAIL] アップロード安全性 {hits}件（{scanned}ファイル走査）", file=sys.stderr)
        return 1
    print(f"[PASS] アップロード安全性 検出0件（{scanned}ファイル走査）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
