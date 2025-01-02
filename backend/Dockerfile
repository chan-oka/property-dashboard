# Python 3.11をベースイメージとして使用
FROM --platform=linux/amd64 python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# 必要なパッケージをインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションのソースコードをコピー
COPY main.py .

# コンテナ起動時のコマンド
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]