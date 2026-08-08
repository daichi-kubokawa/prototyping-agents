# フロントエンド防衛規約（OWASP XSS の構造的排除）

`design.md` の「セキュリティ設計」節に、**実装者がそのまま従える規約（MUST）**として転記すること。
抽象論（「XSS に注意する」等）で済ませてはならない。

## 1. DOM バインドの絶対規約

- **`innerHTML` / `outerHTML` / `insertAdjacentHTML` / `document.write` による
  ユーザー入力・外部応答・AI 生成テキストの展開を全面的に禁止する。**
  これは「原則」ではなく「例外なき禁止」である
- すべての動的要素は **`document.createElement()` で生成**し、
  テキストの流し込みは **`.textContent`（または `.innerText`）経由に限定**する
- 属性値の設定は `setAttribute()` を用い、**`href` / `src` / `formaction` など URL を解釈する属性には、
  `javascript:` および `data:` スキームを拒否する検証を必須**とする
- イベントハンドラは `addEventListener` でのみ束縛する。
  `onclick=` 等のインライン属性文字列、`eval()`、`new Function()`、文字列引数の `setTimeout` を禁止する
- **テンプレートリテラルによる HTML 文字列組み立ては、たとえ静的に見えても禁止**する
  （後続の改修で変数が混入する経路を、構造的に断つため）
- フレームワークを採用する場合、その**エスケープ回避 API**
  （`dangerouslySetInnerHTML`、`v-html`、`@html` 等）を同様に全面禁止とし、規約に実名で列挙する
- 多層防御として Content-Security-Policy の方針
  （`script-src` から `unsafe-inline` / `unsafe-eval` を排除）を併記する

## 2. 禁止識別子リスト（`Guidelines.md` に掲載すること）

レビュー時に grep で機械的に検知できるよう、以下を静的チェック一覧として掲載する。

```
innerHTML
outerHTML
insertAdjacentHTML
document.write
eval(
new Function(
dangerouslySetInnerHTML
v-html
```

チェック手順：`grep -rn -f <上記リスト> <対象ファイル>` で 0 件であることを確認する。

## 3. サニタイズが不可避な場合の唯一の例外

リッチテキスト表示など、HTML の構造保持が**要件として明示されている場合に限り**、
実績あるサニタイザライブラリの利用を許可する。この場合、`design.md` に以下を明記すること。

- なぜ `textContent` では要件を満たせないのか
- 許可タグ・許可属性のホワイトリスト
- サニタイズを通過する信頼境界（Trust Boundary）

**自作の正規表現によるサニタイズは、いかなる場合も禁止する。**

## 4. 秘匿情報の保持

保持先（メモリ／セッション／永続）は、`requirements.md` のライフサイクル要件に**一字一句従う**。
要件が永続化を禁じているなら、設計に永続化やキャッシュを示唆する記述が**1文字でも**混入してはならない。
