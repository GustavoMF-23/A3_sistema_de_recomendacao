import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import type { CartItem } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, ShoppingBag, ArrowLeft, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';

interface CartProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Cart: React.FC<CartProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { cartItems, cartTotal, addToCart, removeFromCart, clearCart, getBookPrice } = useCart();
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleQuantityChange = (item: CartItem, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(item.book.id);
    } else {
      addToCart(item.book, newQty);
    }
  };

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    clearCart(); // Limpa do backend ou local
  };

  if (checkoutSuccess) {
    return (
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center', padding: '60px 20px' }}>
        <div className="glass-panel cyber-border" style={{
          padding: '40px 30px',
          borderRadius: 'var(--border-radius-lg)',
          position: 'relative'
        }}>
          {/* Glow decorativo */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--accent-green), transparent)',
            boxShadow: '0 0 10px var(--accent-green)'
          }} />

          <div style={{
            display: 'inline-flex',
            background: 'var(--accent-green-glow)',
            color: 'var(--accent-green)',
            padding: '16px',
            borderRadius: '50%',
            marginBottom: '20px',
            boxShadow: '0 0 15px var(--accent-green-glow)'
          }}>
            <CheckCircle2 size={40} />
          </div>

          <h2 className="display-title" style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
            TRANSAÇÃO EFETUADA
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '30px' }}>
            Seu pedido foi processado com sucesso em nossos servidores. Uma notificação de despacho foi gerada na sua rede de dados. Agradecemos a preferência!
          </p>

          <button 
            onClick={() => {
              setCheckoutSuccess(false);
              onNavigate('home');
            }}
            className="cyber-btn-filled"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Voltar ao Catálogo Geral
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center', padding: '80px 20px' }}>
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          padding: '20px',
          borderRadius: '50%',
          color: 'var(--text-secondary)',
          marginBottom: '20px'
        }}>
          <ShoppingBag size={40} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
          Seu carrinho está vazio
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '30px' }}>
          Explore o catálogo futurista de livros e adicione exemplares para recalibrar suas recomendações e preencher seu inventário.
        </p>
        <button onClick={() => onNavigate('home')} className="cyber-btn-filled">
          <ArrowLeft size={16} />
          Explorar Livros
        </button>
      </div>
    );
  }

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

      <h1 className="display-title" style={{ fontSize: '1.8rem', marginBottom: '25px', color: 'var(--text-primary)' }}>
        Carrinho de Compras
      </h1>

      {/* Grid Principal do Carrinho */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Lado Esquerdo: Lista de Itens */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cartItems.map((item) => {
            const price = getBookPrice(item.book.id);
            const isNoPhoto = !item.book.imagem || item.book.imagem.includes('nophoto') || item.book.imagem === '';

            return (
              <div 
                key={`cart-${item.book.id}`}
                className="glass-panel cyber-border cart-item-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: 'var(--border-radius-md)'
                }}
              >
                {/* Imagem do livro (pequena) */}
                <div 
                  onClick={() => onNavigate('book-detail', { id: item.book.id })}
                  style={{
                    width: '60px',
                    height: '90px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    background: 'var(--bg-tertiary)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isNoPhoto ? (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #131b31 0%, #060913 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.5rem',
                      fontWeight: 'bold',
                      color: 'var(--accent-green)',
                      textAlign: 'center',
                      padding: '4px'
                    }}>
                      CYBER
                    </div>
                  ) : (
                    <img 
                      src={item.book.imagem} 
                      alt={item.book.nome} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>

                {/* Info Text */}
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <h3 
                    onClick={() => onNavigate('book-detail', { id: item.book.id })}
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-green)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  >
                    {item.book.nome}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {item.book.autor}
                  </p>
                  
                  {/* Controles de Quantidade */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '4px',
                      background: 'var(--bg-tertiary)' 
                    }}>
                      <button 
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          padding: '2px 8px',
                          fontWeight: 'bold'
                        }}
                      >
                        -
                      </button>
                      <span style={{ padding: '0 8px', fontSize: '0.85rem', fontWeight: 600 }}>{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          padding: '2px 8px',
                          fontWeight: 'bold'
                        }}
                      >
                        +
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.book.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'var(--transition-smooth)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Preço subtotal */}
                <div className="cart-item-price" style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--accent-green)',
                    fontFamily: 'var(--font-display)',
                  }}>
                    R$ {(price * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    R$ {price.toFixed(2).replace('.', ',')} un.
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lado Direito: Resumo de Compra */}
        <div className="glass-panel cyber-border" style={{
          padding: '24px',
          borderRadius: 'var(--border-radius-md)',
          background: 'var(--bg-secondary)',
          position: 'relative'
        }}>
          <h2 className="display-title" style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Resumo do Pedido
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Total de itens</span>
              <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Frete Estimado</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>GRÁTIS (CYBER)</span>
            </div>
            
            {user && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                padding: '10px',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                marginTop: '10px'
              }}>
                <Sparkles size={16} color="var(--accent-green)" />
                <span>Calibração automática de IA ativa para usuário logado.</span>
              </div>
            )}
          </div>

          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '16px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline'
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>Valor Total</span>
            <span style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--accent-green)',
              fontFamily: 'var(--font-display)',
              textShadow: '0 0 5px var(--accent-green-glow)'
            }}>
              R$ {cartTotal.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button 
            onClick={handleCheckout}
            className="cyber-btn-filled"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px',
              fontSize: '1rem'
            }}
          >
            <CreditCard size={18} />
            Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
};
