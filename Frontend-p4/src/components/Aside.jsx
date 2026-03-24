import { Link } from 'react-router-dom';
import '../styles/AsideFooterHeader.css';

export default function Aside() {
    return (
            <nav className="sidebar">
                <Link to="/dashboard"><button>Dashboard</button></Link>
                <Link to="/leads"><button>Leads</button></Link>
                <Link to="/client"><button>Clientes</button></Link>
                <Link to="/admin"><button>Administração</button></Link>

            </nav>
    );
}