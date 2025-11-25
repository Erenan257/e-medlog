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
  
  const [turno, setTurno] = useState('Dia');

  const navigate = useNavigate();

  // 1. Carregar Ambulâncias (Ao abrir a tela)
  useEffect(() => {
    const fetchAmbulancias = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ambulancias`);
        if (res.ok) {
            const data = await res.json();
            // Filtra apenas as ambulâncias APTAS para fazer checklist
            const aptas = data.filter(a => a.Status_Operacional === 'Apto');
            setAmbulancias(aptas);
            
            // Se tiver alguma, seleciona a primeira automaticamente
            if (aptas.length > 0) {
                setSelectedAmbulancia(aptas[0].ID_Ambulancia);
            } else {
                setLoading(false); // Se não tiver nenhuma apta, para o loading
                setError("Nenhuma ambulância apta disponível.");
            }
        }
      } catch (error) {
        setError("Erro ao carregar viaturas.");
        setLoading(false);
      }
    };
    fetchAmbulancias();
  }, []);

  // 2. Carregar o KIT ESPECÍFICO quando a ambulância mudar
  useEffect(() => {
    if (!selectedAmbulancia) return;

    const fetchKit = async () => {
      setLoading(true);
      try {
        // --- AQUI É A MUDANÇA: Busca itens DA VIATURA, não os gerais ---
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ambulancias/${selectedAmbulancia}/itens`);
        const data = await res.json();
        
        setInsumos(data);

        // Pré-preenche com a quantidade mínima (Padrão)
        const quantidadesIniciais = {};
        data.forEach(item => {
          quantidadesIniciais[item.ID_Insumo] = item.Quantidade_Minima; // A API já retorna o padrão configurado como 'Quantidade_Minima'
        });
        setItemQuantities(quantidadesIniciais);

      } catch (error) {
        console.error(error);
        setError("Erro ao carregar kit da viatura.");
      } finally {
        setLoading(false);
      }
    };

    fetchKit();
  }, [selectedAmbulancia]); // Roda sempre que mudar a seleção

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

    // Verifica itens críticos
    const itensCriticosFaltantes = insumos.filter(item => {
        const qtdAtual = itemQuantities[item.ID_Insumo] || 0;
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

    const checklistPayload = {
      id_ambulancia: selectedAmbulancia, 
      id_socorrista: usuario ? usuario.ID_Usuario : 1, 
      turno: turno,
      itens: itensArray,
      status_ambulancia: statusCalculado,
      motivo_ambulancia: motivoCalculado
    }; 

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checklistPayload)
      });
      
      if (response.ok) {
        alert('Checklist enviado com sucesso!');
        navigate('/pedidos'); 
      } else {
        const data = await response.json();
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      alert('Erro de conexão.');
    }
  };

  if (loading && !insumos.length && !error) return <p className="loading-text">Carregando checklist...</p>;
  if (error) return <p className="error-text">{error}</p>;

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
                {ambulancias.map(amb => (
                    <option key={amb.ID_Ambulancia} value={amb.ID_Ambulancia}>
                        {amb.Placa} - {amb.Tipo_Ambulancia}
                    </option>
                ))}
                {ambulancias.length === 0 && <option>Nenhuma viatura apta</option>}
            </select>
        </div>

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

        {insumos.length === 0 ? (
            <p style={{textAlign: 'center', color: '#666'}}>Nenhum item configurado para esta viatura. Contate o Gestor.</p>
        ) : (
            <>
                <div className="checklist-header">
                <span>Insumo (Padrão)</span>
                <span>Qtd. Atual</span>
                </div>

                {insumos.map((insumo) => (
                <div className="checklist-item" key={insumo.ID_Insumo}>
                    <span className="item-name">
                        {insumo.Nome_Insumo} 
                        <span style={{fontSize: '0.8rem', color: '#666', marginLeft: '5px'}}>
                            (Min: {insumo.Quantidade_Minima})
                        </span>
                        {!!insumo.Critico && <span style={{color:'red', marginLeft:'5px', fontSize:'0.7rem'}}>*Crítico</span>}
                    </span>
                    <div className="item-actions">
                    <input
                        type="number"
                        className="quantity-input"
                        min="0"
                        value={itemQuantities[insumo.ID_Insumo]}
                        onChange={(e) => handleQuantityChange(insumo.ID_Insumo, e.target.value)}
                        style={{
                            // Destaca visualmente se estiver abaixo do mínimo
                            borderColor: (itemQuantities[insumo.ID_Insumo] < insumo.Quantidade_Minima) ? 'red' : '#ccc',
                            backgroundColor: (itemQuantities[insumo.ID_Insumo] < insumo.Quantidade_Minima) ? '#fff5f5' : '#fff'
                        }}
                    />
                    </div>
                </div>
                ))}

                <button type="submit" className="submit-button">Finalizar e Enviar</button>
            </>
        )}
      </form>
    </div>
  );
}

export default ChecklistPage;