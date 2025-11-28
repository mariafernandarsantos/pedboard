from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime 

# --- Schemas para Usuario ---
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
    """Schema para retornar dados do usuário."""
    ID_Atendente: int

    class Config:
        orm_mode = True

# --- Schemas para Notas ---
class NotaBase(BaseModel):
    Nome: str
    Descricao: str
    Status: str
    ID_Atendente: int

class NotaCreate(NotaBase):
    """Schema para criar uma nota."""
    pass 

class Nota(NotaBase):
    """Schema para retornar dados da nota."""
    ID_Nota: int
    Data_Criacao: datetime
    
    class Config:
        orm_mode = True

class NotaDisplay(BaseModel):
    """Schema personalizado para retornar a Nota + Dados do Usuário."""
    ID_Nota: int
    Nome: str
    Descricao: str
    Status: str
    Data_Criacao: date
    ID_Atendente: int
    
    Nome_Atendente: str
    Login_Atendente: str

    class Config:
        orm_mode = True

# --- Schemas para Pacientes ---
class PacienteBase(BaseModel):
    Nome: str
    Idade: int
    Genero: str
    Cidade: str
    Data_Nascimento: date
    Estado_Civil: str
    Convenio: str
    Tipo_Sanguineo: str

class PacienteCreate(PacienteBase):
    pass

class Paciente(PacienteBase):
    ID_Paciente: int
    class Config:
        orm_mode = True

# --- Schemas para Tarefas ---
class TarefaBase(BaseModel):
    Titulo: str
    Nome_Atendente: str
    Descricao: str
    Status: str
    Urgencia: int
    Data_Prazo: Optional[datetime] = None
    
class TarefaCreate(TarefaBase):
    """Schema para criar uma tarefa."""
    ID_Atendente: int
    ID_Paciente: Optional[int] = None
    Acao_Descricao: Optional[str] = None

class Tarefa(TarefaBase):
    """Schema para retornar dados da tarefa."""
    ID_Tarefa: int
    Data_Criacao: datetime
    ID_Paciente: Optional[int] = None
    ID_Atendente: int
    Acao_Descricao: Optional[str] = None

    class Config:
        orm_mode = True

# --- Schemas para Registros (Atendimentos) ---
class RegistroBase(BaseModel):
    ID_Acao: int
    ID_Paciente: int
    Status: str

class RegistroCreate(RegistroBase):
    """Usado para receber os dados ao criar"""
    ID_Atendente: int

class Registro(RegistroBase):
    """Usado para devolver os dados na resposta simples"""
    ID_Registro: int
    Data_Criacao: date
    ID_Atendente: int

    class Config:
        orm_mode = True

class RegistroDisplay(BaseModel):
    """Schema para EXIBIR o registro com os nomes reais"""
    ID_Registro: int
    ID_Acao: int
    ID_Paciente: int
    ID_Atendente: int
    Status: str
    Data_Criacao: date
    
    Nome: str           
    Nome_Atendente: str 

    class Config:
        orm_mode = True