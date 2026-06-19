import React from 'react';
import { BookOpen, Mail, Phone, MapPin, CreditCard, Lock, Instagram, Facebook, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-panel" style={{
      marginTop: '80px',
      padding: '50px 0 20px 0',
      borderRadius: '24px 24px 0 0',
      borderBottom: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      background: 'rgba(10, 15, 30, 0.85)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(0, 255, 136, 0.2)',
      boxShadow: '0 -10px 30px rgba(0, 255, 136, 0.05)'
    }}>
      <div className="container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Column 1: Brand & About */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px'
            }}>
              <BookOpen size={24} color="var(--accent-green)" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.5))' }} />
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '1px'
              }}>
                GREENA-<span style={{ color: 'var(--accent-green)' }}>LEITURA</span>
              </span>
            </div>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              margin: 0
            }}>
              A sua livraria do futuro hoje. Conectando mentes curiosas com histórias extraordinárias e recomendações inteligentes de leitura.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: 600,
              marginBottom: '15px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Navegação
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Catálogo', 'Mais Vendidos', 'Novidades', 'Promoções'].map((link) => (
                <li key={link}>
                  <a href="#" style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-green)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Ajuda e Suporte */}
          <div>
            <h4 style={{
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: 600,
              marginBottom: '15px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Suporte
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Central de Ajuda', 'Fale Conosco', 'Política de Privacidade', 'Termos de Serviço'].map((link) => (
                <li key={link}>
                  <a href="#" style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-green)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contato & Social */}
          <div>
            <h4 style={{
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: 600,
              marginBottom: '15px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Contato
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--accent-green)" />
                <span>+55 (11) 3224-4000</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} color="var(--accent-green)" />
                <span>contato@greenaleitura.com.br</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={14} color="var(--accent-green)" style={{ marginTop: '3px', flexShrink: 0 }} />
                <span>Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
              {[
                { icon: <Facebook size={16} />, link: '#' },
                { icon: <Instagram size={16} />, link: '#' },
                { icon: <Twitter size={16} />, link: '#' }
              ].map((social, idx) => (
                <a key={idx} href={social.link} style={{
                  color: 'var(--text-secondary)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = 'var(--accent-green)';
                  e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--accent-green)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'none';
                }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Payment & Security Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          padding: '20px 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '20px'
        }}>
          {/* Payments */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Formas de Pagamento:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Visa', 'MasterCard', 'Elo', 'Pix', 'Boleto'].map((pay) => (
                <span key={pay} style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-primary)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}>
                  {pay}
                </span>
              ))}
            </div>
          </div>

          {/* Security */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <Lock size={14} color="var(--accent-green)" />
            <span>Ambiente 100% Seguro • Conexão Criptografada SSL</span>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          <span>
            &copy; {currentYear} GREENA-LEITURA LTDA. Todos os direitos reservados.
          </span>
          <span style={{ opacity: 0.6 }}>
            CNPJ: 12.345.678/0001-90 • Inscrição Estadual: 110.220.330.111
          </span>
        </div>
      </div>
    </footer>
  );
};

