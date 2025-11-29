import React from 'react';
import { Navigate } from 'react-router-dom';


function ProtectedRoute({ children, usuario, allowedRoles }) {
  
 
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  
  if (allowedRoles && !allowedRoles.includes(usuario.Perfil)) {
    
    alert("Acesso negado: Você não tem permissão para acessar esta página.");
    return <Navigate to="/dashboard" replace />;
  }

  
  return children;
}

export default ProtectedRoute;