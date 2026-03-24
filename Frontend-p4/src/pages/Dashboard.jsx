import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importamos o hook de navegação
import leadStore from "../store/LeadStore.js";
import tokenStore from "../store/tokenStore.js";
import clientStore from "../store/ClientStore.js";
import '../styles/Dashboard.css';

export default function Dashboard(){
    const navigate = useNavigate(); // Inicializamos a navegação
    const { leads, fetchLeads } = leadStore();
    const { clients, fetchClient } = clientStore();
    const token = tokenStore((state) => state.token);

    useEffect(() => {
        if (token) {
            fetchLeads(token);
            fetchClient(token);
        }
    }, [token, fetchLeads, fetchClient]);

    const totalLeads = leads.length;
    const totalClients = clients.length ? clients.length : 0;

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Painel de Resumo</h2>

            <div className="stats-grid">
                {/* Adicionamos a classe 'clickable' e o evento de clique */}
                <div
                    className="stat-card clickable"
                    onClick={() => navigate('/leads')}
                >
                    <h3>Total de leads</h3>
                    <p className="stat-number">{totalLeads}</p>
                </div>

                <div  className="stat-card clickable"
                      onClick={() => navigate('/client')}>
                    <h3>Total de clientes</h3>
                    <p className="stat-number">{totalClients}</p>
                </div>
            </div>
        </div>
    );
}