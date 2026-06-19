import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../contexts/AuthContext';
import { BookCard } from '../components/BookCard';
import type { Book } from '../contexts/CartContext';
import { Search, Sparkles, ChevronLeft, ChevronRight, BookOpen, User, ArrowRight, MousePointerClick } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  
  // Estados para o Catálogo Geral
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Estado para o input (só busca ao dar enter ou clicar no botão)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Estados para as Recomendações de IA
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Estados para Recomendações baseadas em Navegação (estilo Amazon)
  interface BrowsingSection {
    source_book: Book;
    recommendations: { book: Book; score: number }[];
  }
  const [browsingSections, setBrowsingSections] = useState<BrowsingSection[]>([]);
  const [loadingBrowsing, setLoadingBrowsing] = useState(false);
  // Contador que incrementa a cada montagem do componente para forçar atualização
  const [refreshKey, setRefreshKey] = useState(0);

  // Incrementar refreshKey a cada montagem para refletir novos cliques
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Carregar gêneros disponíveis na montagem do componente
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(`${API_URL}/books/genres`);
        if (response.ok) {
          const data = await response.json();
          setGenres(data);
        }
      } catch (e) {
        console.error('Erro ao carregar gêneros:', e);
      }
    };
    fetchGenres();
  }, []);

  // Carregar Catálogo de Livros (Sempre que mudarem página, gênero ou busca)
  useEffect(() => {
    const fetchBooks = async () => {
      setLoadingCatalog(true);
      try {
        let url = `${API_URL}/books?page=${currentPage}&limit=12`;
        if (selectedGenre) {
          url += `&genre=${encodeURIComponent(selectedGenre)}`;
        }
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setBooks(data.books);
          setTotalPages(Math.ceil(data.total / data.limit) || 1);
        }
      } catch (e) {
        console.error('Erro ao carregar catálogo de livros:', e);
      } finally {
        setLoadingCatalog(false);
      }
    };

    fetchBooks();
  }, [currentPage, selectedGenre, searchQuery]);

  // Carregar Recomendações Personalizadas
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) {
        setRecommendedBooks([]);
        return;
      }

      setLoadingRecommendations(true);
      try {
        const response = await fetch(`${API_URL}/recommendations/${user.id}?top_n=6`);
        if (response.ok) {
          const data = await response.json();
          // O retorno é List[RecommendationResponse] -> { book, score }
          const mappedBooks = data.map((item: any) => item.book);
          setRecommendedBooks(mappedBooks);
        }
      } catch (e) {
        console.error('Erro ao carregar recomendações:', e);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  // Carregar Recomendações Baseadas em Navegação (estilo Amazon)
  useEffect(() => {
    const fetchBrowsingHistory = async () => {
      if (!user) {
        setBrowsingSections([]);
        return;
      }

      setLoadingBrowsing(true);
      try {
        const response = await fetch(
          `${API_URL}/recommendations/${user.id}/browsing-history?max_sections=3&items_per_section=6`
        );
        if (response.ok) {
          const data = await response.json();
          setBrowsingSections(data);
        }
      } catch (e) {
        console.error('Erro ao carregar recomendações por navegação:', e);
      } finally {
        setLoadingBrowsing(false);
      }
    };

    fetchBrowsingHistory();
  }, [user, refreshKey]);

  // Handler para busca por texto
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1); // Volta para a primeira página
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre === selectedGenre ? '' : genre); // Desmarca se clicar novamente
    setCurrentPage(1);
  };

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
      
      {/* Banner de Boas Vindas */}
      <section className="glass-panel cyber-border welcome-banner" style={{
        padding: '40px 30px',
        borderRadius: 'var(--border-radius-lg)',
        backgroundImage: 'linear-gradient(135deg, rgba(6, 9, 19, 0.9) 0%, rgba(19, 27, 49, 0.8) 100%)',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Detalhes de Grid Futuristas */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(rgba(0, 255, 157, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 157, 0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '650px' }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--accent-green)',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-display)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px'
          }}>
            <Sparkles size={16} />
            Motor de Inteligência Artificial Ativo
          </span>
          <h1 className="display-title welcome-banner-title" style={{
            fontSize: '2.5rem',
            lineHeight: 1.1,
            marginBottom: '15px',
            color: 'var(--text-primary)'
          }}>
            A Próxima Geração da <span style={{ color: 'var(--accent-green)', textShadow: '0 0 10px var(--accent-green-glow)' }}>Leitura</span>
          </h1>
          <p className="welcome-banner-desc" style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            marginBottom: '25px',
            lineHeight: 1.6
          }}>
            Descubra milhares de títulos literários com recomendações calibradas especificamente para o seu perfil e interesses através do nosso algoritmo de similaridade neural.
          </p>

          {!user && (
            <button 
              onClick={() => onNavigate('login')}
              className="cyber-btn-filled"
              style={{ padding: '12px 28px' }}
            >
              Iniciar Calibração de Perfil
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </section>

      {/* --- SEÇÃO DE RECOMENDAÇÕES DA IA (Apenas usuários logados) --- */}
      {user && (
        <section style={{ marginBottom: '50px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'var(--accent-green-glow)',
                color: 'var(--accent-green)',
                padding: '6px',
                borderRadius: '8px'
              }}>
                <Sparkles size={20} />
              </div>
              <h2 className="display-title" style={{ fontSize: '1.4rem' }}>
                Recomendados para Você
              </h2>
            </div>
            
            <button 
              onClick={() => onNavigate('preferences')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-green)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Calibrar Interesses
            </button>
          </div>

          {loadingRecommendations ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div className="loader" />
            </div>
          ) : recommendedBooks.length > 0 ? (
            <div className="grid-books">
              {recommendedBooks.map((book) => (
                <BookCard 
                  key={`rec-${book.id}`} 
                  book={book} 
                  onViewDetails={(id) => onNavigate('book-detail', { id })}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Ainda não temos dados suficientes para gerar recomendações personalizadas. 
              Experimente adicionar livros ao carrinho ou configurar seus gêneros nas preferências!
            </div>
          )}
        </section>
      )}

      {/* --- SEÇÕES "PORQUE VOCÊ VIU" (Estilo Amazon) --- */}
      {user && browsingSections.length > 0 && (
        <>
          {loadingBrowsing ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div className="loader" />
            </div>
          ) : (
            browsingSections.map((section, sectionIdx) => (
              <section key={`browse-${section.source_book.id}-${sectionIdx}`} style={{ marginBottom: '40px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8',
                    padding: '6px',
                    borderRadius: '8px'
                  }}>
                    <MousePointerClick size={20} />
                  </div>
                  <h2 className="display-title" style={{ fontSize: '1.3rem' }}>
                    Porque você viu{' '}
                    <span style={{
                      color: '#818cf8',
                      textShadow: '0 0 8px rgba(99, 102, 241, 0.3)'
                    }}>
                      {section.source_book.nome.length > 40
                        ? section.source_book.nome.substring(0, 40) + '...'
                        : section.source_book.nome}
                    </span>
                  </h2>
                </div>

                <div className="grid-books">
                  {section.recommendations.map((rec) => (
                    <BookCard
                      key={`browse-rec-${rec.book.id}`}
                      book={rec.book}
                      onViewDetails={(id) => onNavigate('book-detail', { id })}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </>
      )}

      {/* --- CATÁLOGO GERAL DE LIVROS --- */}
      <section>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginBottom: '30px'
        }}>
          {/* Header do Catálogo e Busca */}
          <div className="home-catalog-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'var(--accent-green-glow)',
                color: 'var(--accent-green)',
                padding: '6px',
                borderRadius: '8px'
              }}>
                <BookOpen size={20} />
              </div>
              <h2 className="display-title" style={{ fontSize: '1.4rem' }}>
                Catálogo de Livros
              </h2>
            </div>

            {/* Formulário de Busca */}
            <form onSubmit={handleSearchSubmit} className="home-search-form" style={{
              display: 'flex',
              width: '100%',
              maxWidth: '380px',
              position: 'relative'
            }}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por livro ou autor..."
                style={{
                  width: '100%',
                  padding: '10px 45px 10px 16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-green)';
                  e.target.style.boxShadow = '0 0 8px var(--accent-green-glow)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button type="submit" style={{
                position: 'absolute',
                right: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-green)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Filtro de Gêneros (Horizontal Scrollable Chips) */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'none', // Oculta no Firefox
            msOverflowStyle: 'none' // Oculta no IE
          }}>
            <button
              onClick={() => {
                setSelectedGenre('');
                setCurrentPage(1);
              }}
              style={{
                background: selectedGenre === '' ? 'var(--accent-green)' : 'var(--bg-secondary)',
                border: '1px solid',
                borderColor: selectedGenre === '' ? 'var(--accent-green)' : 'var(--border-color)',
                color: selectedGenre === '' ? '#060913' : 'var(--text-secondary)',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                whiteSpace: 'nowrap'
              }}
            >
              TODOS
            </button>
            
            {genres.map((genre) => {
              const isSelected = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => handleGenreSelect(genre)}
                  style={{
                    background: isSelected ? 'var(--accent-green)' : 'var(--bg-secondary)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-green)' : 'var(--border-color)',
                    color: isSelected ? '#060913' : 'var(--text-secondary)',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {genre.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Livros (Grid) */}
        {loadingCatalog ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="loader" />
          </div>
        ) : books.length > 0 ? (
          <>
            <div className="grid-books">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onViewDetails={(id) => onNavigate('book-detail', { id })}
                />
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
                marginTop: '40px'
              }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="cyber-btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem'
                  }}
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>
                
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Página <span style={{ color: 'var(--accent-green)' }}>{currentPage}</span> de {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="cyber-btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem'
                  }}
                >
                  Próxima
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Nenhum livro encontrado correspondente aos critérios de busca.
          </div>
        )}
      </section>

      {/* Loader CSS */}
      <style>{`
        .loader {
          border: 3px solid var(--bg-tertiary);
          border-top: 3px solid var(--accent-green);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          box-shadow: 0 0 10px var(--accent-green-glow);
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
