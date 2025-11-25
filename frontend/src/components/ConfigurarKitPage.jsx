import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../components/PedidosPage.css'; // Reutilizando estilos

function ConfigurarKitPage() {
  const { id_ambulancia } = useParams();
  const navigate = useNavigate();
  
  const [insumos, setInsumos] = useState([]);
  const [quantidades, setQuantidades] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Busca todos os insumos disponíveis no sistema
        const resInsumos = await fetch(`${import.meta.env.VITE_API_URL}/api/insumos`);
        const listaInsumos = await resInsumos.json();

        // 2. Busca a configuração ATUAL desta ambulância (se já tiver)
        const resConfig = await fetch(`${import.meta.env.VITE_API_URL}/api/ambulancias/${id_ambulancia}/itens`);
        const configAtual = await resConfig.json();

        // 3. Monta o mapa de quantidades
        const mapaQuantidades = {};
        
        // Primeiro zera tudo
        listaInsumos.forEach(item => {
            mapaQuantidades[item.ID_Insumo] = 0;
        });

        // Depois preenche com o que já está configurado no banco
        configAtual.forEach(item => {
            mapaQuantidades[item.ID_Insumo] = item.Quantidade_Minima;
        });

        setInsumos(listaInsumos);
        setQuantidades(mapaQuantidades);
      } catch (error) {
        alert("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id_ambulancia]);

  const handleChange = (idInsumo, valor) => {
    setQuantidades(prev => ({
        ...prev,
        [idInsumo]: parseInt(valor) || 0
    }));
  };

  const handleSalvar = async () => {
    // Transforma o objeto em lista para enviar
    const payload = Object.keys(quantidades).map(id => ({
        id_insumo: id,
        qtd: quantidades[id]
    }));

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ambulancias/${id_ambulancia}/itens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Kit da viatura atualizado com sucesso!");
            navigate('/admin/ambulancias');
        } else {
            alert("Erro ao salvar configuração.");
        }
    } catch (error) {
        alert("Erro de conexão.");
    }
  };

  if (loading) return <p style={{textAlign:'center', marginTop:'20px'}}>Carregando insumos...</p>;

  return (
    <div className="pedidos-container">
      <h1>Montar Kit da Viatura</h1>
      <p style={{textAlign:'center', color:'#666', marginBottom:'20px'}}>Defina a quantidade padrão de cada item para esta ambulância.</p>

      <div className="pedidos-list">
        <div className="pedido-header" style={{gridTemplateColumns: '3fr 1fr'}}>
            <span>Insumo</span>
            <span style={{textAlign:'center'}}>Qtd. Padrão</span>
        </div>

        {insumos.map(item => (
            <div className="pedido-item" key={item.ID_Insumo} style={{gridTemplateColumns: '3fr 1fr', alignItems:'center'}}>
                <div>
                    <span style={{fontWeight:'bold'}}>{item.Nome_Insumo}</span>
                    <br/>
                    <span style={{fontSize:'0.8rem', color:'#666'}}>{item.Unidade_Medida}</span>
                </div>
                
                <input 
                    type="number" 
                    min="0"
                    value={quantidades[item.ID_Insumo]}
                    onChange={(e) => handleChange(item.ID_Insumo, e.target.value)}
                    style={{
                        padding: '8px', 
                        textAlign: 'center', 
                        border: '1px solid #ccc', 
                        borderRadius: '4px',
                        width: '80px',
                        margin: '0 auto',
                        display: 'block',
                        backgroundColor: quantidades[item.ID_Insumo] > 0 ? '#e8f5e9' : '#fff' // Destaca se tiver qtd
                    }}
                />
            </div>
        ))}
      </div>

      <button onClick={handleSalvar} className="submit-button" style={{marginTop: '20px'}}>
        Salvar Configuração
      </button>
    </div>
  );
}

export default ConfigurarKitPage;