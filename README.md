# リンガポルタ完全自動化ツール【簡単インストール】

![Screenshot](https://raw.githubusercontent.com/Raptor-zip/LINGUAPORTA/main/image/readme.png)

COCET 2600(理工系学生のための必須英単語 2600)のLINGUAPORTA(リンガポルタ)を自動化するツール(ボット)です。
Raptor-zipさんのものが動かなくなっていたためフォークして作成しました。

# ✨機能
獲得するスコア、回答入力遅延、正答率、単元を選んで、スタートボタンをクリックすると、自動で問題を解きます。

# 💻動作環境
- Google ChromeやMicrosoft EdgeなどのWebブラウザ
- スマートフォンでも拡張機能が動作すれば動きます

# 🛠️導入方法
1. [GitHubから最新版のZIPファイルをダウンロード](https://github.com/wasuhosu/LINGUAPORTA/releases)する。
2. ダウンロードしたファイル「LINGUAPORTA-main.zip」を右クリックして「すべて展開...」をクリックする。
3. Webブラウザを開く。
4. 右上のその他アイコン(…) > [拡張機能] > [[拡張機能の管理](chrome://extensions)] を選択する。
5. 右上の「デベロッパー モード」をオンにする。
6. 左上の「パッケージ化されていない拡張機能を読み込む」をクリックする。
7. 展開したフォルダーを選択する。
8. 「フォルダーの選択」をクリックする。

> ※「エラーマニフェスト ファイルが見つからないか、読み取ることができません」と表示された場合、選択したフォルダーが間違っているので、よく確認してください。

# 🏄使い方
## 実行するとき
1. [リンガポルタ レッドゲートのログイン画面](https://w5.linguaporta.jp/user/seibido/)を開く。
2. IDとパスワードを入力する（ブラウザに保存されるので、2回目以降は入力不要）。
3. 獲得したいスコアと回答までの遅延と正答率をスライダーを動かして設定する。
4. `スタート`ボタンをクリックする。

### 中断するとき
- タブを閉じる
- もしくは`ログアウト`ボタンをクリックする。

### 一時的にOFFにするとき
- ログイン画面の「自動化ON」のスイッチをOFFにする。

### 完全にOFFにするとき
1. 右上のその他アイコン(…) > [拡張機能] > [[拡張機能の管理](chrome://extensions)] を選択する。
2. `リンガポルタ自動化`のスイッチをオフにする。

## バージョンアップするとき
- 導入時と同じように操作する。
- バージョンは、「拡張機能の管理」から確認できる。

## cocetの単語一覧が欲しいとき
- [このリンク](https://docs.google.com/spreadsheets/d/1eFdhcYB929fUKS98lbgRFl8qBcTHPkXOvHve9rE61XM/edit?usp=sharing)をクリックすると集まった解答データを見ることができます(100%正しいとは言い切れません)

# ⚙️答えがわかる仕組み
- クラウドベースの解答共有システム  
  拡張機能の利用者は、解答をクラウド上で共有しています。最初に問題を解いたユーザーの正解がサーバーに保存され、  
  その後のユーザーはその保存された正解を参照して解答を得ることができます。

# 🔒 セキュリティについて
- サーバーには日付・問題番号・解答のみが保存され、自分の名前・ID・パスワードなどは一切送信されません

# 🏠 セルフホスト（独自サーバーの構築）

独自のGoogle Apps Script (GAS) サーバーを構築することで、解答データを自分で管理できます。

## セルフホストのメリット
- **プライバシー保護**: 解答データが第三者のサーバーに送信されません
- **カスタマイズ性**: 独自の機能追加や改良が可能
- **安定性**: 他のユーザーのアクセス状況に影響されません

## 構築手順

### 1. Google Spreadsheetの作成
1. [Google Spreadsheet](https://sheets.google.com/)で新しいスプレッドシートを作成
2.  `空所補充`・`単語の意味`シートを作成


### 2. Google Apps Scriptの設定
1. スプレッドシートで「拡張機能」→「Apps Script」を選択
2. `LINGUAPORTA_Server/Code.js`(別リポジトリ) の内容をコピー&ペースト
3. `YOUR_SPREADSHEET_ID` を実際のスプレッドシートIDに置換
   - スプレッドシートのURLの `https://docs.google.com/spreadsheets/d/[ここがID]/edit` 部分
4. 「保存」をクリック

### 3. Webアプリとしてデプロイ
1. Apps Scriptで「デプロイ」→「新しいデプロイ」を選択
2. 種類を「ウェブアプリ」に設定
3. 以下の設定を行う：
   - 実行者: 自分のアカウント
   - アクセスできるユーザー: 全員（匿名ユーザーを含む）
4. 「デプロイ」をクリック
5. 表示されるWebアプリURLをコピー

### 4. 拡張機能での設定
1. リンガポルタのログイン画面で「詳細設定」タブを開く
2. 「GAS URL」フィールドに先ほどのWebアプリURLを入力
3. 設定は自動保存されます

## サーバー機能
- **GET機能**: 問題番号から解答データを取得
- **SET機能**: 新しい解答データをスプレッドシートに保存
- **重複除去**: 同一問題の重複登録を自動防止
- **エラーハンドリング**: 適切なエラーレスポンスを返却

## セキュリティ注意事項
- スプレッドシートのアクセス権限を適切に設定してください
- 定期的にスプレッドシートの内容を確認してください
- 不要になったデプロイは無効化してください

## トラブルシューティング
- **403エラー**: GASの実行権限を確認してください
- **シートが見つからない**: シート名が `QuestionDB` になっているか確認してください  
- **データが保存されない**: スプレッドシートのIDが正しく設定されているか確認してください

> `拡張機能の管理`画面で以下のエラーが表示されるが、ページ遷移時のセキュリティ上の仕様なので、問題ない。
> Refused to run the JavaScript URL because it violates the following Content Security Policy directive: "script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' http://localhost:* http://127.0.0.1:*". Either the 'unsafe-inline' keyword, a hash ('sha256-...'), or a nonce ('nonce-...') is required to enable inline execution. Note that hashes do not apply to event handlers, style attributes and javascript: navigations unless the 'unsafe-hashes' keyword is present.

# 注意
- まだ始めたてのため、解答データが不十分です。
- その影響で、ユニットによっては通常よりも時間がかかる場合があります。