import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PedidosPage.css'; 

function AdminMenu({ usuario }) {
  const location = useLocation();

  if (!usuario) return null;

  const isGestor = usuario.Perfil === 'Gestor';
  const isFarmacia = usuario.Perfil === 'Farmacia' || usuario.Perfil === 'Gestor';

  // Socorrista não vê esse menu
  if (usuario.Perfil === 'Socorrista') return null;

  return (
    <div className="admin-nav" style={{ 
      position: 'fixed', 
      top: '60px', 
      left: 0, 
      width: '100%', 
      backgroundColor: '#f8f9fa', 
      zIndex: 999,
      padding: '10px 20px',
      borderBottom: '1px solid #ddd',
      boxSizing: 'border-box',
      
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      overflowX: 'auto'
    }}>
      
      {/* --- ALTERAÇÃO AQUI: Só mostra Início se for GESTOR --- */}
      {isGestor && (
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active-link' : ''}>
          Início
        </Link>
      )}

      {/* Todos (Gestor e Farmácia) veem Pedidos */}
      <Link to="/admin/pedidos" className={location.pathname.includes('/admin/pedidos') ? 'active-link' : ''}>
        Pedidos
      </Link>

      {/* Apenas Gestor vê Usuários */}
      {isGestor && (
        <Link to="/admin/usuarios" className={location.pathname.includes('/admin/usuarios') ? 'active-link' : ''}>
          Usuários
        </Link>
      )}

      {/* Gestor e Farmácia veem Insumos */}
      {isFarmacia && (
        <Link to="/admin/insumos" className={location.pathname.includes('/admin/insumos') ? 'active-link' : ''}>
          Insumos
        </Link>
      )}

      {/* Apenas Gestor vê Ambulâncias */}
      {isGestor && (
        <Link to="/admin/ambulancias" className={location.pathname.includes('/admin/ambulancias') ? 'active-link' : ''}>
          Ambulâncias
        </Link>
      )}

      {/* Botão Novo Checklist (Só Gestor) */}
      {isGestor && (
        <Link to="/checklist" className={location.pathname.includes('/checklist') ? 'active-link' : ''}>
          Novo Checklist
        </Link>
      )}
    </div>
  );
}

export default AdminMenu;