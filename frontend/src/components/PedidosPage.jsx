import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PedidosPage.css';

function PedidosPage() { // Se tiver recebendo 'usuario' via prop, adicione { usuario } aqui. Se não, vamos pegar do localStorage ou contexto no futuro. Por enquanto assumimos que a rota protege.
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('Todos'); // Novo Estado
  const [loading, setLoading] = useState(true);

  // Simulação simples para pegar perfil (idealmente viria via props do App.jsx)
  const usuarioJson = localStorage.getItem('usuarioLogado'); 
  const usuario = usuarioJson ? JSON.parse(usuarioJson) : null;
  const podeAprovar = usuario && (usuario.Perfil === 'Gestor' || usuario.Perfil === 'Farmacia');

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos/`);
        if (response.ok) {
          const data = await response.json();
          setPedidos(data);
        }
      } catch (error) {
        console.error("Erro ao buscar pedidos");
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  // Lógica de Filtro
  const pedidosFiltrados = pedidos.filter(pedido => {
    // 1. Se o filtro for "Todos", mostra tudo
    if (filtro === 'Todos') return true;
    
    // 2. Proteção: Se o pedido não tiver status (null), esconde para não dar erro
    if (!pedido.Status_Pedido) return false;

    // 3. A Mágica: Converte tudo para minúsculo antes de comparar
    // Assim 'Pendente' é igual a 'pendente', 'PENDENTE', etc.
    return pedido.Status_Pedido.toLowerCase() === filtro.toLowerCase();
  });

  return (
    <div className="pedidos-container">
      <h1>Gestão de Pedidos</h1>

      {/* SELETOR DE FILTRO */}
      <div style={{marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center'}}>
        
        <button 
            onClick={() => setFiltro('Todos')}
            className="action-button"
            style={{
                backgroundColor: filtro === 'Todos' ? '#6c757d' : '#e2e6ea',
                color: filtro === 'Todos' ? 'white' : '#333',
                border: 'none', opacity: 1
            }}
        >
            Todos
        </button>

        <button 
            onClick={() => setFiltro('Pendente')}
            className="action-button"
            style={{
                backgroundColor: filtro === 'Pendente' ? '#ffc107' : '#fff3cd', // Amarelo/Laranja
                color: filtro === 'Pendente' ? '#212529' : '#856404',
                border: '1px solid #ffeeba', opacity: 1
            }}
        >
            Pendente 
        </button>

        <button 
            onClick={() => setFiltro('Atendido')}
            className="action-button"
            style={{
                backgroundColor: filtro === 'Atendido' ? '#28a745' : '#d4edda', // Verde
                color: filtro === 'Atendido' ? 'white' : '#155724',
                border: '1px solid #c3e6cb', opacity: 1
            }}
        >
            Atendido 
        </button>

      </div>

      <div className="pedidos-list">
        <div className="pedido-header">
          <span>ID</span>
          <span>Data</span>
          <span>Viatura</span>
          <span>Status</span>
        </div>
        {pedidosFiltrados.map((pedido) => (
          <Link to={`/pedidos/${pedido.ID_Pedido}`} className="pedido-item" key={pedido.ID_Pedido}>
            <span>#{pedido.ID_Pedido}</span>
            <span>{new Date(pedido.Data_Hora_Solicitacao).toLocaleDateString('pt-BR')}</span>
            <span>{pedido.Placa_Ambulancia}</span>
            <span className={`status status-${pedido.Status_Pedido.toLowerCase()}`}>{pedido.Status_Pedido}</span>
          </Link>
        ))}
        {pedidosFiltrados.length === 0 && <p style={{textAlign: 'center', padding: '20px'}}>Nenhum pedido encontrado.</p>}
      </div>
    </div>
  );
}

export default PedidosPage;