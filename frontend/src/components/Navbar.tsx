import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { BookOpen, ShoppingCart, Sun, Moon, LogOut, User, LogIn } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderRadius: '0 0 16px 16px',
      borderTop: 'none',
      marginBottom: '30px',
      padding: '10px 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '60px'
      }}>
        {/* Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            cursor: 'pointer' 
          }}
        >
          <div style={{
            background: 'var(--accent-green)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px var(--accent-green-glow)'
          }}>
            <BookOpen size={24} color="#060913" />
          </div>
          <span className="display-title nav-logo-text" style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            background: 'linear-gradient(45deg, var(--text-primary), var(--accent-green))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            GREENA-LEITURA
          </span>
        </div>

        {/* Navigation / Actions */}
        <div className="nav-actions-container" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          {/* Catalogo Link */}
          <span 
            onClick={() => onNavigate('home')}
            style={{
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '1rem',
              color: currentPage === 'home' ? 'var(--accent-green)' : 'var(--text-secondary)',
              transition: 'var(--transition-smooth)',
            }}
            className="cyber-glow nav-catalog-link"
          >
            Catálogo
          </span>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-smooth)'
            }}
            title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Carrinho Icon */}
          <div 
            onClick={() => onNavigate('cart')}
            style={{
              position: 'relative',
              cursor: 'pointer',
              padding: '8px',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentPage === 'cart' ? 'var(--accent-green)' : 'var(--text-primary)',
              transition: 'var(--transition-smooth)'
            }}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'var(--accent-green)',
                color: '#060913',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 5px var(--accent-green-glow)'
              }}>
                {cartCount}
              </span>
            )}
          </div>

          {/* User Auth Info */}
          {user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div 
                onClick={() => onNavigate('preferences')}
                className="nav-user-pill"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <User size={16} color="var(--accent-green)" />
                <span className="nav-user-name" style={{ fontWeight: 500 }}>{user.username}</span>
              </div>
              <button 
                onClick={() => {
                  logout();
                  onNavigate('home');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.9rem',
                  transition: 'var(--transition-smooth)'
                }}
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('login')}
              className="cyber-btn nav-login-btn"
              style={{
                padding: '6px 16px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogIn size={16} />
              <span className="nav-login-btn-text">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
