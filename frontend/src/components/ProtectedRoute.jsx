import React from 'react';
import { Navigate } from 'react-router-dom';

// Este componente recebe:
// - children: A página que queremos proteger
// - usuario: O objeto do usuário logado
// - allowedRoles: Uma lista de perfis permitidos (ex: ['Gestor', 'Farmacia'])
function ProtectedRoute({ children, usuario, allowedRoles }) {
  
  // 1. Se não tiver usuário logado, manda pro Login
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // 2. Se tiver uma lista de perfis permitidos e o usuário NÃO estiver nela
  if (allowedRoles && !allowedRoles.includes(usuario.Perfil)) {
    // Manda ele para o Dashboard dele (ou página de erro)
    alert("Acesso negado: Você não tem permissão para acessar esta página.");
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Se passou nas checagens, mostra a página
  return children;
}

export default ProtectedRoute;