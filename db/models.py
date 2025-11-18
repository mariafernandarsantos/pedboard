from sqlalchemy import Column, Integer, String, Boolean, Date, BLOB, ForeignKey
from sqlalchemy.types import Date, BLOB
from .database import Base

class Usuario(Base):
    __tablename__ = "Usuario"

    ID_Atendente = Column(Integer, primary_key=True, index=True)
    Nome = Column(String(100), nullable=False)
    Login_User = Column(String(25), unique=True, index=True, nullable=False)
    Email = Column(String(75), unique=True, index=True, nullable=False)
    Senha = Column(String(25), nullable=False) # Senha em texto plano

class Pacientes(Base):
    __tablename__ = "Pacientes"

    ID_Paciente = Column(Integer, primary_key=True, index=True)
    Nome_Paciente = Column(String(100), nullable=False)
    Idade = Column(Integer, nullable=False)
    Genero = Column(String(20), nullable=False)
    Cidade = Column(String(50), nullable=False)
    Data_Nascimento = Column(Date, nullable=False)
    Estado_Civil = Column(String(30), nullable=False)
    Convenio = Column(String(10), nullable=False)
    Tipo_Sanguineo = Column(String(10), nullable=False)

class Acoes(Base):
    __tablename__ = "Acoes"

    ID_Acao = Column(Integer, primary_key=True, index=True)
    ID_Paciente = Column(Integer, ForeignKey("Pacientes.ID_Paciente"), nullable=False)
    Descricao = Column(String(1000), nullable=False)
    Data_Criacao = Column(Date, nullable=False)
    Status = Column(String(20), nullable=False)
    ID_Atendente = Column(Integer, ForeignKey("Usuario.ID_Atendente"), nullable=False)

class Notas(Base):
    __tablename__ = "Notas"

    ID_Nota = Column(Integer, primary_key=True, index=True)
    Nome = Column(String(100), nullable=False)
    Descricao = Column(String(1000), nullable=False)
    Data_Criacao = Column(Date, nullable=False)
    Status = Column(String(20), nullable=False)
    ID_Atendente = Column(Integer, ForeignKey("Usuario.ID_Atendente"), nullable=False)

class Tarefas(Base):
    __tablename__ = "Tarefas"

    ID_Tarefa = Column(Integer, primary_key=True, index=True)
    Titulo = Column(String(30), nullable=False)
    Nome_Atendente = Column(String(100), nullable=False)
    Descricao = Column(String(1000), nullable=False)
    Data_Criacao = Column(Date, nullable=False)
    Status = Column(String(20), nullable=False)
    Urgencia = Column(Integer, nullable=False)
    Imagem = Column(BLOB, nullable=True)
    Data_Prazo = Column(Date, nullable=False)
    ID_Acao = Column(Integer, ForeignKey("Acoes.ID_Acao"), nullable=False)
    ID_Atendente = Column(Integer, ForeignKey("Usuario.ID_Atendente"), nullable=False)