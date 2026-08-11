#!/usr/bin/env python3
"""検査を一括実行する。CI とローカルの両方から呼ぶ入口。

  再利用層  ゼロ・ハードコード原則
  案件層    コントラスト検算／アップロード安全性／禁止識別子（回収した実装コード）

案件は examples/ 配下から自動検出する。存在しない検査対象は SKIP とする。

  使い方: python3 scripts/verify_all.py
  終了コード: 0 = 全件 PASS / 1 = FAIL あり
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CODE_EXT = {".tsx", ".ts", ".jsx", ".js", ".html", ".vue", ".svelte"}


def run(script, *args):
    r = subprocess.run([sys.executable, os.path.join(HERE, script), *args],
                       capture_output=True, text=True, cwd=ROOT)
    sys.stdout.write(r.stdout)
    sys.stderr.write(r.stderr)
    return r.returncode


def code_dirs(case):
    """figma_output 配下で実装コードを含む最上位ディレクトリを返す。"""
    base = os.path.join(case, "figma_output")
    found = []
    if not os.path.isdir(base):
        return found
    for run_dir in sorted(os.listdir(base)):
        rp = os.path.join(base, run_dir)
        if not os.path.isdir(rp):
            continue
        for dirpath, _, files in os.walk(rp):
            if any(os.path.splitext(f)[1] in CODE_EXT for f in files):
                found.append(rp)
                break
    return found


def main():
    fails, ran = [], 0

    print("── 再利用層 ──")
    ran += 1
    if run("check_no_hardcode.py") != 0:
        fails.append("ゼロ・ハードコード")

    examples = os.path.join(ROOT, "examples")
    cases = sorted(d for d in os.listdir(examples)
                   if os.path.isdir(os.path.join(examples, d))) if os.path.isdir(examples) else []
    if not cases:
        print("\n── 案件層 ── 対象なし（SKIP）")

    for c in cases:
        case = os.path.join("examples", c)
        print(f"\n── 案件層: {c} ──")
        g = os.path.join(case, "Guidelines.md")
        if os.path.exists(os.path.join(ROOT, g)):
            ran += 1
            if run("check_contrast.py", g) != 0:
                fails.append(f"{c}: コントラスト")
        else:
            print("[SKIP] Guidelines.md なし")

        ran += 1
        if run("check_upload_safety.py", case) != 0:
            fails.append(f"{c}: アップロード安全性")

        dirs = code_dirs(os.path.join(ROOT, case))
        if dirs:
            for d in dirs:
                ran += 1
                if run("check_forbidden.py", os.path.relpath(d, ROOT)) != 0:
                    fails.append(f"{c}: 禁止識別子")
        else:
            print("[SKIP] 回収した実装コードなし")

    print("\n" + "=" * 52)
    if fails:
        print(f"[FAIL] {len(fails)}件 / 実行 {ran}件")
        for f in fails:
            print(f"  - {f}")
        return 1
    print(f"[PASS] 全 {ran} 件の検査を通過")
    return 0


if __name__ == "__main__":
    sys.exit(main())
