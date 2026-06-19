import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app import models


# Configuração do banco de dados SQLite em memória para os testes
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Fixture para configurar e limpar o banco de dados de teste
@pytest.fixture(name="db_session")
def fixture_db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Criar alguns livros fictícios de teste para preencher a base
    books = [
        models.Book(id="1", nome="O Hobbit", autor="J.R.R. Tolkien", genero="Fantasia", ano_publicacao=1937, descricao="A aventura de Bilbo Baggins", imagem=""),
        models.Book(id="2", nome="A Sociedade do Anel", autor="J.R.R. Tolkien", genero="Fantasia", ano_publicacao=1954, descricao="Primeira parte de O Senhor dos Anéis", imagem=""),
        models.Book(id="3", nome="Neuromancer", autor="William Gibson", genero="Ficcao Cientifica", ano_publicacao=1984, descricao="O clássico do Cyberpunk", imagem=""),
        models.Book(id="4", nome="Duna", autor="Frank Herbert", genero="Ficcao Cientifica", ano_publicacao=1965, descricao="A epopeia espacial em Arrakis", imagem=""),
        models.Book(id="5", nome="Fundação", autor="Isaac Asimov", genero="Ficcao Cientifica", ano_publicacao=1951, descricao="A queda e ascensão do império galáctico", imagem="")

    ]
    db.bulk_save_objects(books)
    db.commit()
    
    # Sincroniza o recomendador com os dados do banco de testes
    from app.recommender import recommender_system
    recommender_system.fit(db)
    
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


# Fixture para o cliente de teste do FastAPI substituindo o banco de dados
@pytest.fixture(name="client")
def fixture_client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

# --- TESTES ---

def test_create_user(client):
    """
    Testa se um novo usuário pode ser criado com sucesso.
    """
    response = client.post(
        "/auth/register",
        json={
            "username": "tester",
            "password": "testpassword123",
            "preferences": ["Fantasia"]
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "tester"
    assert data["preferences"] == "Fantasia"

def test_create_duplicate_user(client):
    """
    Testa se o sistema impede a criação de usuários com usernames idênticos.
    """
    client.post(
        "/auth/register",
        json={"username": "tester", "password": "password1", "preferences": []}
    )
    response = client.post(
        "/auth/register",
        json={"username": "tester", "password": "password2", "preferences": []}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Nome de usuário já está em uso."

def test_login(client):
    """
    Testa se o login funciona e retorna um token JWT válido.
    """
    client.post(
        "/auth/register",
        json={"username": "tester", "password": "testpassword123", "preferences": []}
    )
    response = client.post(
        "/auth/login/json",
        json={"username": "tester", "password": "testpassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["username"] == "tester"

def test_create_item(client):
    """
    Testa se novos livros podem ser adicionados ao acervo.
    """
    response = client.post(
        "/items/",
        json={
            "id": "100",
            "nome": "Neuromancer Especial",
            "autor": "William Gibson",
            "genero": "Ficção Científica",
            "ano_publicacao": 2020,
            "descricao": "Versão estendida do livro.",
            "imagem": "http://example.com/cover.jpg"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["nome"] == "Neuromancer Especial"
    assert data["id"] == "100"

def test_update_preferences(client):
    """
    Testa a atualização de preferências de gênero literário do usuário.
    """
    # 1. Registrar
    client.post(
        "/auth/register",
        json={"username": "tester", "password": "testpassword123", "preferences": []}
    )
    # 2. Login
    login_response = client.post(
        "/auth/login/json",
        json={"username": "tester", "password": "testpassword123"}
    )
    token = login_response.json()["access_token"]
    user_id = login_response.json()["user_id"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Atualizar preferências
    response = client.put(
        f"/users/{user_id}/preferences",
        headers=headers,
        json={"preferences": ["Fantasia", "Ficcao Cientifica"]}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["preferences"] == "Fantasia,Ficcao Cientifica"

def test_get_recommendations(client, db_session):
    """
    Testa a geração de recomendações de livros com base em preferências de gênero.
    """
    from app.recommender import recommender_system
    recommender_system.fit(db_session)
    
    # 1. Registrar com gêneros preferidos
    reg_response = client.post(
        "/auth/register",
        json={
            "username": "tester",
            "password": "testpassword123",
            "preferences": ["Ficcao Cientifica"]
        }
    )
    user_id = reg_response.json()["id"]

    
    # 2. Obter recomendações
    rec_response = client.get(f"/recommendations/{user_id}?top_n=2")
    assert rec_response.status_code == 200
    data = rec_response.json()
    assert len(data) == 2
    # Devem vir livros de ficção científica preferencialmente devido à similaridade de gênero
    first_genre = data[0]["book"]["genero"]
    assert first_genre == "Ficcao Cientifica"
