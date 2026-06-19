import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import type { Book } from '../contexts/CartContext';
import { BookCard } from '../components/BookCard';
import { ArrowLeft, ShoppingCart, Calendar, BookMarked, User2, ArrowRight } from 'lucide-react';

interface BookDetailProps {
  bookId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const BookDetail: React.FC<BookDetailProps> = ({ bookId, onNavigate }) => {
  const { addToCart, getBookPrice } = useCart();
  const { user, token } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Registrar clique/visualização do livro
  useEffect(() => {
    const registerClick = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        await fetch(`${API_URL}/books/${bookId}/click`, {
          method: 'POST',
          headers
        });
      } catch (e) {
        // Silenciosamente ignora erros de tracking
      }
    };
    registerClick();
  }, [bookId, token]);

  // Carregar detalhes do livro atual
  useEffect(() => {
    const fetchBookDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/books/${bookId}`);
        if (response.ok) {
          const data = await response.json();
          setBook(data);
          setQuantity(1); // Reseta a quantidade
        }
      } catch (e) {
        console.error('Erro ao carregar detalhes do livro:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetail();
  }, [bookId]);

  // Carregar livros similares com base no gênero do livro carregado
  useEffect(() => {
    if (!book) return;

    const fetchSimilarBooks = async () => {
      setLoadingSimilar(true);
      try {
        // Busca livros do mesmo gênero
        const url = `${API_URL}/books?page=1&limit=5&genre=${encodeURIComponent(book.genero)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // Filtra o próprio livro da lista de recomendados
          const filtered = data.books.filter((b: Book) => b.id !== book.id);
          setSimilarBooks(filtered.slice(0, 4)); // Limita a 4 itens
        }
      } catch (e) {
        console.error('Erro ao carregar livros similares:', e);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilarBooks();
  }, [book]);

  const handleAddToCart = () => {
    if (!book) return;
    addToCart(book, quantity);
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div className="loader" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px 0' }}>
        <h2>Livro não encontrado.</h2>
        <button onClick={() => onNavigate('home')} className="cyber-btn" style={{ marginTop: '20px' }}>
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const price = getBookPrice(book.id);
  const isNoPhoto = !book.imagem || book.imagem.includes('nophoto') || book.imagem === '';

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
      
      {/* Botão de Voltar */}
      <button 
        onClick={() => onNavigate('home')}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '30px',
          fontSize: '0.95rem',
          transition: 'var(--transition-smooth)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-green)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={16} />
        Voltar para a Vitrine
      </button>

      {/* Grid do Livro (Detalhes e Capa) */}
      <div className="glass-panel cyber-border book-detail-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '40px',
        padding: '30px',
        borderRadius: 'var(--border-radius-lg)',
        marginBottom: '50px'
      }}>
        {/* Lado Esquerdo: Capa */}
        <div className="book-cover-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--border-radius-md)',
          padding: '20px',
          minHeight: '400px',
          border: '1px solid var(--border-color)'
        }}>
          {isNoPhoto ? (
            /* Capa Estilizada Cyberpunk */
            <div style={{
              width: '100%',
              maxWidth: '280px',
              height: '400px',
              background: 'linear-gradient(135deg, #131b31 0%, #060913 100%)',
              padding: '24px',
              borderRadius: 'var(--border-radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid rgba(0, 255, 157, 0.2)',
              boxShadow: '0 0 20px var(--accent-green-glow)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'radial-gradient(var(--accent-green-glow) 1px, transparent 0)',
                backgroundSize: '16px 16px',
                opacity: 0.2,
                borderRadius: 'var(--border-radius-sm)'
              }} />
              
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--accent-green)',
                letterSpacing: '3px',
                fontFamily: 'var(--font-display)',
                position: 'relative', zIndex: 1
              }}>
                {book.genero}
              </span>

              <span style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                lineHeight: 1.2,
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                position: 'relative', zIndex: 1
              }}>
                {book.nome}
              </span>

              <span style={{
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                position: 'relative', zIndex: 1
              }}>
                {book.autor}
              </span>
            </div>
          ) : (
            <img 
              src={book.imagem} 
              alt={book.nome}
              style={{
                width: '100%',
                maxWidth: '280px',
                maxHeight: '400px',
                objectFit: 'contain',
                borderRadius: 'var(--border-radius-sm)',
                boxShadow: 'var(--card-shadow)'
              }}
            />
          )}
        </div>

        {/* Lado Direito: Informações */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* Gênero Tag */}
          <div style={{ marginBottom: '10px' }}>
            <span style={{
              fontSize: '0.8rem',
              background: 'var(--accent-green-glow)',
              border: '1px solid var(--accent-green)',
              color: 'var(--accent-green)',
              padding: '4px 12px',
              borderRadius: '16px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {book.genero || 'Geral'}
            </span>
          </div>

          {/* Título e Autor */}
          <h1 className="display-title" style={{
            fontSize: '2rem',
            lineHeight: 1.2,
            marginBottom: '10px',
            color: 'var(--text-primary)'
          }}>
            {book.nome}
          </h1>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            marginBottom: '25px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '15px'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User2 size={16} color="var(--accent-green)" />
              {book.autor || 'Autor Desconhecido'}
            </span>
            {book.ano_publicacao > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} color="var(--accent-green)" />
                Publicado em {book.ano_publicacao}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookMarked size={16} color="var(--accent-green)" />
              ID: {book.id}
            </span>
          </div>

          {/* Descrição */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 700 }}>
              Sinopse do Livro
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              maxHeight: '200px',
              overflowY: 'auto',
              paddingRight: '10px'
            }}>
              {book.descricao || 'Este exemplar não possui uma sinopse registrada.'}
            </p>
          </div>

          {/* Preço e Carrinho */}
          <div className="glass-panel book-price-box" style={{
            padding: '20px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-md)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Preço Exclusivo</span>
              <span style={{ 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                color: 'var(--accent-green)',
                fontFamily: 'var(--font-display)',
                textShadow: '0 0 5px var(--accent-green-glow)'
              }}>
                R$ {price.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* Seletor de Quantidade */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-secondary)' }}>
                <button 
                  onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                >
                  -
                </button>
                <span style={{ padding: '0 12px', fontWeight: 600, fontSize: '0.95rem' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity((q) => Math.min(q + 1, 10))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                >
                  +
                </button>
              </div>

              {/* Botão comprar */}
              <button 
                onClick={handleAddToCart}
                className="cyber-btn-filled"
                style={{
                  padding: '10px 20px',
                  fontSize: '0.95rem'
                }}
              >
                <ShoppingCart size={18} />
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- LIVROS SIMILARES (Filtro por gênero no catálogo) --- */}
      <section>
        <h3 className="display-title" style={{
          fontSize: '1.3rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          Livros Relacionados em <span style={{ color: 'var(--accent-green)' }}>{book.genero}</span>
        </h3>
        
        {loadingSimilar ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <div className="loader" />
          </div>
        ) : similarBooks.length > 0 ? (
          <div className="grid-books">
            {similarBooks.map((simBook) => (
              <BookCard 
                key={`sim-${simBook.id}`} 
                book={simBook} 
                onViewDetails={(id) => onNavigate('book-detail', { id })}
              />
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Não encontramos outros títulos cadastrados neste gênero.
          </div>
        )}
      </section>

      {/* Estilos */}
      <style>{`
        .loader {
          border: 3px solid var(--bg-tertiary);
          border-top: 3px solid var(--accent-green);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
