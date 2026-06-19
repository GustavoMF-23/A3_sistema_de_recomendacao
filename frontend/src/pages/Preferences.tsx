import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Save, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface PreferencesProps {
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

export const Preferences: React.FC<PreferencesProps> = ({ onNavigate }) => {
  const { user, updatePreferences } = useAuth();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Inicializar preferências do usuário se logado
  useEffect(() => {
    if (user) {
      // Se user.preferences existe no contexto, carrega ela.
      // Se não, podemos tentar ler do localStorage
      const savedUserStr = localStorage.getItem('cyber-user');
      if (savedUserStr) {
        try {
          const u = JSON.parse(savedUserStr);
          if (u.preferences) {
            setSelectedGenres(u.preferences);
            return;
          }
        } catch {}
      }
      setSelectedGenres([]);
    }
  }, [user]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updatePreferences(selectedGenres);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Esconde a mensagem de sucesso após 3s
    } catch (err: any) {
      setError('Falha ao salvar as preferências. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '40px 0' }}>
        <p>Você precisa estar logado para acessar as preferências.</p>
        <button onClick={() => onNavigate('login')} className="cyber-btn" style={{ marginTop: '20px' }}>
          Ir para Login
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '600px', padding: '20px 0' }}>
      {/* Botão Voltar */}
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
          marginBottom: '20px',
          fontSize: '0.95rem',
          transition: 'var(--transition-smooth)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-green)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={16} />
        Voltar para a Loja
      </button>

      <div className="glass-panel cyber-border" style={{
        padding: '30px',
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

        <div style={{ marginBottom: '25px' }}>
          <h2 className="display-title" style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
            PERFIL & INTERESSES
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
            Atualize seus gêneros favoritos para calibrar o motor de recomendações por Inteligência Artificial.
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

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--accent-green)',
            padding: '12px',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <CheckCircle2 size={18} />
            <span>Preferências calibradas e salvas com sucesso! As recomendações foram recalculadas.</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* User Info */}
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            padding: '15px',
            borderRadius: 'var(--border-radius-md)'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Nome de Usuário Ativo
            </span>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '4px' }}>
              {user.username}
            </h3>
          </div>

          {/* Gêneros Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Seus Gêneros Literários Favoritos
            </span>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '15px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-md)'
            }}>
              {AVAILABLE_GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    style={{
                      background: isSelected ? 'var(--accent-green-glow)' : 'transparent',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-green)' : 'var(--border-color)',
                      color: isSelected ? 'var(--accent-green)' : 'var(--text-secondary)',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
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

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="cyber-btn-filled"
            disabled={saving}
            style={{
              justifyContent: 'center',
              marginTop: '10px',
              width: '100%'
            }}
          >
            <Save size={18} />
            {saving ? 'Gravando Alterações...' : 'Calibrar Recomendador'}
          </button>
        </div>
      </div>
    </div>
  );
};
