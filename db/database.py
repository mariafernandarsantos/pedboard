from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Formato: "mysql+mysqlconnector://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO"
SQLALCHEMY_DATABASE_URL = "mysql+mysqlconnector://root:@localhost/pedboard"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Função de dependência para obter a sessão do banco em cada request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()