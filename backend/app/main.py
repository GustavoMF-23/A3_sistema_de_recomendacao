import os
import pandas as pd
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import logging

from .database import engine, Base, get_db
from . import models, schemas, auth
from .recommender import recommender_system

# Configura o Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cria as tabelas do banco de dados na inicialização
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Livraria Greena-Leitura - API de Recomendação",
    description="API para gerenciamento de livros, carrinho de compras e sistema de recomendação personalizado.",
    version="1.0.0"
)

# Configuração de CORS para permitir requisições do Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CSV_PATH = "dataset_livros.csv"
if not os.path.exists(CSV_PATH):
    # Se rodando a partir da pasta app/
    CSV_PATH = "../dataset_livros.csv"
if not os.path.exists(CSV_PATH):
    # Se rodando da pasta raiz com outro diretório de trabalho
    CSV_PATH = "c:/Users/jobal/Documents/provatrabalho3/dataset_livros.csv"


def seed_database():
    """
    Popular o banco de dados com os livros do arquivo CSV se estiver vazio.
    """
    db = next(get_db())
    try:
        book_count = db.query(models.Book).count()
        if book_count > 0:
            logger.info(f"O banco de dados já possui {book_count} livros cadastrados. Pulando carga do CSV.")
            return

        if not os.path.exists(CSV_PATH):
            logger.error(f"Arquivo CSV não encontrado em: {CSV_PATH}. A carga inicial falhou.")
            return

        logger.info(f"Carregando livros a partir de {CSV_PATH}...")
        df = pd.read_csv(CSV_PATH)
        
        # Tratar colunas
        df['id_livro'] = df['id_livro'].astype(str)
        df['nome'] = df['nome'].fillna("Sem Título")
        df['autor'] = df['autor'].fillna("Autor Desconhecido")
        df['genero'] = df['genero'].fillna("Geral")
        df['ano_publicacao'] = df['ano_publicacao'].fillna(0).astype(int)
        df['descricao'] = df['descricao'].fillna("")
        df['imagem'] = df['imagem'].fillna("")

        books_to_insert = []
        for _, row in df.iterrows():
            book = models.Book(
                id=row['id_livro'],
                nome=row['nome'],
                autor=row['autor'],
                genero=row['genero'],
                ano_publicacao=int(row['ano_publicacao']),
                descricao=row['descricao'],
                imagem=row['imagem']
            )
            books_to_insert.append(book)
        
        # Gravação em lotes para ser extremamente rápida
        logger.info(f"Salvando {len(books_to_insert)} livros no banco de dados SQLite...")
        db.bulk_save_objects(books_to_insert)
        db.commit()
        logger.info("Livros salvos com sucesso!")
    except Exception as e:
        logger.exception(f"Erro durante a carga inicial do banco de dados: {e}")
        db.rollback()
    finally:
        db.close()

# Carrega e treina o recomendador na inicialização da aplicação
@app.on_event("startup")
def startup_event():
    seed_database()
    db = next(get_db())
    try:
        recommender_system.fit(db)
    finally:
        db.close()

# --- ROTAS DE AUTENTICAÇÃO ---

@app.post("/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Nome de usuário já está em uso.")
    
    hashed_pwd = auth.get_password_hash(user_data.password)
    pref_str = ",".join(user_data.preferences) if user_data.preferences else ""
    
    new_user = models.User(
        username=user_data.username,
        hashed_password=hashed_pwd,
        preferences=pref_str
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Suporta OAuth2 Password Flow (para Swagger) e JSON no mesmo endpoint
@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nome de usuário ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.username, "user_id": user.id})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }

# Rota JSON alternativa de login para o Frontend facilitar a chamada
@app.post("/auth/login/json", response_model=schemas.Token)
def login_json(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == credentials.username).first()
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nome de usuário ou senha incorretos."
        )
    
    access_token = auth.create_access_token(data={"sub": user.username, "user_id": user.id})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }

# --- ROTAS DE USUÁRIO (Requisitos da atividade) ---

@app.post("/users/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_api(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Cria um novo usuário (Alias de /auth/register para satisfazer o requisito da atividade).
    """
    return register(user_data, db)

@app.put("/users/{user_id}/preferences", response_model=schemas.UserResponse)
def update_user_preferences(user_id: int, pref_data: schemas.UserUpdatePreferences, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    Atualiza as preferências (gêneros literários favoritos) de um usuário específico.
    """
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para alterar as preferências de outro usuário.")
    
    pref_str = ",".join(pref_data.preferences)
    current_user.preferences = pref_str
    db.commit()
    db.refresh(current_user)
    
    # Atualiza o modelo de recomendação com as novas informações
    recommender_system.fit(db)
    
    return current_user

# --- ROTAS DE ITENS (Requisitos da atividade) ---

@app.post("/items/", response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED)
def create_item(book_data: schemas.BookCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Cadastra um novo livro na base de dados (Requisito da atividade).
    Ao cadastrar, o recomendador é retreinado em segundo plano.
    """
    db_book = db.query(models.Book).filter(models.Book.id == book_data.id).first()
    if db_book:
        raise HTTPException(status_code=400, detail="Já existe um livro cadastrado com este ID.")
    
    new_book = models.Book(**book_data.model_dump())
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    
    # Treina o recomendador em segundo plano para não travar a resposta da requisição
    background_tasks.add_task(recommender_system.fit, db)
    
    return new_book

# --- ROTAS DE RECOMENDAÇÃO (Requisitos da atividade) ---

@app.get("/recommendations/{user_id}", response_model=List[schemas.RecommendationResponse])
def get_recommendations_for_user(user_id: int, top_n: int = Query(6, ge=1, le=20), db: Session = Depends(get_db)):
    """
    Retorna as recomendações personalizadas para um usuário específico (Requisito da atividade).
    A recomendação é gerada com base nos itens do carrinho e preferências de gênero.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    return recommender_system.get_recommendations(db, user, top_n)

# --- ROTAS DE CATÁLOGO (Loja Online) ---

@app.get("/books", response_model=schemas.BookPaginatedResponse)
def list_books(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    search: Optional[str] = Query(None),
    genre: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Book)
    
    if search:
        query = query.filter(
            models.Book.nome.ilike(f"%{search}%") | 
            models.Book.autor.ilike(f"%{search}%")
        )
    
    if genre:
        query = query.filter(models.Book.genero == genre)
        
    total = query.count()
    books = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "books": books
    }

@app.get("/books/genres", response_model=List[str])
def get_all_genres(db: Session = Depends(get_db)):
    genres = db.query(models.Book.genero).distinct().all()
    return sorted([g[0] for g in genres if g[0]])

@app.get("/books/{book_id}", response_model=schemas.BookResponse)
def get_book_detail(book_id: str, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    return book

# --- ROTA DE REGISTRO DE CLIQUE (Para recomendações baseadas em cliques) ---

@app.post("/books/{book_id}/click", status_code=status.HTTP_204_NO_CONTENT)
def register_book_click(
    book_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Registra que um usuário clicou/visualizou um livro.
    Aceita autenticação opcional - se logado, salva a interação no banco.
    """
    # Verificar se o livro existe
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    
    # Tentar extrair o user_id do token (opcional)
    user_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        try:
            token_str = auth_header.split(" ")[1]
            payload = auth.decode_token(token_str)
            if payload:
                user_id = payload.get("user_id")
        except Exception:
            pass  # Ignora erros de token - o clique ainda é válido
    
    if user_id:
        # Salva a interação de visualização
        interaction = models.UserInteraction(
            user_id=user_id,
            book_id=book_id,
            type="view"
        )
        db.add(interaction)
        db.commit()
    
    return None

@app.get("/recommendations/{user_id}/browsing-history", response_model=List[schemas.BrowsingRecommendationSection])
def get_browsing_history_recommendations(
    user_id: int,
    max_sections: int = Query(3, ge=1, le=5),
    items_per_section: int = Query(6, ge=1, le=12),
    db: Session = Depends(get_db)
):
    """
    Retorna recomendações estilo Amazon baseadas no histórico de navegação.
    Cada seção contém um livro-fonte (que o usuário viu) e livros similares.
    Ex: 'Porque você viu Harry Potter → [livros similares]'
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    return recommender_system.get_browsing_recommendations(db, user, max_sections, items_per_section)

@app.get("/recommendations/{user_id}/click-based", response_model=List[schemas.RecommendationResponse])
def get_click_based_recommendations(
    user_id: int,
    top_n: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """
    Retorna recomendações baseadas no histórico de cliques/visualizações do usuário.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    return recommender_system.get_click_based_recommendations(db, user, top_n)

# --- ROTAS DO CARRINHO (Persistência no banco) ---

@app.get("/cart", response_model=List[schemas.CartItemResponse])
def get_cart(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).all()

@app.post("/cart", response_model=schemas.CartItemResponse)
def add_to_cart(item: schemas.CartItemCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Validar se o livro existe
    book = db.query(models.Book).filter(models.Book.id == item.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
        
    # Verificar se já existe no carrinho
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id,
        models.CartItem.book_id == item.book_id
    ).first()
    
    if cart_item:
        cart_item.quantity = item.quantity
    else:
        cart_item = models.CartItem(
            user_id=current_user.id,
            book_id=item.book_id,
            quantity=item.quantity
        )
        db.add(cart_item)
    
    db.commit()
    db.refresh(cart_item)
    
    # Registra uma interação de carrinho para melhorar a recomendação
    interaction = models.UserInteraction(
        user_id=current_user.id,
        book_id=item.book_id,
        type="cart"
    )
    db.add(interaction)
    db.commit()
    
    return cart_item

@app.delete("/cart/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_cart(book_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id,
        models.CartItem.book_id == book_id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item do carrinho não encontrado.")
        
    db.delete(cart_item)
    db.commit()
    return None

@app.delete("/cart", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).delete()
    db.commit()
    return None
