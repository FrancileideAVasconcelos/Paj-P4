import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Leads from './pages/Leads.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Client from './pages/Client.jsx';
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";
import AdminUserDetails from "./components/AdminUserDetails.jsx";
import LeadDetails from "./components/LeadDetails.jsx";
import ClientDetails from "./components/ClientDetails.jsx";


export default function AppRoutes({ token }) {
    return (
        <Routes>
            {/* Rotas de Autenticação */}
            <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!token ? <Register /> : <Navigate to="/login" />} />

            {/* Rotas Protegidas (Só acessíveis com token) */}
            <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />

            <Route path="/leads" element={token ? <Leads /> : <Navigate to="/login" />} />
            <Route path="/leads/:id" element={token ? <LeadDetails /> : <Navigate to="/login" />} />

            {/* 2. Adiciona a rota para o URL que está no teu browser (/client) */}
            <Route path="/client" element={token ? <Client /> : <Navigate to="/login" />} />
            <Route path="/clients/:id" element={token ? <ClientDetails /> : <Navigate to="/login" />} />

            <Route path="/admin" element={token ? <Admin /> : <Navigate to="/login" />} />

            <Route path="/admin/user/:username" element={token ? <AdminUserDetails /> : <Navigate to="/login" />} />


            {/* Redirecionamento Inicial */}
            <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />





            {/* 3. Lógica inteligente para o 404:
               Se não houver token, manda para o login. Se houver, mostra o erro. */}
            <Route path="*" element={!token ? <Navigate to="/login" /> : <h2>404 - Página não encontrada</h2>} />
        </Routes>
    );
}