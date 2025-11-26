import React, { useState } from 'react';
import './LoginPage.css';
import logoImg from '../assets/logo512.png';
import Footer from './Footer';  

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.usuario);
      } else {
        setMessage(data.message || 'Erro ao entrar.');
      }
    } catch (error) {
      setMessage('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div style={{textAlign: 'center', marginBottom: '25px'}}>
            
            <img src={logoImg} alt="E-MedLog Logo" style={{width: '180px', height: 'auto'}} />
            {/* <h2 style={{color: '#42b72a', margin: 0}}>E-MedLog</h2>  <-- */}
            <p style={{color: '#666', fontSize: '1rem', marginTop: '5px', fontWeight: '500'}}>Gestão de Insumos</p>
        </div>

        {message && <div className="feedback-message" style={{backgroundColor: '#ffebe6', color: '#cc0033', border: '1px solid #ffcdd2'}}>{message}</div>}

        <div className="input-group">
          <label htmlFor="email">E-mail</label>
          <input 
            type="email" 
            id="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="seu@email.com"
            style={{
              padding: '10px', 
              width: '100%',
              boxSizing: 'border-box' 
            }}
          />
        </div>

        
        <div className="input-group" style={{position: 'relative'}}>
          <label htmlFor="password">Senha</label>
          <input 
            type={showPassword ? "text" : "password"}
            id="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Sua senha"
            style={{
              padding: '10px',        
              paddingRight: '40px',   
              width: '100%',
              boxSizing: 'border-box'
            }} 
          />
          
          
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '36px', 
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#888',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            ) : (
              
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            )}
          </button>
        </div>

        <button type="submit" disabled={loading} style={{opacity: loading ? 0.7 : 1}}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <Footer/>
      </form>
    </div>
  );
}

export default LoginPage;