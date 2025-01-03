from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import bigquery
import firebase_admin
from firebase_admin import auth, credentials
from datetime import datetime
import os
import logging
from typing import Optional

# ロギングの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# 環境変数の設定
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://property-frontend-408609594730.asia-northeast1.run.app"
]
PROJECT_ID = os.getenv("PROJECT_ID", "okamolife")

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Firebase Admin初期化
try:
    if os.getenv("K_SERVICE"):
        firebase_admin.initialize_app()
        logger.info("Firebase Admin initialized in Cloud Run environment")
    else:
        cred = credentials.Certificate("serviceAccount.json")
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin initialized in local environment")
except Exception as e:
    logger.error(f"Firebase initialization error: {e}")

# BigQueryクライアント初期化
try:
    client = bigquery.Client(project=PROJECT_ID)
    logger.info("BigQuery client initialized successfully")
except Exception as e:
    logger.error(f"BigQuery initialization error: {e}")
    client = None

# 認証ハンドラー
security = HTTPBearer()


async def verify_token(auth: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not auth:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not authenticate credentials",
        )
    try:
        # デバッグ用にトークンを出力
        logger.info(f"Verifying token: {auth.credentials[:20]}...")

        # Cloud Run環境では一時的に認証をスキップ（開発用）
        if os.getenv("K_SERVICE"):
            return {"uid": "development"}

        # Firebase認証を使用
        decoded_token = auth.verify_id_token(auth.credentials)
        logger.info(f"Token verified for user: {decoded_token.get('uid')}")
        return decoded_token
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
        )


@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "project_id": PROJECT_ID,
        "firebase_initialized": firebase_admin._apps != {},
        "bigquery_initialized": client is not None,
        "environment": "cloud_run" if os.getenv("K_SERVICE") else "local"
    }


@app.get("/api/properties")
async def get_properties(page: int = 1, page_size: int = 10):
    """プロパティ一覧を取得"""
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="BigQuery client not initialized"
        )

    try:
        offset = (page - 1) * page_size
        query = f"""
        SELECT *
        FROM `{PROJECT_ID}.property_data.properties`
        ORDER BY created_at DESC
        LIMIT {page_size}
        OFFSET {offset}
        """

        query_job = client.query(query)
        results = query_job.result()

        properties = []
        for row in results:
            property_dict = dict(row.items())
            for key, value in property_dict.items():
                if isinstance(value, datetime):
                    property_dict[key] = value.isoformat()
            properties.append(property_dict)

        return {"properties": properties}
    except Exception as e:
        logger.error(f"Error fetching properties: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.get("/api/properties/{property_id}")
async def get_property(property_id: str):
    """特定のプロパティ詳細を取得"""
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="BigQuery client not initialized"
        )

    try:
        query = f"""
        SELECT *
        FROM `{PROJECT_ID}.property_data.properties`
        WHERE id = @property_id
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("property_id", "STRING", property_id)
            ]
        )

        query_job = client.query(query, job_config=job_config)
        results = query_job.result()

        for row in results:
            property_dict = dict(row.items())
            for key, value in property_dict.items():
                if isinstance(value, datetime):
                    property_dict[key] = value.isoformat()
            return property_dict

        raise HTTPException(status_code=404, detail="Property not found")
    except Exception as e:
        logger.error(f"Error fetching property {property_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8080"))
    logger.info(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)