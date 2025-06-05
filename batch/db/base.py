import os
from typing import Dict

import psycopg2
from psycopg2.extras import execute_values
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLAlchemy Base
Base = declarative_base()


class DatabaseConnection:
    """データベース接続の共通クラス"""

    @staticmethod
    def get_connection_params() -> Dict[str, str]:
        """環境変数からデータベース接続情報を取得"""
        return {
            "dbname": os.getenv("POSTGRES_DB", "politics_dot_watch"),
            "user": os.getenv("POSTGRES_USER", "postgres"),
            "password": os.getenv("POSTGRES_PASSWORD", "postgres"),
            "host": os.getenv("POSTGRES_HOST", "localhost"),
            "port": os.getenv("POSTGRES_PORT", "5432"),
        }

    @staticmethod
    def get_connection():
        """psycopg2のデータベース接続を取得"""
        return psycopg2.connect(**DatabaseConnection.get_connection_params())

    @staticmethod
    def get_engine():
        """SQLAlchemyのエンジンを取得"""
        params = DatabaseConnection.get_connection_params()
        return create_engine(
            f"postgresql://{params['user']}:{params['password']}@{params['host']}:{params['port']}/{params['dbname']}"
        )

    @staticmethod
    def get_session():
        """SQLAlchemyのセッションを取得"""
        engine = DatabaseConnection.get_engine()
        Session = sessionmaker(bind=engine)
        return Session()
