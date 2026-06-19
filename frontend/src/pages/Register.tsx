import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, KeyRound, User, AlertCircle, Loader2, BookOpen } from 'lucide-react';

interface RegisterProps {
  onNavigate: (page: string) => void;
}

const AVAILABLE_GENRES = [
  'Fantasia e Paranormal',
  'Ficção Científica',
  'Policial e Suspense',
  'Romance',
  'Mistério e Drama',
  'História e Biografia',
  'Infanto-Juvenil',
  'Aventura',
  'Geral'
];

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register(username, password, selectedGenres);
      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Falha ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '20px'
    }}>
      <div className="glass-panel cyber-border" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '30px',
        borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--card-shadow)',
        position: 'relative'
      }}>
        {/* Glow decorativo no topo */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--accent-green), transparent)',
          boxShadow: '0 0 10px var(--accent-green)'
        }} />

        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 className="display-title" style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
            CADASTRO
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
            Crie sua credencial de acesso
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '12px',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Username Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Nome de Usuário *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: jobal_user"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
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
            </div>
          </div>

          {/* Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Senha de Segurança *
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo de 4 caracteres"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
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
            </div>
          </div>

          {/* Confirm Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Confirmar Senha *
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita sua senha"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
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
            </div>
          </div>

          {/* Preferences Selector (Requisito Inteligente) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <label style={{ 
              fontSize: '0.8rem', 
              fontWeight: 600, 
              color: 'var(--text-secondary)', 
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <BookOpen size={14} color="var(--accent-green)" />
              Selecione seus Gêneros de Preferência (Opcional)
            </label>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              maxHeight: '120px',
              overflowY: 'auto',
              padding: '8px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-sm)'
            }}>
              {AVAILABLE_GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreToggle(genre)}
                    style={{
                      background: isSelected ? 'var(--accent-green-glow)' : 'transparent',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-green)' : 'var(--border-color)',
                      color: isSelected ? 'var(--accent-green)' : 'var(--text-secondary)',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="cyber-btn-filled"
            disabled={loading}
            style={{
              justifyContent: 'center',
              marginTop: '15px',
              width: '100%'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Criando Conta...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Registrar e Acessar
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div style={{
          marginTop: '25px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          Já possui conta?{' '}
          <span
            onClick={() => onNavigate('login')}
            style={{
              color: 'var(--accent-green)',
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'underline'
            }}
          >
            Acessar com Login
          </span>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};
