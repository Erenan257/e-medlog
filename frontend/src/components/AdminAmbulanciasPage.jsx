import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './PedidosPage.css';

function AdminAmbulanciasPage() {
  
  const navigate = useNavigate(); 
  
  const [ambulancias, setAmbulancias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novaPlaca, setNovaPlaca] = useState('');
  const [novoTipo, setNovoTipo] = useState('USB');

  
  const fetchAmbulancias = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ambulancias`);
      const data = await response.json();
      setAmbulancias(data);
    } catch (error) {
      alert('Erro ao carregar ambulâncias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbulancias();
  }, []);

  
  const handleCriar = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ambulancias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placa: novaPlaca, tipo: novoTipo, status: 'Apto' })
      });
      
      if (response.ok) {
        alert('Ambulância criada!');
        setNovaPlaca('');
        fetchAmbulancias();
      } else {
        alert('Erro ao criar');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  };

  
  const handleTornarApta = async (id) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ambulancias/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status: 'Apto', 
                motivo: null 
            })
        });

        if (response.ok) {
            alert('Viatura marcada como APTA e liberada!');
            fetchAmbulancias(); 
        } else {
            alert('Erro ao atualizar status.');
        }
    } catch (error) {
        alert('Erro de conexão');
    }
  };

  
  const handleExcluir = async (id) => {
    if (!confirm('Tem certeza? Isso apagará o histórico desta viatura se houver.')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ambulancias/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Ambulância excluída!');
        fetchAmbulancias();
      } else {
        alert('Erro ao excluir.');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  };

  return (
    <div className="pedidos-container">
      
      <h1>Gestão de Ambulâncias</h1>

      <form onSubmit={handleCriar} style={{marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px'}}>
        <h3>Nova Viatura</h3>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <input 
            type="text" 
            placeholder="Placa (ex: BRA-2025)" 
            value={novaPlaca} 
            onChange={(e) => setNovaPlaca(e.target.value)} 
            required 
            style={{padding: '8px', flex: 1}}
          />
          <select value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)} style={{padding: '8px'}}>
            <option value="USB">USB (Básica)</option>
            <option value="USA">USA (Avançada)</option>
          </select>
          <button type="submit" className="submit-button" style={{width: 'auto', marginTop: 0}}>Cadastrar</button>
        </div>
      </form>

      <div className="pedidos-list">
        <div className="pedido-header" style={{gridTemplateColumns: '0.5fr 1fr 1fr 1.5fr 1fr'}}>
          <span>ID</span>
          <span>Placa</span>
          <span>Tipo</span>
          <span>Status</span>
          <span>Ações</span>
        </div>
        
        {loading ? <p>Carregando...</p> : ambulancias.map((amb) => (
          <div className="pedido-item" key={amb.ID_Ambulancia} style={{gridTemplateColumns: '0.5fr 1fr 1fr 1.5fr 1fr', alignItems: 'center'}}>
            <span>#{amb.ID_Ambulancia}</span>
            <span style={{fontWeight: 'bold'}}>{amb.Placa}</span>
            <span>{amb.Tipo_Ambulancia}</span>
            
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <span style={{
                    color: amb.Status_Operacional === 'Apto' ? 'green' : 'red',
                    fontWeight: 'bold'
                }}>
                    {amb.Status_Operacional}
                </span>
                {amb.Status_Operacional === 'Inapto' && (
                    <span style={{fontSize: '0.8rem', color: '#555', fontStyle: 'italic'}}>
                        {amb.Motivo_Indisponibilidade || 'Sem motivo'}
                    </span>
                )}
            </div>

            <div style={{display: 'flex', gap: '5px'}}>
                {/* Botão KIT (Agora vai funcionar!) */}
                <button 
                      onClick={() => navigate(`/admin/ambulancias/${amb.ID_Ambulancia}/configurar`)} 
                      className="action-button" 
                      style={{backgroundColor: '#22199eff', color: 'white', border: 'none', fontSize: '0.8rem', padding: '5px 10px'}}
                      title="Configurar Inventário"
                  >
                       Insumos
                  </button>

                {/* Botão ATIVAR */}
                {amb.Status_Operacional === 'Inapto' && (
                    <button 
                        onClick={() => handleTornarApta(amb.ID_Ambulancia)} 
                        className="action-button" 
                        style={{backgroundColor: '#28a745', color: 'white', border: 'none', fontSize: '0.8rem', padding: '5px 10px'}}
                        title="Tornar Apta"
                    >
                         Ativar
                    </button>
                )}
                
                <button onClick={() => handleExcluir(amb.ID_Ambulancia)} className="action-button" style={{color: 'red', fontSize: '0.8rem'}}>
                  Excluir
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminAmbulanciasPage;