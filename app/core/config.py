from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "UniMap"

    DATABASE_URL: str = "postgresql://aymenpostgres:MOUAINE202005@localhost/db"


    class Config:
        env_file = ".env"

settings = Settings()