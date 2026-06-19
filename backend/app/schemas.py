from pydantic import BaseModel, ConfigDict
from typing import List, Optional

# Esquemas de Livros (Book)
class BookBase(BaseModel):
    id: str
    nome: str
    autor: Optional[str] = None
    genero: Optional[str] = None
    ano_publicacao: Optional[int] = None
    descricao: Optional[str] = None
    imagem: Optional[str] = None

class BookCreate(BookBase):
    pass

class BookResponse(BookBase):
    model_config = ConfigDict(from_attributes=True)

class BookPaginatedResponse(BaseModel):
    total: int
    page: int
    limit: int
    books: List[BookResponse]

# Esquemas de Preferências de Usuário
class UserUpdatePreferences(BaseModel):
    preferences: List[str]  # Lista de gêneros preferidos: ["Fantasia e Paranormal", "Romance"]

# Esquemas de Usuário (User)
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    preferences: Optional[List[str]] = []  # Preferências iniciais no cadastro

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    preferences: str  # Gêneros separados por vírgula no banco, ex: "Fantasia e Paranormal,Romance"

    model_config = ConfigDict(from_attributes=True)

# Esquemas de Carrinho (Cart)
class CartItemBase(BaseModel):
    book_id: str
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(BaseModel):
    id: int
    book: BookResponse
    quantity: int

    model_config = ConfigDict(from_attributes=True)

# Esquemas de Token JWT
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None

# Esquemas de Recomendação
class RecommendationResponse(BaseModel):
    book: BookResponse
    score: float

    model_config = ConfigDict(from_attributes=True)

class BrowsingRecommendationSection(BaseModel):
    source_book: BookResponse
    recommendations: List[RecommendationResponse]

    model_config = ConfigDict(from_attributes=True)

# Esquemas de Interações
class UserInteractionCreate(BaseModel):
    book_id: str
    type: str  # "view", "like", "cart"

