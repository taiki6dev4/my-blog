# お知らせアプリ

お知らせの投稿とコメント機能、PWAプッシュ通知に対応したアプリケーションです。

## 機能

- **管理者機能**
  - ログイン認証
  - Markdown形式でのお知らせ投稿
  - 新規お知らせ投稿時の自動プッシュ通知

- **参加者機能**
  - ログイン認証
  - お知らせの閲覧
  - お知らせへのコメント投稿

- **PWA対応**
  - アプリとしてインストール可能
  - プッシュ通知対応
  - オフライン対応

## 技術スタック

- **フレームワーク**: Next.js 15
- **認証**: NextAuth.js v5
- **データベース**: SQLite + Prisma ORM
- **スタイリング**: Tailwind CSS
- **テスト**: Jest + Testing Library
- **PWA**: Service Worker + Web Push API

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. データベースの初期化

```bash
npx prisma migrate dev
```

### 3. テストユーザーの作成

```bash
npm run create-users
```

以下のユーザーが作成されます:
- **管理者**: username=`admin`, password=`admin123`
- **参加者**: username=`user1`, password=`user123`

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## 環境変数

`.env`ファイルに以下の環境変数が設定されています:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
```

### VAPIDキーの再生成

プッシュ通知用のVAPIDキーを再生成する場合:

```bash
npx web-push generate-vapid-keys
```

生成されたキーを`.env`ファイルに設定してください。

## テスト

```bash
# すべてのテストを実行
npm test

# テストをwatch モードで実行
npm run test:watch
```

## 使い方

### 管理者としてログイン

1. http://localhost:3000/login にアクセス
2. `admin` / `admin123` でログイン
3. 「新しいお知らせを投稿」ボタンをクリック
4. タイトルと内容(Markdown形式)を入力して投稿

### 参加者としてログイン

1. http://localhost:3000/login にアクセス
2. `user1` / `user123` でログイン
3. お知らせを閲覧し、コメントを投稿

### プッシュ通知の設定

1. ログイン後、画面上部の「プッシュ通知を有効にする」ボタンをクリック
2. ブラウザの通知許可ダイアログで「許可」を選択
3. 以降、新しいお知らせが投稿されると通知が届きます

## プロジェクト構成

```
.
├── app/                      # Next.js App Router
│   ├── api/                  # APIルート
│   │   ├── auth/             # NextAuth認証
│   │   ├── announcements/    # お知らせAPI
│   │   ├── comments/         # コメントAPI
│   │   └── push/             # プッシュ通知API
│   ├── login/                # ログインページ
│   └── page.tsx              # ホームページ
├── components/               # Reactコンポーネント
│   ├── AnnouncementForm.tsx  # お知らせ投稿フォーム
│   ├── AnnouncementItem.tsx  # お知らせ表示
│   ├── AnnouncementList.tsx  # お知らせ一覧
│   ├── Header.tsx            # ヘッダー
│   └── PushNotificationSetup.tsx # プッシュ通知設定
├── lib/                      # ユーティリティ
│   ├── auth.ts               # 認証ヘルパー
│   └── prisma.ts             # Prismaクライアント
├── prisma/                   # Prismaスキーマ
│   └── schema.prisma         # データベーススキーマ
├── public/                   # 静的ファイル
│   ├── manifest.json         # PWAマニフェスト
│   └── sw.js                 # Service Worker
├── scripts/                  # ユーティリティスクリプト
│   └── create-users.ts       # ユーザー作成スクリプト
└── __tests__/                # テストファイル
    ├── auth.test.ts          # 認証テスト
    ├── announcement.test.ts  # お知らせテスト
    └── comment.test.ts       # コメントテスト
```

## データベーススキーマ

### User (ユーザー)
- `id`: ユーザーID
- `username`: ユーザー名(ユニーク)
- `password`: ハッシュ化されたパスワード
- `role`: ロール (ADMIN | PARTICIPANT)

### Announcement (お知らせ)
- `id`: お知らせID
- `title`: タイトル
- `content`: 内容(Markdown形式)
- `authorId`: 投稿者ID
- `createdAt`: 作成日時
- `updatedAt`: 更新日時

### Comment (コメント)
- `id`: コメントID
- `content`: コメント内容
- `authorId`: 投稿者ID
- `announcementId`: お知らせID
- `createdAt`: 作成日時
- `updatedAt`: 更新日時

### PushSubscription (プッシュ通知購読)
- `id`: 購読ID
- `userId`: ユーザーID
- `endpoint`: プッシュ通知エンドポイント
- `p256dh`: 公開鍵
- `auth`: 認証シークレット

## 別アプリへの組み込み

このアプリケーションは以下のコンポーネントで構成されており、別のプロジェクトに組み込むことができます:

1. **データベーススキーマ** (`prisma/schema.prisma`)
2. **APIルート** (`app/api/`)
3. **UIコンポーネント** (`components/`)
4. **認証設定** (`auth.ts`, `lib/auth.ts`)
5. **PWA設定** (`public/manifest.json`, `public/sw.js`)

### 組み込み手順

1. Prismaスキーマを既存のスキーマにマージ
2. APIルートをコピー
3. 必要なコンポーネントをインポート
4. 環境変数を設定
5. NextAuth設定を統合
