import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import ChecklistPage from './components/ChecklistPage';
import PedidosPage from './components/PedidosPage';
import AdminUsuariosPage from './components/AdminUsuariosPage';
import PedidoDetailPage from './components/PedidoDetailPage';
import UsuarioFormPage from './components/UsuarioFormPage';
import AdminInsumosPage from './components/AdminInsumosPage';
import InsumoFormPage from './components/InsumoFormPage';
import InventarioPage from './components/InventarioPage';
import AdminAmbulanciasPage from './components/AdminAmbulanciasPage';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AdminMenu from './components/AdminMenu';
import ChangePasswordPage from './components/ChangePasswordPage';
import BaixarAmbulanciaPage from './components/BaixarAmbulanciaPage';
import ConfigurarKitPage from './components/ConfigurarKitPage'; 
import './App.css';

function AppRoutes() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const navigate = useNavigate();

  const handleLoginSuccess = (dadosUsuario) => {
    setUsuarioLogado(dadosUsuario);
    
    // Lógica de Redirecionamento Ajustada
    if (dadosUsuario.Perfil === 'Farmacia') {
      navigate('/admin/pedidos'); // Farmácia vai direto para o trabalho dela
    } else {
      // Socorrista E Gestor vão para o Dashboard (cada um vê o seu)
      navigate('/dashboard'); 
    }
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    navigate('/');
  };

  // O Layout que desenha o Header
  const Layout = ({ children, titulo }) => {
    // Verifica se deve mostrar o menu extra (só se não for socorrista)
    const showAdminMenu = usuarioLogado && usuarioLogado.Perfil !== 'Socorrista';
    
    // Se tiver o menu extra, precisamos de mais espaço no topo
    const paddingTop = showAdminMenu ? '140px' : '100px'; 

    return (
      <>
        <Header titulo={titulo} onLogout={handleLogout} />
        
        {/* O Menu Inteligente entra aqui */}
        <AdminMenu usuario={usuarioLogado} />

        <div className="app-content" style={{ paddingTop: paddingTop }}>
          {children}
        </div>
      </>
    );
  };

  return (
    <Routes>
      {/* ROTA DE LOGIN (Ajustada para persistência) */}
      <Route 
        path="/" 
        element={
          !usuarioLogado ? (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          ) : (
            // Lógica de Redirecionamento Automático (Se já estiver logado):
            // Se for Farmácia -> Pedidos. Se for Gestor ou Socorrista -> Dashboard.
            usuarioLogado.Perfil === 'Farmacia' ? <Navigate to="/admin/pedidos" /> : <Navigate to="/dashboard" />
          )
        } 
      />
      
      {/* ROTAS PROTEGIDAS (Com Header via Layout) */}
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute usuario={usuarioLogado} allowedRoles={['Socorrista', 'Gestor']}>
            <Layout titulo="Dashboard">
              <DashboardPage usuario={usuarioLogado} />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* ... Fazer o mesmo para /pedidos e /inventario se desejar ... */}

      <Route 
        path="/checklist" 
        element={
          <ProtectedRoute usuario={usuarioLogado} allowedRoles={['Socorrista', 'Gestor']}>
            <Layout titulo="Realizar Checklist">
              <ChecklistPage usuario={usuarioLogado} />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/pedidos" 
        element={usuarioLogado ? (
          <Layout titulo="Meus Pedidos">
            <PedidosPage />
          </Layout>
        ) : <Navigate to="/" />} 
      />

      <Route 
        path="/pedidos/:id_pedido" 
        element={usuarioLogado ? (
          <Layout titulo="Detalhes do Pedido">
            <PedidoDetailPage usuario={usuarioLogado} />
          </Layout>
        ) : <Navigate to="/" />} 
      />

      <Route 
        path="/admin/pedidos" 
        element={
          <ProtectedRoute usuario={usuarioLogado} allowedRoles={['Gestor', 'Farmacia']}>
            <Layout titulo="Gestão de Pedidos">
              <PedidosPage />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/usuarios" 
        element={
          <ProtectedRoute usuario={usuarioLogado} allowedRoles={['Gestor']}>
            <Layout titulo="Gestão de Usuários">
              <AdminUsuariosPage />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/usuarios/novo" 
        element={
          <ProtectedRoute usuario={usuarioLogado} allowedRoles={['Gestor']}>
            <Layout titulo="Novo Usuário">
              <UsuarioFormPage />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/usuarios/:id_usuario" 
        element={
          <ProtectedRoute usuario={usuarioLogado} allowedRoles={['Gestor']}>
            <Layout titulo="Editar Usuário">
              <UsuarioFormPage />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/insumos" 
        element={
          <ProtectedRoute usuario={usuarioLogado} allowedRoles={['Gestor', 'Farmacia']}>
            <Layout titulo="Gestão de Insumos">
              <AdminInsumosPage />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/insumos/novo" 
        element={
          <ProtectedRoute usuario={usuarioLogado} allowedRoles={['Gestor', 'Farmacia']}>
            <Layout titulo="Novo Insumo">
              <InsumoFormPage />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/insumos/:id_insumo" 
        element={
          <ProtectedRoute usuario={usuarioLogado} allowedRoles={['Gestor', 'Farmacia']}>
            <Layout titulo="Editar Insumo">
              <InsumoFormPage />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/inventario" 
        element={usuarioLogado ? (
          <Layout titulo="Inventário Padrão">
            <InventarioPage />
          </Layout>
        ) : <Navigate to="/" />} 
      />

      <Route 
        path="/admin/ambulancias" 
        element={
          <ProtectedRoute usuario={usuarioLogado} allowedRoles={['Gestor']}>
            <Layout titulo="Gestão de Viaturas 1 ">
              <AdminAmbulanciasPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/alterar-senha" 
        element={
          usuarioLogado ? (
            <Layout titulo="Segurança">
              <ChangePasswordPage usuario={usuarioLogado} />
            </Layout>
          ) : <Navigate to="/" />
        } 
      />
      <Route 
        path="/baixar-viatura" 
        element={
          <ProtectedRoute usuario={usuarioLogado} allowedRoles={['Socorrista', 'Gestor']}>
            <Layout titulo="Reportar Problema">
              <BaixarAmbulanciaPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/ambulancias/:id_ambulancia/configurar" 
        element={
          <ProtectedRoute usuario={usuarioLogado} allowedRoles={['Gestor']}>
            <Layout titulo="Configurar Viatura">
              <ConfigurarKitPage />
            </Layout>
          </ProtectedRoute>
        } 
      />

    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;