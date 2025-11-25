import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // <--- AQUI ESTAVA O ERRO (Faltava o Link)
import logoImg from '../assets/logo512.png';

function Header({ titulo, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Define em quais páginas o botão "Voltar" NÃO deve aparecer
  const hideBackButton = location.pathname === '/dashboard' || location.pathname === '/' || location.pathname === '/admin/pedidos';

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        {!hideBackButton && (
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            ← Voltar
          </button>
        )}
      </div>

      <div style={styles.center}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src={logoImg} alt="Logo" style={{width: '65px', height: 'auto', marginRight: '10px'}} />
            <h3 style={styles.title}>{titulo || 'E-MedLog'}</h3>
        </div>
      </div>

      <div style={styles.right}>
        {/* Botão de Alterar Senha (Chave) */}
        <Link to="/alterar-senha" style={styles.keyButton} title="Alterar Senha">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
        </Link>

        <button onClick={onLogout} style={styles.logoutButton}>
          Sair
        </button>
      </div>
    </header>
  );
}

// Estilos simples embutidos para facilitar
const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0px 10px',
    backgroundColor: 'var(--cor-branco)', 
    borderBottom: '1px solid var(--cor-borda)', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 1000,
    boxSizing: 'border-box'
  },
  left: { flex: 1 },
  center: { flex: 2, textAlign: 'center' },
  right: { flex: 1, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }, // Adicionei flex aqui para alinhar os botões da direita
  title: {
    margin: 0,
    color: 'var(--cor-principal)', 
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  backButton: {
    background: 'transparent',
    border: '1px solid var(--cor-borda)',
    borderRadius: '4px',
    padding: '5px 10px',
    cursor: 'pointer',
    color: 'var(--cor-texto-secundario)'
  },
  logoutButton: {
    background: 'var(--cor-erro)', 
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  keyButton: {
    background: 'transparent',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '5px 10px',
    marginRight: '10px', 
    cursor: 'pointer',
    color: '#555',
    display: 'inline-flex',
    alignItems: 'center',
    height: '20px' // Altura fixa para alinhar com o botão de sair
  }
};

export default Header;