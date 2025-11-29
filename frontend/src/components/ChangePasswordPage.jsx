import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PedidosPage.css'; 


const EyeIcon = ({ visible }) => (
  visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
  )
);

function ChangePasswordPage({ usuario }) {
  const navigate = useNavigate();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (novaSenha !== confirmarSenha) {
        alert("A nova senha e a confirmação não batem!");
        return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/alterar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_usuario: usuario.ID_Usuario,
            senha_atual: senhaAtual,
            nova_senha: novaSenha
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Senha alterada com sucesso!');
        navigate('/dashboard');
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      alert('Erro de conexão.');
    }
  };

  return (
    <div className="pedidos-container" style={{maxWidth: '400px'}}>
      <h1>Alterar Senha</h1>
      
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        
        <div>
            <label>Senha Atual</label>
            <div style={{position: 'relative'}}>
                <input 
                    type={showPass ? "text" : "password"} 
                    value={senhaAtual} 
                    onChange={e => setSenhaAtual(e.target.value)} 
                    required 
                    style={{width: '100%', padding: '10px', boxSizing: 'border-box'}}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#888'}}>
                    <EyeIcon visible={showPass} />
                </button>
            </div>
        </div>

        <div>
            <label>Nova Senha</label>
            <input 
                type={showPass ? "text" : "password"} 
                value={novaSenha} 
                onChange={e => setNovaSenha(e.target.value)} 
                required 
                style={{width: '100%', padding: '10px', boxSizing: 'border-box'}}
            />
        </div>

        <div>
            <label>Confirmar Nova Senha</label>
            <input 
                type={showPass ? "text" : "password"} 
                value={confirmarSenha} 
                onChange={e => setConfirmarSenha(e.target.value)} 
                required 
                style={{width: '100%', padding: '10px', boxSizing: 'border-box'}}
            />
        </div>

        <button type="submit" className="submit-button">Salvar Nova Senha</button>
      </form>
    </div>
  );
}

export default ChangePasswordPage;