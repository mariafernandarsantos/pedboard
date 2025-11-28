import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
import base64
from fastapi.middleware.cors import CORSMiddleware

from db import models, schemas, database
from db.database import SessionLocal, engine

# Cria as tabelas no banco de dados (se não existirem)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API de Notas e Tarefas",
    description="Uma API para criar, alterar e excluir notas e tarefas, com registro e login de usuários.",
    version="1.0.0"
)

origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1",
    "http://localhost"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

    # Cria o novo usuário  
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
    
    # Verifica se o usuário foi encontrado e se a senha é IGUAL 
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


# --- Endpoints da API para Pacientes ---

@app.post("/pacientes/", response_model=schemas.Paciente, status_code=201, summary="Criar paciente")
def create_paciente(p_in: schemas.PacienteCreate, db: Session = Depends(get_db)):
    """
    Cria um novo paciente.
    """
    db_p = models.Pacientes(
        Nome=p_in.Nome,
        Idade=p_in.Idade,
        Genero=p_in.Genero,
        Cidade=p_in.Cidade,
        Data_Nascimento=p_in.Data_Nascimento,
        Estado_Civil=p_in.Estado_Civil,
        Convenio=p_in.Convenio,
        Tipo_Sanguineo=p_in.Tipo_Sanguineo
    )
    db.add(db_p)
    db.commit()
    db.refresh(db_p)
    return db_p


@app.get("/pacientes/", response_model=List[schemas.Paciente], summary="Listar todos os pacientes")
def get_all_pacientes(db: Session = Depends(get_db)):
    """
    Retorna a lista completa de pacientes.
    """
    return db.query(models.Pacientes).all()


# --- Endpoints da API para Notas ---

@app.post("/notas/", response_model=schemas.Nota, status_code=201, summary="Criar uma nova nota")
def create_note(note_in: schemas.NotaCreate, db: Session = Depends(get_db)):
    """
    Cria uma nova nota.
    """
    db_note = models.Notas(
        Nome=note_in.Nome,
        Descricao=note_in.Descricao,
        Status="Aberto",
        ID_Atendente=note_in.ID_Atendente,
        Data_Criacao=date.today()
    )
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    return db_note

@app.put("/notas/{note_id}", response_model=schemas.Nota, summary="Atualizar uma nota existente")
def update_note(note_id: int, note_in: schemas.NotaCreate, user_id: int, db: Session = Depends(get_db)):
    """
    Atualiza uma nota. Exige o user_id na URL (query param) para verificar permissão.
    Exemplo: /notas/1?user_id=5
    """
    db_note = db.query(models.Notas).filter(models.Notas.ID_Nota == note_id).first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="Nota não encontrada")
    
    if db_note.ID_Atendente != user_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para alterar esta nota.")

    # Atualiza os campos
    db_note.Nome = note_in.Nome
    db_note.Descricao = note_in.Descricao
    db_note.Status = note_in.Status
    
    db.commit()
    db.refresh(db_note)
    
    return db_note

@app.delete("/notas/{note_id}", status_code=200, summary="Excluir uma nota")
def delete_note(note_id: int, user_id: int, db: Session = Depends(get_db)):
    """
    Exclui uma nota. Exige user_id para permissão.
    """
    db_note = db.query(models.Notas).filter(models.Notas.ID_Nota == note_id).first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="Nota não encontrada")

    if db_note.ID_Atendente != user_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para excluir esta nota.")

    db.delete(db_note)
    db.commit()

    return {"message": "Nota excluída com sucesso"}

@app.get("/notas/", response_model=List[schemas.NotaDisplay])
def get_all_notes(db: Session = Depends(get_db)):
    """
    Lista todas as notas juntando com a tabela de usuários para pegar o nome.
    """
    #  Seleciona Nota e Usuario onde os IDs batem
    results = db.query(models.Notas, models.Usuario).join(
        models.Usuario, 
        models.Notas.ID_Atendente == models.Usuario.ID_Atendente
    ).all()

    lista_completa = []
    
    # Itera sobre os resultados (que vêm em pares: nota, usuario)
    for nota, usuario in results:
        lista_completa.append({
            "ID_Nota": nota.ID_Nota,
            "Nome": nota.Nome,
            "Descricao": nota.Descricao,
            "Status": nota.Status,
            "Data_Criacao": nota.Data_Criacao,
            "ID_Atendente": nota.ID_Atendente,
            # Pega esses dados do objeto usuario
            "Nome_Atendente": usuario.Nome,
            "Login_Atendente": usuario.Login_User 
        })

    return lista_completa

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
        Acao_Descricao=getattr(task_in, 'Acao_Descricao', None),
        ID_Paciente=getattr(task_in, 'ID_Paciente', None),
        ID_Atendente=task_in.ID_Atendente,
        Data_Criacao=datetime.utcnow()
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    resp = {
        "ID_Tarefa": db_task.ID_Tarefa,
        "Titulo": db_task.Titulo,
        "Nome_Atendente": db_task.Nome_Atendente,
        "Descricao": db_task.Descricao,
        "Status": db_task.Status,
        "Urgencia": db_task.Urgencia,
        "Data_Criacao": db_task.Data_Criacao,
        "Data_Prazo": db_task.Data_Prazo,
        "Acao_Descricao": db_task.Acao_Descricao,
        "ID_Paciente": db_task.ID_Paciente,
        "ID_Atendente": db_task.ID_Atendente,
    }

    return resp

@app.put("/tarefas/{task_id}", response_model=schemas.Tarefa, summary="Atualizar uma tarefa existente")
def update_task(task_id: int, task_in: schemas.TarefaCreate, user_id: int, db: Session = Depends(get_db)):
    """
    Atualiza uma tarefa. Exige user_id para permissão.
    """
    db_task = db.query(models.Tarefas).filter(models.Tarefas.ID_Tarefa == task_id).first()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    # VERIFICAÇÃO DE PERMISSÃO
    if db_task.ID_Atendente != user_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para alterar esta tarefa.")

    # Atualiza campos
    db_task.Titulo = task_in.Titulo
    db_task.Nome_Atendente = task_in.Nome_Atendente
    db_task.Descricao = task_in.Descricao
    db_task.Status = task_in.Status
    db_task.Urgencia = task_in.Urgencia
    db_task.Data_Prazo = task_in.Data_Prazo
    
    # Atualiza imagem apenas se enviada
    if getattr(task_in, 'Imagem', None):
        try:
            db_task.Imagem = base64.b64decode(task_in.Imagem)
        except:
            pass

    db.commit()
    db.refresh(db_task)

    # Retorna dicionário manual para incluir a imagem processada
    return {
        "ID_Tarefa": db_task.ID_Tarefa,
        "Titulo": db_task.Titulo,
        "Nome_Atendente": db_task.Nome_Atendente,
        "Descricao": db_task.Descricao,
        "Status": db_task.Status,
        "Urgencia": db_task.Urgencia,
        "Data_Criacao": db_task.Data_Criacao,
        "Data_Prazo": db_task.Data_Prazo,
        "ID_Atendente": db_task.ID_Atendente
    }

@app.delete("/tarefas/{task_id}", status_code=200, summary="Excluir uma tarefa")
def delete_task(task_id: int, user_id: int, db: Session = Depends(get_db)):
    """
    Exclui uma tarefa. Exige user_id para permissão.
    """
    db_task = db.query(models.Tarefas).filter(models.Tarefas.ID_Tarefa == task_id).first()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    if db_task.ID_Atendente != user_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para excluir esta tarefa.")

    db.delete(db_task)
    db.commit()

    return {"message": "Tarefa excluída com sucesso"}

@app.get("/tarefas/", response_model=List[schemas.Tarefa], summary="Listar todas as tarefas")
def get_all_tasks(db: Session = Depends(get_db)):
    """
    Retorna uma lista de todas as tarefas cadastradas.
    """
    tasks = db.query(models.Tarefas).all()
  
    result = []
    for t in tasks:
        result.append({
            "ID_Tarefa": t.ID_Tarefa,
            "Titulo": t.Titulo,
            "Nome_Atendente": t.Nome_Atendente,
            "Descricao": t.Descricao,
            "Status": t.Status,
            "Urgencia": t.Urgencia,
            "Data_Criacao": t.Data_Criacao,
            "Data_Prazo": t.Data_Prazo,
            "Acao_Descricao": t.Acao_Descricao,
            "ID_Paciente": t.ID_Paciente,
            "ID_Atendente": t.ID_Atendente,
        })
    return result

@app.post("/registros/", response_model=schemas.Registro, status_code=201)
def create_registro(registro_in: schemas.RegistroCreate, db: Session = Depends(get_db)):
    """
    Cria um novo registro de atendimento.
    """
    db_registro = models.Registros(
        ID_Acao=registro_in.ID_Acao,
        ID_Paciente=registro_in.ID_Paciente,
        Status=registro_in.Status,
        ID_Atendente=registro_in.ID_Atendente,
        Data_Criacao=date.today()
    )
    
    db.add(db_registro)
    db.commit()
    db.refresh(db_registro)
    
    return db_registro

@app.get("/registros/", response_model=List[schemas.RegistroDisplay])
def get_all_registros(db: Session = Depends(get_db)):
    results = db.query(models.Registros, models.Pacientes, models.Usuario).join(
        models.Pacientes, models.Registros.ID_Paciente == models.Pacientes.ID_Paciente
    ).join(
        models.Usuario, models.Registros.ID_Atendente == models.Usuario.ID_Atendente
    ).all()

    lista_final = []
    for reg, pac, user in results:
        lista_final.append({
            "ID_Registro": reg.ID_Registro,
            "ID_Acao": reg.ID_Acao,
            "ID_Paciente": reg.ID_Paciente,
            "ID_Atendente": reg.ID_Atendente,
            "Status": reg.Status,
            "Data_Criacao": reg.Data_Criacao,
            
            "Nome": pac.Nome,  
            
            "Nome_Atendente": user.Nome 
        })

    return lista_final

@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    return {}

@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    return {}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)


