#!/usr/bin/env python3
"""Guidelines.md のカラートークン表を、WCAG 相対輝度から検算する。

**比率は人（および LLM）が書かない。** 書くのは色値と要求値だけで、
実測比率は本スクリプトが計算して埋める。算術を書き手から取り上げることで、
暗算による誤りと、その差し戻しによる待ち時間の両方が消える。

  python3 scripts/check_contrast.py <Guidelines.md>          検査のみ
  python3 scripts/check_contrast.py <Guidelines.md> --fix    比率を計算して書き込む

終了コード
  0  すべて要求を満たす
  1  実測が要求を下回る（本当の違反。可読性の問題であり、直さねばならない）
  2  カラートークン表が見つからない
  3  記載された比率が実測と食い違う（帳簿の誤り。--fix で解消する）
"""
import re
import sys

TOL = 0.1
HEX = re.compile(r"#[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{3})?\b")
NUM = re.compile(r"(\d+(?:\.\d+)?)\s*:\s*1")
EMPTY = ("", "-", "—", "ー", "–")


def luminance(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    ch = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        ch.append(c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def cells_of(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    do_fix = "--fix" in sys.argv
    if not args:
        print("usage: check_contrast.py <Guidelines.md> [--fix]", file=sys.stderr)
        return 2
    path = args[0]
    lines = open(path, encoding="utf-8").read().split("\n")

    tokens = {}
    for line in lines:
        if not line.lstrip().startswith("|"):
            continue
        c = cells_of(line)
        if len(c) >= 5 and HEX.fullmatch(c[1].strip("`")):
            tokens[c[0].strip("`")] = c[1].strip("`")
    if not tokens:
        print(f"[SKIP] {path}: カラートークン表が見つかりません", file=sys.stderr)
        return 2

    violations, drifts, fixed, checked = [], [], 0, 0
    for i, line in enumerate(lines):
        if not line.lstrip().startswith("|"):
            continue
        c = cells_of(line)
        if len(c) < 5 or not HEX.fullmatch(c[1].strip("`")):
            continue
        name, value, against = c[0].strip("`"), c[1].strip("`"), c[2].strip("`")
        if against in EMPTY:
            continue
        peer = tokens.get(against) or (against if HEX.fullmatch(against) else None)
        if peer is None:
            violations.append(f"{name}: 対比相手 '{against}' を解決できません")
            continue

        actual = ratio(value, peer)
        checked += 1
        rm = NUM.search(c[4])
        if rm and actual < float(rm.group(1)) - 1e-9:
            violations.append(
                f"{name}: 実測 {actual:.2f}:1 が要求 {rm.group(1)}:1 を下回る（{value} vs {peer}）")
            continue

        shown = f"{actual:.2f}:1"
        cm = NUM.search(c[3])
        if c[3] in EMPTY or not cm:
            if do_fix:
                c[3] = shown
                lines[i] = "| " + " | ".join(c) + " |"
                fixed += 1
        elif abs(actual - float(cm.group(1))) > TOL:
            if do_fix:
                c[3] = shown
                lines[i] = "| " + " | ".join(c) + " |"
                fixed += 1
            else:
                drifts.append(f"{name}: 記載 {cm.group(1)}:1 だが実測 {actual:.2f}:1")
        print(f"[PASS] {name:22} {actual:6.2f}:1  ({value} vs {peer})")

    if do_fix and fixed:
        open(path, "w", encoding="utf-8").write("\n".join(lines))
        print(f"\n[FIX] 比率を {fixed} 件、実測値で埋めました")

    if violations:
        print(f"\n[FAIL] {path} ―― 要求を下回る {len(violations)}件", file=sys.stderr)
        for v in violations:
            print(f"  - {v}", file=sys.stderr)
        print("色値そのものを変えること。比率の書き換えでは解決しない。", file=sys.stderr)
        return 1
    if drifts:
        print(f"\n[DRIFT] {path} ―― 記載と実測の不一致 {len(drifts)}件", file=sys.stderr)
        for d in drifts:
            print(f"  - {d}", file=sys.stderr)
        print("--fix を付けて実行すれば解消する（帳簿の誤りであり、可読性の欠陥ではない）",
              file=sys.stderr)
        return 3
    print(f"\n[PASS] {path} ―― 全 {checked} 件が要求を満たしています")
    return 0


if __name__ == "__main__":
    sys.exit(main())
