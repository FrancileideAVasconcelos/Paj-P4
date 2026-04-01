import { Link } from 'react-router-dom';
import '../styles/AsideFooterHeader.css';

// 1. Recebemos a função 'fecharMenu' como propriedade
export default function Aside({ fecharMenu }) {
    return (
        <nav className="sidebar">
            {/* 2. Adicionamos o onClick a cada Link */}
            <Link to="/dashboard" onClick={fecharMenu}>
                <button className="nav-btn"><i className="fa-solid fa-chart-pie"></i> Dashboard</button>
            </Link>

            <Link to="/leads" onClick={fecharMenu}>
                <button className="nav-btn"><i className="fa-solid fa-bullseye"></i> Leads</button>
            </Link>

            <Link to="/client" onClick={fecharMenu}>
                <button className="nav-btn"><i className="fa-solid fa-users"></i> Clientes</button>
            </Link>

            <Link to="/admin" onClick={fecharMenu}>
                <button className="nav-btn"><i className="fa-solid fa-gear"></i> Administração</button>
            </Link>
        </nav>
    );
}