import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date 

from db import models, schemas, database
from db.database import SessionLocal, engine

# Cria as tabelas no banco de dados (se não existirem)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API de Notas e Tarefas",
    description="Uma API para criar, alterar e excluir notas e tarefas, com registro e login de usuários.",
    version="1.0.0"
)

# --- Dependência do Banco de Dados ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Endpoints da API para Usuários ---

@app.post("/register/", response_model=schemas.Usuario, status_code=201, summary="Registrar um novo usuário")
def register_user(user_in: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    """
    Registra um novo usuário (Atendente) no sistema.
    """
    # Verifica se Login_User ou Email já existem
    db_user_login = db.query(models.Usuario).filter(models.Usuario.Login_User == user_in.Login_User).first()
    if db_user_login:
        raise HTTPException(status_code=400, detail="Login_User já cadastrado")
    
    db_user_email = db.query(models.Usuario).filter(models.Usuario.Email == user_in.Email).first()
    if db_user_email:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    # Cria o novo usuário com SENHA EM TEXTO PLANO
    db_user = models.Usuario(
        Nome=user_in.Nome,
        Login_User=user_in.Login_User,
        Email=user_in.Email,
        Senha=user_in.Senha 
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user) 

    return db_user

@app.post("/login/", summary="Fazer login")
def login_user(user_in: schemas.UsuarioLogin, db: Session = Depends(get_db)):
    """
    Autentica um usuário (Atendente).
    """
    # Procura o usuário pelo Login_User
    user_found = db.query(models.Usuario).filter(models.Usuario.Login_User == user_in.Login_User).first()
    
    # Verifica se o usuário foi encontrado e se a senha é IGUAL (Texto plano)
    if not user_found or user_found.Senha != user_in.Senha:
        raise HTTPException(status_code=401, detail="Login ou senha inválidos")

    return {"message": "Login bem-sucedido!", "user_id": user_found.ID_Atendente, "nome": user_found.Nome}

@app.get("/users/", response_model=List[schemas.Usuario], summary="Listar todos os usuários")
def get_all_users(db: Session = Depends(get_db)):
    """
    Retorna uma lista de todos os usuários (Atendentes) cadastrados.
    """
    users = db.query(models.Usuario).all()
    return users


# --- Endpoints da API para Notas ---

@app.post("/notas/", response_model=schemas.Nota, status_code=201, summary="Criar uma nova nota")
def create_note(note_in: schemas.NotaCreate, db: Session = Depends(get_db)):
    """
    Cria uma nova nota.
    """
    db_note = models.Notas(
        Nome=note_in.Nome,
        Descricao=note_in.Descricao,
        Status=note_in.Status,
        ID_Atendente=note_in.ID_Atendente,
        Data_Criacao=date.today()
    )
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    return db_note

@app.put("/notas/{note_id}", response_model=schemas.Nota, summary="Atualizar uma nota existente")
def update_note(note_id: int, note_in: schemas.NotaCreate, db: Session = Depends(get_db)):
    """
    Atualiza uma nota existente pelo ID_Nota.
    """
    db_note = db.query(models.Notas).filter(models.Notas.ID_Nota == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Nota não encontrada")

    db_note.Nome = note_in.Nome
    db_note.Descricao = note_in.Descricao
    db_note.Status = note_in.Status
    db_note.ID_Atendente = note_in.ID_Atendente
    
    db.commit()
    db.refresh(db_note)
    
    return db_note

@app.delete("/notas/{note_id}", status_code=200, summary="Excluir uma nota")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    """
    Exclui uma nota existente pelo ID_Nota.
    """
    db_note = db.query(models.Notas).filter(models.Notas.ID_Nota == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Nota não encontrada")

    db.delete(db_note)
    db.commit()

    return {"message": "Nota excluída com sucesso"}

@app.get("/notas/", response_model=List[schemas.Nota], summary="Listar todas as notas")
def get_all_notes(db: Session = Depends(get_db)):
    """
    Retorna uma lista de todas as notas cadastradas.
    """
    notes = db.query(models.Notas).all()
    return notes


# --- Endpoints da API para Tarefas ---

@app.post("/tarefas/", response_model=schemas.Tarefa, status_code=201, summary="Criar uma nova tarefa")
def create_task(task_in: schemas.TarefaCreate, db: Session = Depends(get_db)):
    """
    Cria uma nova tarefa.
    """
    db_task = models.Tarefas(
        Titulo=task_in.Titulo,
        Nome_Atendente=task_in.Nome_Atendente,
        Descricao=task_in.Descricao,
        Status=task_in.Status,
        Urgencia=task_in.Urgencia,
        Data_Prazo=task_in.Data_Prazo,
        ID_Acao=task_in.ID_Acao,
        ID_Atendente=task_in.ID_Atendente,
        Data_Criacao=date.today()
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return db_task

@app.put("/tarefas/{task_id}", response_model=schemas.Tarefa, summary="Atualizar uma tarefa existente")
def update_task(task_id: int, task_in: schemas.TarefaCreate, db: Session = Depends(get_db)):
    """
    Atualiza uma tarefa existente pelo ID_Tarefa.
    """
    db_task = db.query(models.Tarefas).filter(models.Tarefas.ID_Tarefa == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    db_task.Titulo = task_in.Titulo
    db_task.Nome_Atendente = task_in.Nome_Atendente
    db_task.Descricao = task_in.Descricao
    db_task.Status = task_in.Status
    db_task.Urgencia = task_in.Urgencia
    db_task.Data_Prazo = task_in.Data_Prazo
    db_task.ID_Acao = task_in.ID_Acao
    db_task.ID_Atendente = task_in.ID_Atendente
    
    db.commit()
    db.refresh(db_task)
    
    return db_task

@app.delete("/tarefas/{task_id}", status_code=200, summary="Excluir uma tarefa")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """
    Exclui uma tarefa existente pelo ID_Tarefa.
    """
    db_task = db.query(models.Tarefas).filter(models.Tarefas.ID_Tarefa == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    db.delete(db_task)
    db.commit()

    return {"message": "Tarefa excluída com sucesso"}

@app.get("/tarefas/", response_model=List[schemas.Tarefa], summary="Listar todas as tarefas")
def get_all_tasks(db: Session = Depends(get_db)):
    """
    Retorna uma lista de todas as tarefas cadastradas.
    """
    tasks = db.query(models.Tarefas).all()
    return tasks

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)