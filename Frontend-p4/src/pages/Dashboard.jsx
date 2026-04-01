/**
 * @file Dashboard.jsx
 * @description Componente de página que serve como o painel principal da aplicação.
 * Apresenta métricas de resumo (total de leads e clientes) e permite a navegação rápida
 * para as áreas de gestão respetivas através de cartões clicáveis.
 */

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Importamos o hook de navegação
import useLeadStore from "../store/useLeadStore.js";
import tokenStore from "../store/tokenStore.js";
import useClientStore from "../store/useClientStore.js";
import '../styles/Dashboard.css';

/**
 * Componente funcional que renderiza o painel de resumo do utilizador.
 * @component
 * @returns {JSX.Element} Estrutura visual do dashboard com estatísticas e alertas.
 */
export default function Dashboard(){
    /** @type {Function} Hook para realizar a navegação entre rotas. */
    const navigate = useNavigate();

    // --- ESTADOS DAS STORES ---
    /** @type {Object} Dados e funções da store de leads. */
    const { leads, fetchLeads } = useLeadStore();
    /** @type {Object} Dados e funções da store de clientes. */
    const { clients, fetchClient } = useClientStore();
    /** @type {string|null} Token de autenticação para as chamadas à API. */
    const token = tokenStore((state) => state.token);

    /** @type {Object} Objeto de localização para capturar estados passados por redirecionamento. */
    const location = useLocation();
    /** @type {string|undefined} Mensagem de erro (ex: acesso negado a admin) enviada via state. */
    const mensagemErro = location.state?.erro;

    /**
     * Efeito de carregamento inicial: Procura os dados de leads e clientes
     * assim que o token de autenticação estiver disponível.
     */
    useEffect(() => {
        if (token) {
            fetchLeads(token); // Carrega a lista de leads
            fetchClient(token); // Carrega a lista de clientes
        }
    }, [token, fetchLeads, fetchClient]);

    /** @type {number} Cálculo do total de leads no estado. */
    const totalLeads = leads.length;
    /** @type {number} Cálculo do total de clientes no estado, com proteção para valores nulos. */
    const totalClients = clients.length ? clients.length : 0;

    return (
        <div>
            {/* Exibe alertas de erro de navegação (ex: tentativa de acesso a rotas admin) */}
            {mensagemErro && (
                <div className="alert-error" style={{ color: 'red', padding: '10px', border: '1px solid red' }}>
                    {mensagemErro}
                </div>
            )}
            <div className="dashboard-container">
                <h2 className="dashboard-title">Painel de Resumo</h2>

                <div className="stats-grid">
                    {/* Cartão estatístico clicável que redireciona para a página de Leads */}
                    <div
                        className="stat-card clickable"
                        onClick={() => navigate('/leads')}
                    >
                        <h3>Total de leads</h3>
                        <p className="stat-number">{totalLeads}</p>
                    </div>

                    {/* Cartão estatístico clicável que redireciona para a página de Clientes */}
                    <div  className="stat-card clickable"
                          onClick={() => navigate('/client')}>
                        <h3>Total de clientes</h3>
                        <p className="stat-number">{totalClients}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}