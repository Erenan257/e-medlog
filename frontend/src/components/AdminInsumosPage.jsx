import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PedidosPage.css'; 

function AdminInsumosPage() {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  // Função para buscar os insumos da API
  const fetchInsumos = async () => {
     
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/insumos`);
      if (!response.ok) { throw new Error('A resposta da rede não foi OK'); }
      const data = await response.json();
      setInsumos(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchInsumos();
  }, []);

 
  const handleDeleteInsumo = async (insumoId) => {
    
    if (!window.confirm(`Tem certeza que deseja excluir o insumo ID ${insumoId}?`)) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/insumos/${insumoId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchInsumos(); 
      } else {
       
        throw new Error(data.message);
      }
    } catch (err) {
      alert(`Erro ao excluir insumo: ${err.message}`);
    }
  };

  if (loading) return <p>Carregando insumos...</p>;
  if (error) return <p>Erro ao carregar insumos: {error}</p>;

  return (
    <div className="pedidos-container">

      <div className="page-header">
        <h1>Gerenciamento de Insumos</h1>
        <Link to="/admin/insumos/novo" className="btn-new">Criar Novo Insumo</Link>
      </div>

      <div className="pedidos-list">
        <div className="pedido-header" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
          <span>Nome</span>
          <span>Unidade</span>
          <span>Qtd. Mínima</span>
          <span>Ações</span>
        </div>
        {insumos.map((insumo) => (
          <div className="pedido-item" key={insumo.ID_Insumo} style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
            <span>{insumo.Nome_Insumo}</span>
            <span>{insumo.Unidade_Medida}</span>
            <span>{insumo.Quantidade_Minima}</span>
            <div className="item-actions">
              {/* 3. O botão de Editar agora usa o 'navigate' para ir para a página de formulário */}
              <button onClick={() => navigate(`/admin/insumos/${insumo.ID_Insumo}`)} className="action-button edit">
                Editar
              </button>
              {/* 4. O botão de Excluir agora chama a nossa nova função */}
              <button onClick={() => handleDeleteInsumo(insumo.ID_Insumo)} className="action-button">
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminInsumosPage;