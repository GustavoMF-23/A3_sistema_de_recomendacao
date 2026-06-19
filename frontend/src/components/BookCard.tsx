import React from 'react';
import { useCart } from '../contexts/CartContext';
import type { Book } from '../contexts/CartContext';
import { ShoppingCart, Eye } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onViewDetails: (bookId: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onViewDetails }) => {
  const { addToCart, getBookPrice } = useCart();
  const price = getBookPrice(book.id);

  // Verifica se a imagem é inválida ou sem foto padrão
  const isNoPhoto = !book.imagem || 
                    book.imagem.includes('nophoto') || 
                    book.imagem === '';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita navegar para detalhes ao clicar no botão
    addToCart(book, 1);
  };

  return (
    <div 
      className="glass-panel cyber-border" 
      onClick={() => onViewDetails(book.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        padding: '12px',
        borderRadius: 'var(--border-radius-md)',
        transition: 'var(--transition-smooth)',
        position: 'relative',
      }}
    >
      {/* Capa do Livro */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        borderRadius: 'var(--border-radius-sm)',
        overflow: 'hidden',
        background: 'var(--bg-tertiary)',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isNoPhoto ? (
          /* Capa Estilizada Cyberpunk (Fallback) */
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #131b31 0%, #060913 100%)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(0, 255, 157, 0.1)',
            position: 'relative'
          }}>
            {/* Grid Lines decorativas */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(var(--accent-green-glow) 1px, transparent 0)',
              backgroundSize: '12px 12px',
              opacity: 0.15
            }} />
            
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--accent-green)',
              letterSpacing: '2px',
              fontFamily: 'var(--font-display)',
              position: 'relative',
              zIndex: 1
            }}>
              {book.genero || 'CYBER BOOK'}
            </span>

            <span style={{
              fontSize: '1rem',
              fontWeight: 700,
              lineHeight: 1.2,
              fontFamily: 'var(--font-display)',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              position: 'relative',
              zIndex: 1,
              maxHeight: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
            }}>
              {book.nome}
            </span>

            <span style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              position: 'relative',
              zIndex: 1
            }}>
              {book.autor || 'Desconhecido'}
            </span>
          </div>
        ) : (
          /* Imagem do Dataset */
          <img 
            src={book.imagem} 
            alt={book.nome}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease'
            }}
            onError={(e) => {
              // Se falhar o carregamento, transforma em capa fallback
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'fallback-cover';
                fallback.style.width = '100%';
                fallback.style.height = '100%';
                fallback.style.background = 'linear-gradient(135deg, #131b31 0%, #060913 100%)';
                fallback.style.padding = '16px';
                fallback.style.display = 'flex';
                fallback.style.flexDirection = 'column';
                fallback.style.justifyContent = 'space-between';
                fallback.innerHTML = `
                  <span style="font-size:0.7rem;font-weight:600;text-transform:uppercase;color:var(--accent-green);font-family:var(--font-display);">${book.genero}</span>
                  <span style="font-size:1rem;font-weight:700;font-family:var(--font-display);color:var(--text-primary);">${book.nome}</span>
                  <span style="font-size:0.8rem;color:var(--text-secondary);">${book.autor}</span>
                `;
                parent.appendChild(fallback);
              }
            }}
          />
        )}

        {/* Hover overlay com opções */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(6, 9, 19, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none' // Desativado por padrão, ativa no hover via CSS local
        }}
        className="hover-overlay"
        >
          <div style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            padding: '10px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            pointerEvents: 'auto'
          }}>
            <Eye size={20} />
          </div>
        </div>
      </div>

      {/* Gênero Tag */}
      <div style={{ marginBottom: '8px' }}>
        <span style={{
          fontSize: '0.7rem',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          padding: '2px 8px',
          borderRadius: '12px',
          color: 'var(--accent-green)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {book.genero || 'Geral'}
        </span>
      </div>

      {/* Título & Autor */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          lineHeight: 1.3,
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
        title={book.nome}
        >
          {book.nome}
        </h3>
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {book.autor || 'Autor Desconhecido'}
        </p>
      </div>

      {/* Preço & Compra */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '12px',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Por apenas</span>
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            color: 'var(--accent-green)', 
            fontFamily: 'var(--font-display)',
            textShadow: '0 0 4px var(--accent-green-glow)'
          }}>
            R$ {price.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <button 
          onClick={handleAddToCart}
          style={{
            background: 'var(--accent-green)',
            border: 'none',
            color: '#060913',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: 'var(--border-radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-smooth)',
            boxShadow: '0 2px 8px var(--accent-green-glow)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 12px var(--accent-green)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 8px var(--accent-green-glow)';
          }}
          title="Adicionar ao Carrinho"
        >
          <ShoppingCart size={18} />
        </button>
      </div>

      {/* Injeção de hover CSS manual para o card */}
      <style>{`
        .cyber-border:hover .hover-overlay {
          opacity: 1 !important;
        }
        .cyber-border:hover {
          transform: translateY(-4px);
          box-shadow: 0 0 15px var(--accent-green-glow) !important;
          border-color: var(--accent-green) !important;
        }
      `}</style>
    </div>
  );
};
