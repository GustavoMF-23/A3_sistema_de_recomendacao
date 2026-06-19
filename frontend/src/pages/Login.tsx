import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, KeyRound, User, AlertCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      padding: '20px'
    }}>
      <div className="glass-panel cyber-border" style={{
        width: '100%',
        maxWidth: '400px',
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

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 className="display-title" style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
            IDENTIFICAÇÃO
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
            Entre na sua conta Greena-Leitura
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Username Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Usuário (Username)
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
                placeholder="Ex: jobal"
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
              Senha de Segurança
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
                placeholder="Digite sua senha"
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

          {/* Submit Button */}
          <button
            type="submit"
            className="cyber-btn-filled"
            disabled={loading}
            style={{
              justifyContent: 'center',
              marginTop: '10px',
              width: '100%'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Confirmar Login
              </>
            )}
          </button>
        </form>

        {/* Cadastro Link */}
        <div style={{
          marginTop: '25px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          Não possui cadastro?{' '}
          <span
            onClick={() => onNavigate('register')}
            style={{
              color: 'var(--accent-green)',
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'underline'
            }}
          >
            Criar conta de usuário
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
