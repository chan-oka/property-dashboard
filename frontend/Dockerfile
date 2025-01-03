# ベースイメージを指定
FROM --platform=linux/amd64 node:18-alpine AS builder

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# ビルド
RUN npm run build

# 実行用のイメージ
FROM --platform=linux/amd64 node:18-alpine AS runner
WORKDIR /app

# 必要なファイルをコピー
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 環境変数を設定
ENV PORT=8080
ENV NODE_ENV=production

# ポートを公開
EXPOSE 8080

# アプリケーションを起動
CMD ["node", "server.js"]