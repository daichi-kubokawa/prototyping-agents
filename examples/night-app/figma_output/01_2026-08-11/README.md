# 回収手順（このディレクトリに Figma Make の出力を入れる）

1. Figma Make の **Code** 表示 → **右上のダウンロードアイコン** → zip を取得
   （左隣はコード整形。押し間違えないこと）
2. 展開したプロジェクトフォルダごと、このディレクトリの直下に置く
   ―― `node_modules` / `dist` / ロックファイル / zip 本体は残さない
3. 置いたら、下の3つを実行して照合できる状態か確かめる

    grep -r "<content.md の表示文字列の一部>" .
    python3 ../../../../scripts/check_forbidden.py .
    python3 ../../../../scripts/check_upload_safety.py ./<プロジェクト名>/src/imports/

**空のまま `/iterate` を実行した場合**、「伝票のみを根拠に仕様を更新した」と記録され、
画面と仕様のズレは埋まらないまま次の商談に入ることになる。
