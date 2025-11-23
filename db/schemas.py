# schemas.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import date # Importante para os campos de data

# --- Schemas para Usuario (baseado no models.Usuario) ---

class UsuarioBase(BaseModel):
    Nome: str
    Login_User: str
    Email: str

class UsuarioCreate(UsuarioBase):
    """Schema para receber a senha durante o registro."""
    Senha: str

class UsuarioLogin(BaseModel):
    """Schema para o endpoint de login."""
    Login_User: str
    Senha: str

class Usuario(UsuarioBase):
    """Schema para retornar dados do usuário (sem a senha)."""
    ID_Atendente: int

    class Config:
        orm_mode = True # Permite ao Pydantic ler dados do SQLAlchemy

# --- Schemas para Notas (baseado no models.Notas) ---

class NotaBase(BaseModel):
    Nome: str
    Descricao: str
    ID_Atendente: int

class NotaCreate(NotaBase):
    """Schema para criar uma nota. O ID_Atendente é obrigatório."""
    ID_Atendente: int

class Nota(NotaBase):
    """Schema para retornar dados da nota."""
    ID_Nota: int
    Data_Criacao: date
    ID_Atendente: int

    class Config:
        orm_mode = True

# --- Schemas para Tarefas (baseado no models.Tarefas) ---

class TarefaBase(BaseModel):
    Titulo: str
    Nome_Atendente: str # Como definido no seu models.py
    Descricao: str
    Status: str
    Urgencia: int
    Data_Prazo: date
    
class TarefaCreate(TarefaBase):
    """Schema para criar uma tarefa. Chaves estrangeiras são obrigatórias."""
    ID_Acao: int
    ID_Atendente: int

class Tarefa(TarefaBase):
    """Schema para retornar dados da tarefa."""
    ID_Tarefa: int
    Data_Criacao: date
    ID_Acao: int
    ID_Atendente: int

    class Config:
        orm_mode = True
