from sqlalchemy import Column, Integer, String, ForeignKey, Float, Table
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    preferences = Column(String, default="")  # Gêneros separados por vírgula: "Fantasia, Romance"

    # Relacionamentos
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    interactions = relationship("UserInteraction", back_populates="user", cascade="all, delete-orphan")

class Book(Base):
    __tablename__ = "books"

    id = Column(String, primary_key=True, index=True)  # Usar o id_livro do CSV como string/ID único
    nome = Column(String, index=True, nullable=False)
    autor = Column(String, index=True)
    genero = Column(String, index=True)
    ano_publicacao = Column(Integer)
    descricao = Column(String)
    imagem = Column(String)

    # Relacionamentos
    cart_items = relationship("CartItem", back_populates="book", cascade="all, delete-orphan")
    interactions = relationship("UserInteraction", back_populates="book", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(String, ForeignKey("books.id"), nullable=False)
    quantity = Column(Integer, default=1)

    # Relacionamentos
    user = relationship("User", back_populates="cart_items")
    book = relationship("Book", back_populates="cart_items")

class UserInteraction(Base):
    __tablename__ = "user_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(String, ForeignKey("books.id"), nullable=False)
    type = Column(String, nullable=False)  # "like", "view", "cart", "purchase"
    rating = Column(Float, nullable=True)  # Avaliação opcional de 1 a 5

    # Relacionamentos
    user = relationship("User", back_populates="interactions")
    book = relationship("Book", back_populates="interactions")
