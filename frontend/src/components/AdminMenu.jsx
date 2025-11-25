import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PedidosPage.css'; 

function AdminMenu({ usuario }) {
  const location = useLocation();

  if (!usuario) return null;

  const isGestor = usuario.Perfil === 'Gestor';
  const isFarmacia = usuario.Perfil === 'Farmacia' || usuario.Perfil === 'Gestor';

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
      justifyContent: 'center', // <--- ADICIONE ESTA LINHA AQUI!
      gap: '15px',
      overflowX: 'auto'
    }}>
      
      {/* ... (seus Links continuam aqui igualzinho) ... */}

      <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active-link' : ''}>
        Início
      </Link>
      
      <Link to="/admin/pedidos" className={location.pathname.includes('/admin/pedidos') ? 'active-link' : ''}>
        Pedidos
      </Link>

      {isGestor && (
        <Link to="/admin/usuarios" className={location.pathname.includes('/admin/usuarios') ? 'active-link' : ''}>
          Usuários
        </Link>
      )}

      {isFarmacia && (
        <Link to="/admin/insumos" className={location.pathname.includes('/admin/insumos') ? 'active-link' : ''}>
          Insumos
        </Link>
      )}

      {isGestor && (
        <Link to="/admin/ambulancias" className={location.pathname.includes('/admin/ambulancias') ? 'active-link' : ''}>
          Ambulâncias
        </Link>
      )}
      {isGestor && (
        <Link to="/checklist" className={location.pathname.includes('/checklist') ? 'active-link' : ''}>
          Novo Checklist
        </Link>
      )}
    </div>
  );
}

export default AdminMenu;