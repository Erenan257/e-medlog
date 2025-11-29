import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';


const IconAlert = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>);
const IconAmbulance = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>);
const IconChecklist = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const IconBox = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>);
const IconList = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>);
const IconAlertTriangle = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);

function DashboardPage({ usuario }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pedidosPendentes: 0, ambulanciasInaptas: [] });
  const [avisosPedidos, setAvisosPedidos] = useState([]);

  useEffect(() => {
    
    if (!usuario) return;

    
    if (usuario.Perfil === 'Gestor') {
      const fetchStats = async () => {
        try {
         
          const resPed = await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos/`);
          const dataPed = await resPed.json();
          const pendentes = dataPed.filter(p => p.Status_Pedido === 'Pendente').length;

          
          const resAmb = await fetch(`${import.meta.env.VITE_API_URL}/api/ambulancias`);
          const dataAmb = await resAmb.json();
          const inaptas = dataAmb.filter(a => a.Status_Operacional === 'Inapto');

          setStats({ pedidosPendentes: pendentes, ambulanciasInaptas: inaptas });
        } catch (err) { console.error("Erro Fetch Gestor:", err); }
      };
      fetchStats();
    } 
    
    
    else if (usuario.Perfil === 'Socorrista') {
        
       
        if (!usuario.ID_Usuario) {
            console.warn("Aviso: Usuário logado não tem ID_Usuario definido no objeto.", usuario);
            return;
        }

        const fetchAvisos = async () => {
            try {
                
                const url = `${import.meta.env.VITE_API_URL}/api/pedidos/meus-atendidos/${usuario.ID_Usuario}`;
                
                const res = await fetch(url);
                
                if (res.ok) {
                    const data = await res.json();
                   
                    if (Array.isArray(data)) {
                        setAvisosPedidos(data);
                    } else {
                        console.warn("API não retornou uma lista:", data);
                    }
                } else {
                    console.error(`Erro API Avisos: ${res.status} - ${res.statusText}`);
                }
            } catch (err) { 
                console.error("Erro Fetch Socorrista:", err); 
            }
        };
        fetchAvisos();
    }
  }, [usuario]);

  return (
    <div className="dashboard-container">
      
      {/* Cabeçalho de Boas-vindas */}
      <div className="dashboard-header-welcome" style={{marginBottom: '30px', marginTop: '10px'}}>
        <h2 style={{color: '#1c1e21'}}>Olá, {usuario ? usuario.Nome.split(' ')[0] : 'Visitante'}!</h2>
        <p style={{color: '#606770'}}>Perfil: {usuario ? usuario.Perfil : ''}</p>
      </div>

      {/* --- ÁREA DO SOCORRISTA --- */}
      {usuario && usuario.Perfil === 'Socorrista' && (
        <>
            {/* Banner de Avisos (Só aparece se tiver avisos) */}
            {avisosPedidos.length > 0 && (
                <div style={{
                    backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb',
                    padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left',
                    maxWidth: '600px', margin: '0 auto 0px auto'
                }}>
                    <strong style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                         Seus pedidos foram atendidos!
                    </strong>
                    <ul style={{margin: '10px 0 0 10px', padding: 0, fontSize: '0.9rem'}}>
                        {avisosPedidos.map(p => (
                            <li key={p.ID_Pedido}>
                                Pedido #{p.ID_Pedido} - {p.Placa} 
                                {p.Data_Hora_Solicitacao ? ` (${new Date(p.Data_Hora_Solicitacao).toLocaleDateString()})` : ''}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Botões de Ação */}
            <main className="dashboard-main">
                <button className="dashboard-button" onClick={() => navigate('/checklist')} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <IconChecklist /> Realizar Checklist
                </button>
                <button className="dashboard-button" onClick={() => navigate('/pedidos')} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <IconBox /> Meus Pedidos
                </button>
                <button className="dashboard-button" onClick={() => navigate('/inventario')} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <IconList /> Inventário Padrão
                </button>
                <button 
                    className="dashboard-button" 
                    onClick={() => navigate('/baixar-viatura')} 
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: '#dc3545', marginTop: '20px'
                    }}
                >
                    <IconAlertTriangle /> Baixar Viatura
                </button>
            </main>
        </>
      )}

      {/* --- ÁREA DO GESTOR --- */}
      {usuario && usuario.Perfil === 'Gestor' && (
        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center'}}>
            
            {/* Card de Pedidos */}
            <div className="card-info" 
                 style={{background: '#fff3cd', color: '#856404', padding: '20px', borderRadius: '8px', border: '1px solid #ffeeba', width: '250px', cursor: 'pointer'}}
                 onClick={() => navigate('/admin/pedidos')}
            >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px'}}>
                    <IconAlert /> 
                    <span style={{fontSize: '2rem', fontWeight: 'bold'}}>{stats.pedidosPendentes}</span>
                </div>
                <p style={{fontWeight: 'bold', margin: 0}}>Pedidos Pendentes</p>
            </div>

            {/* Card de Ambulâncias */}
            <div className="card-info" 
                 style={{background: '#f8d7da', color: '#721c24', padding: '20px', borderRadius: '8px', border: '1px solid #f5c6cb', width: '250px', cursor: 'pointer'}}
                 onClick={() => navigate('/admin/ambulancias')}
            >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px'}}>
                    <IconAmbulance />
                    <span style={{fontSize: '2rem', fontWeight: 'bold'}}>{stats.ambulanciasInaptas.length}</span>
                </div>
                <p style={{fontWeight: 'bold', margin: 0}}>Viaturas Inaptas</p>
                
                {stats.ambulanciasInaptas.length > 0 && (
                  <div style={{marginTop: '10px', fontSize: '0.9rem', textAlign: 'left', borderTop: '1px solid #f5c6cb', paddingTop: '10px'}}>
                    {stats.ambulanciasInaptas.map(amb => (
                        <div key={amb.ID_Ambulancia}>• {amb.Placa}</div>
                    ))}
                  </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;