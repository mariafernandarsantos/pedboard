import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from passlib.context import CryptContext

app = FastAPI(
    title="API de Notas e Tarefas",
    description="Uma API para criar, alterar e excluir notas e tarefas.",
    version="1.0.0"
)


# --- Modelos de Dados (Pydantic) ---

# Modelos para Notas
class NoteBase(BaseModel):
    """Modelo base para entrada de dados de nota."""
    title: str
    content: str

class Note(NoteBase):
    """Modelo completo da nota (usado para resposta e armazenamento)."""
    id: int

# Modelos para Tarefas
class TaskBase(BaseModel):
    """Modelo base para entrada de dados de tarefa."""
    title: str
    completed: bool = False

class Task(TaskBase):
    """Modelo completo da tarefa (usado para resposta e armazenamento)."""
    id: int

# --- Modelos de Usuário (CORRIGIDOS) ---

class UserCreate(BaseModel):
    """Modelo para ENTRADA de registro (não deve ter ID)."""
    username: str
    password: str
    name: str
    email: str

class UserLogin(BaseModel):
    """Modelo para ENTRADA de login (apenas username/password)."""
    username: str
    password: str
    
class UserOut(BaseModel):
    """Modelo para SAÍDA (O que a API retorna após registro)."""
    id: int
    username: str


# --- "Banco de Dados" em Memória ---
db_notes: Dict[int, Note] = {}
db_tasks: Dict[int, Task] = {}
db_users: Dict[int, Dict] = {} # Armazena os usuários como dicionários

# Contadores para IDs únicos
note_id_counter = 0
task_id_counter = 0
user_id_counter = 0

# Configuração do Passlib
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --- Endpoints da API para Notas ---

@app.post("/notes/", response_model=Note, status_code=201, summary="Criar uma nova nota")
def create_note(note_in: NoteBase):
    """
    Cria uma nova nota.
    - **title**: O título da nota.
    - **content**: O conteúdo da nota.
    """
    global note_id_counter
    note_id_counter += 1

    # Cria a nova nota com o ID
    new_note = Note(id=note_id_counter, **note_in.dict())

    # Armazena no "banco de dados"
    db_notes[note_id_counter] = new_note

    return new_note

@app.put("/notes/{note_id}", response_model=Note, summary="Atualizar uma nota existente")
def update_note(note_id: int, note_in: NoteBase):
    """
    Atualiza uma nota existente pelo ID.
    - **note_id**: O ID da nota a ser atualizada.
    - **title**: O novo título da nota.
    - **content**: O novo conteúdo da nota.
    """
    if note_id not in db_notes:
        raise HTTPException(status_code=404, detail="Nota não encontrada")

    # Atualiza a nota no "banco de dados"
    updated_note = Note(id=note_id, **note_in.dict())
    db_notes[note_id] = updated_note

    return updated_note

@app.delete("/notes/{note_id}", status_code=200, summary="Excluir uma nota")
def delete_note(note_id: int):
    """
    Exclui uma nota existente pelo ID.
    - **note_id**: O ID da nota a ser excluída.
    """
    if note_id not in db_notes:
        raise HTTPException(status_code=404, detail="Nota não encontrada")

    # Remove a nota do "banco de dados"
    del db_notes[note_id]

    return {"message": "Nota excluída com sucesso"}

@app.get("/notes/", response_model=List[Note], summary="Listar todas as notas")
def get_all_notes():
    """
    Retorna uma lista de todas as notas cadastradas.
    """
    return list(db_notes.values())


# --- Endpoints da API para Tarefas ---

@app.post("/tasks/", response_model=Task, status_code=201, summary="Criar uma nova tarefa")
def create_task(task_in: TaskBase):
    """
    Cria uma nova tarefa.
    - **title**: O título da tarefa.
    - **completed**: O status da tarefa (opcional, padrão: False).
    """
    global task_id_counter
    task_id_counter += 1

    # Cria a nova tarefa com o ID
    new_task = Task(id=task_id_counter, **task_in.dict())

    # Armazena no "banco de dados"
    db_tasks[task_id_counter] = new_task

    return new_task

@app.put("/tasks/{task_id}", response_model=Task, summary="Atualizar uma tarefa existente")
def update_task(task_id: int, task_in: TaskBase):
    """
    Atualiza uma tarefa existente pelo ID.
    - **task_id**: O ID da tarefa a ser atualizada.
    - **title**: O novo título da tarefa.
    - **completed**: O novo status da tarefa.
    """
    if task_id not in db_tasks:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    # Atualiza a tarefa no "banco de dados"
    updated_task = Task(id=task_id, **task_in.dict())
    db_tasks[task_id] = updated_task

    return updated_task

@app.delete("/tasks/{task_id}", status_code=200, summary="Excluir uma tarefa")
def delete_task(task_id: int):
    """
    Exclui uma tarefa existente pelo ID.
    - **task_id**: O ID da tarefa a ser excluída.
    """
    if task_id not in db_tasks:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    # Remove a tarefa do "banco de dados"
    del db_tasks[task_id]

    return {"message": "Tarefa excluída com sucesso"}

@app.get("/tasks/", response_model=List[Task], summary="Listar todas as tarefas")
def get_all_tasks():
    """
    Retorna uma lista de todas as tarefas cadastradas.
    """
    return list(db_tasks.values())


# --- Endpoints da API para Usuários (CORRIGIDOS) ---

@app.post("/users/register", response_model=UserOut, status_code=201, summary="Registrar um novo usuário")
def register_user(user_in: UserCreate): # <-- CORRIGIDO
    """
    Registra um novo usuário.
    - **username**: Nome de usuário.
    - **password**: Senha.
    - **name**: Nome completo.
    - **email**: Endereço de e-mail.
    """
    global user_id_counter

    if any(u["username"] == user_in.username for u in db_users.values()):
        raise HTTPException(status_code=400, detail="Usuário já existe")

    hashed_password = pwd_context.hash(user_in.password)

    user_id_counter += 1
    new_user = {
        "id": user_id_counter,
        "username": user_in.username,
        "password": hashed_password,
        "name": user_in.name,
        "email": user_in.email
    }

    db_users[user_id_counter] = new_user

    return UserOut(id=user_id_counter, username=user_in.username)

@app.post("/users/login", summary="Login do usuário")
def login_user(login_data: UserLogin): # <-- CORRIGIDO
    """
    Autentica um usuário.
    - **username**: Nome de usuário.
    - **password**: Senha.
    """
    user = next((u for u in db_users.values() if u["username"] == login_data.username), None)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if not pwd_context.verify(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Senha incorreta")

    return {"message": f"Login bem-sucedido! Bem-vindo, {user['username']}."}


# --- Ponto de entrada ---

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)