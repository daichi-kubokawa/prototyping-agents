#!/usr/bin/env python3
"""ゼロ・ハードコード原則の機械的検査（再利用層）。

再利用層（.claude/agents, .claude/knowledge, prompts）に、特定プロダクトの
具体値が「答え」として書かれていないかを検出する。
本フレームワークで最も重大とされる設計違反を、自己申告ではなく機械で判定する。

コードブロック内（``` で囲まれた範囲）はテンプレートの記入例とみなし、対象外とする。
散文に具体値が書かれている場合のみ違反とする。

  使い方: python3 scripts/check_no_hardcode.py
  終了コード: 0 = 検出0件 / 1 = 検出あり
"""
import os
import re
import sys

TARGETS = [".claude/agents", ".claude/knowledge", "prompts"]
HEX = re.compile(r"#[0-9A-Fa-f]{6}\b")
# 既定値としての書体名（P-2）。散文で「採用する」形で出たら疑う
FONTS = re.compile(r"\b(Inter|Roboto|Helvetica Neue|system-ui)\b")
ALLOW = re.compile(r"(禁止|してはならない|使わない|無思考|例|サンプル|検出|grep|P-2)")


def scan(path):
    hits, infence = [], False
    for n, line in enumerate(open(path, encoding="utf-8"), 1):
        st = line.lstrip()
        if st.startswith("```") or st.startswith("~~~"):
            infence = not infence
            continue
        if infence or st.startswith(">") or st.startswith("|"):
            continue  # 引用・表は仕様の記述であり、記入例を含む
        if ALLOW.search(line):
            continue
        for pat, label in ((HEX, "色値"), (FONTS, "既定値としての書体名")):
            m = pat.search(line)
            if m:
                hits.append((n, label, m.group(0), line.strip()[:70]))
    return hits


def main():
    total, scanned = 0, 0
    for root in TARGETS:
        for dirpath, _, files in os.walk(root):
            for f in sorted(files):
                if not f.endswith(".md"):
                    continue
                p = os.path.join(dirpath, f)
                scanned += 1
                for n, label, val, ctx in scan(p):
                    print(f"{p}:{n}: {label} '{val}' が散文に出現 ―― {ctx}", file=sys.stderr)
                    total += 1
    if total:
        print(f"\n[FAIL] ゼロ・ハードコード違反 {total}件（{scanned}ファイル走査）", file=sys.stderr)
        print("再利用層に具体値を書いてはならない。利用文脈から導出させること。", file=sys.stderr)
        return 1
    print(f"[PASS] ゼロ・ハードコード違反 0件（{scanned}ファイル走査）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
