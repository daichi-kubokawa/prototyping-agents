#!/usr/bin/env python3
"""Guidelines.md のカラートークン表を読み、WCAG 相対輝度からコントラスト比を再計算する。

申告値と実測値が食い違う場合、および要求値を下回る場合に FAIL とする。
エージェントの自己申告を人間が信じる状態をやめ、算術で決着させることが目的である。

  使い方: python3 scripts/check_contrast.py examples/<案件名>/Guidelines.md
  終了コード: 0 = 全件 PASS / 1 = FAIL あり / 2 = 表が見つからない
"""
import re
import sys

TOL = 0.1  # 申告値との許容差（丸め誤差の吸収）


def luminance(hex_color):
    h = hex_color.lstrip("#")
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


HEX = re.compile(r"#[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{3})?\b")
NUM = re.compile(r"(\d+(?:\.\d+)?)\s*:\s*1")


def parse(path):
    """| トークン | 値 | 対比相手 | 比率 | 要求 | の行を拾う。"""
    rows, tokens = [], {}
    for raw in open(path, encoding="utf-8"):
        if not raw.lstrip().startswith("|"):
            continue
        cells = [c.strip().strip("`") for c in raw.strip().strip("|").split("|")]
        if len(cells) < 5:
            continue
        name, value = cells[0], cells[1]
        if not HEX.fullmatch(value):
            continue
        tokens[name] = value
        rows.append((name, value, cells[2], cells[3], cells[4]))
    return rows, tokens


def main():
    if len(sys.argv) < 2:
        print("usage: check_contrast.py <Guidelines.md>", file=sys.stderr)
        return 2
    path = sys.argv[1]
    rows, tokens = parse(path)
    if not rows:
        print(f"[SKIP] {path}: カラートークン表が見つかりません", file=sys.stderr)
        return 2

    fails = []
    for name, value, against, claimed, required in rows:
        if against in ("", "-", "—", "ー"):
            continue
        peer = tokens.get(against.strip("`")) or (against if HEX.fullmatch(against) else None)
        if peer is None:
            fails.append(f"{name}: 対比相手 '{against}' を解決できません")
            continue
        actual = ratio(value, peer)
        cm, rm = NUM.search(claimed), NUM.search(required)
        if cm and abs(actual - float(cm.group(1))) > TOL:
            fails.append(
                f"{name}: 申告 {cm.group(1)}:1 だが実測 {actual:.2f}:1（{value} vs {peer}）")
        if rm and actual < float(rm.group(1)) - 1e-9:
            fails.append(
                f"{name}: 実測 {actual:.2f}:1 が要求 {rm.group(1)}:1 を下回る（WCAG 違反）")
        if (cm or rm) and not any(f.startswith(name + ":") for f in fails):
            print(f"[PASS] {name:16} {actual:6.2f}:1  ({value} vs {peer})")

    if fails:
        print(f"\n[FAIL] {path} ―― {len(fails)}件", file=sys.stderr)
        for f in fails:
            print(f"  - {f}", file=sys.stderr)
        return 1
    print(f"\n[PASS] {path} ―― 全 {len(rows)} トークンが要求を満たしています")
    return 0


if __name__ == "__main__":
    sys.exit(main())
