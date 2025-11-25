import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChecklistPage.css';

function ChecklistPage({ usuario }) {
  const [insumos, setInsumos] = useState([]);
  const [itemQuantities, setItemQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [ambulancias, setAmbulancias] = useState([]);
  const [selectedAmbulancia, setSelectedAmbulancia] = useState('');
  
  // 1. NOVO ESTADO DO TURNO
  const [turno, setTurno] = useState('Dia');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resInsumos = await fetch(`${import.meta.env.VITE_API_URL}/api/insumos`);
        const dataInsumos = await resInsumos.json();
        setInsumos(dataInsumos);

        const quantidadesIniciais = {};
        dataInsumos.forEach(item => {
          quantidadesIniciais[item.ID_Insumo] = item.Quantidade_Minima;
        });
        setItemQuantities(quantidadesIniciais); 

        const resAmbulancias = await fetch(`${import.meta.env.VITE_API_URL}/api/ambulancias`);
        if (resAmbulancias.ok) {
            const dataAmb = await resAmbulancias.json();
            setAmbulancias(dataAmb);
            if (dataAmb.length > 0) setSelectedAmbulancia(dataAmb[0].ID_Ambulancia);
        }

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuantityChange = (insumoId, quantidade) => {
    const novaQuantidade = Math.max(0, parseInt(quantidade, 10) || 0);
    setItemQuantities(prev => ({
      ...prev,
      [insumoId]: novaQuantidade
    }));
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedAmbulancia) { alert("Selecione uma ambulância!"); return; }

    let statusCalculado = 'Apto';
    let motivoCalculado = '';

    // 1. Verifica itens críticos (Lógica Automática)
    const itensCriticosFaltantes = insumos.filter(item => {
        const qtdAtual = itemQuantities[item.ID_Insumo] || 0;
        // Se é critico (1) e está abaixo do mínimo
        return item.Critico && qtdAtual < item.Quantidade_Minima;
    });

    if (itensCriticosFaltantes.length > 0) {
        statusCalculado = 'Inapto';
        const nomes = itensCriticosFaltantes.map(i => i.Nome_Insumo).join(', ');
        motivoCalculado = `Automático: Baixa por falta de itens críticos (${nomes}).`;
        alert(`ATENÇÃO: Esta viatura ficará INAPTA devido à falta de: ${nomes}`);
    }

    const itensArray = insumos.map(insumo => ({
      id_insumo: insumo.ID_Insumo,
      quantidade: itemQuantities[insumo.ID_Insumo]
    }));

    // OBJETO CORRIGIDO (Sem duplicatas embaixo)
    const checklistPayload = {
      id_ambulancia: selectedAmbulancia, 
      id_socorrista: usuario ? usuario.ID_Usuario : 1, 
      turno: turno,
      itens: itensArray,
      // Enviamos o status calculado para o backend atualizar a viatura
      status_ambulancia: statusCalculado,
      motivo_ambulancia: motivoCalculado
    }; 

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checklistPayload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Checklist enviado com sucesso!');
        navigate('/pedidos'); 
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      alert('Erro de conexão.');
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="checklist-container">
      <form className="checklist-form" onSubmit={handleSubmit}>
        <h1>Realizar Checklist</h1>

        <div className="input-group" style={{marginBottom: '15px'}}>
            <label>Viatura:</label>
            <select 
                value={selectedAmbulancia} 
                onChange={(e) => setSelectedAmbulancia(e.target.value)}
                style={{padding: '10px', width: '100%', fontSize: '1rem'}}
            >
                <option value="">Selecione a Ambulância...</option>
                {ambulancias.map(amb => (
                    <option key={amb.ID_Ambulancia} value={amb.ID_Ambulancia}>
                        {amb.Placa} - {amb.Tipo_Ambulancia}
                    </option>
                ))}
            </select>
        </div>

        {/* 3. NOVO SELETOR VISUAL */}
        <div className="input-group" style={{marginBottom: '20px'}}>
            <label>Turno:</label>
            <select 
                value={turno} 
                onChange={(e) => setTurno(e.target.value)}
                style={{padding: '10px', width: '100%', fontSize: '1rem'}}
            >
                <option value="Dia"> Plantão Diurno</option>
                <option value="Noite"> Plantão Noturno</option>
            </select>
        </div>

        <div className="checklist-header">
          <span>Insumo (Mínimo)</span>
          <span>Qtd. Atual</span>
        </div>

        {insumos.map((insumo) => (
          <div className="checklist-item" key={insumo.ID_Insumo}>
            <span className="item-name">
                {insumo.Nome_Insumo} 
                <span style={{fontSize: '0.8rem', color: '#666', marginLeft: '5px'}}>
                    (Mín: {insumo.Quantidade_Minima})
                </span>
            </span>
            <div className="item-actions">
              <input
                type="number"
                className="quantity-input"
                min="0"
                value={itemQuantities[insumo.ID_Insumo]}
                onChange={(e) => handleQuantityChange(insumo.ID_Insumo, e.target.value)}
              />
            </div>
          </div>
        ))}

        <button type="submit" className="submit-button">Finalizar e Enviar</button>
      </form>
    </div>
  );
}

export default ChecklistPage;