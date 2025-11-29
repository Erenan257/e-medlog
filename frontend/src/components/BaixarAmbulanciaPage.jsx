import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/PedidosPage.css'; 

function BaixarAmbulanciaPage() {
  const navigate = useNavigate();
  const [ambulancias, setAmbulancias] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    const fetchAmb = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ambulancias`);
        const data = await res.json();
        
        setAmbulancias(data.filter(a => a.Status_Operacional === 'Apto'));
    };
    fetchAmb();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!selectedId) return alert('Selecione a viatura');
    
    const amb = ambulancias.find(a => a.ID_Ambulancia == selectedId);

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ambulancias/${selectedId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                placa: amb.Placa, 
                tipo: amb.Tipo_Ambulancia, 
                status: 'Inapto', 
                motivo: motivo 
            })
        });
        if(response.ok) {
            alert('Viatura baixada com sucesso.');
            navigate('/dashboard');
        }
    } catch (err) { alert('Erro ao baixar'); }
  };

  return (
    <div className="pedidos-container">
        <h1>Reportar Problema / Baixar Viatura</h1>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <label>Selecione a Viatura:</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{padding: '10px'}}>
                <option value="">Selecione...</option>
                {ambulancias.map(a => <option key={a.ID_Ambulancia} value={a.ID_Ambulancia}>{a.Placa}</option>)}
            </select>

            <label>Motivo da Baixa (Obrigatório):</label>
            <textarea 
                value={motivo} 
                onChange={e => setMotivo(e.target.value)} 
                rows="4" 
                required
                placeholder="Ex: Pneu furado, falta de oxigênio, problema mecânico..."
                style={{padding: '10px', resize: 'vertical'}}
            />

            <button type="submit" className="submit-button" style={{backgroundColor: '#dc3545'}}>Confirmar Baixa</button>
        </form>
    </div>
  );
}

export default BaixarAmbulanciaPage;