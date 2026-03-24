import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAdminStore from '../store/AdminStore.js';
import tokenStore from '../store/tokenStore.js';
import '../styles/AsideFooterHeader.css'; // Estilos globais
import '../styles/admin.css'; // O teu CSS do admin

export default function AdminUserDetails() {
    const { username } = useParams(); // Apanha o username que está no URL
    const navigate = useNavigate();
    const token = tokenStore((state) => state.token);

    const {
        userClients,
        userLeads,
        loadingDetails,
        fetchUserDetails,
        clearUserDetails,
        error
    } = useAdminStore();

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // Vai buscar os dados mal a página abre
        fetchUserDetails(token, username);

        // Limpa a store quando o utilizador sai da página (cleanup function)
        return () => clearUserDetails();
    }, [token, username, fetchUserDetails, clearUserDetails, navigate]);

    return (
        <div className="main-content">
            <div className="admin-container" style={{ maxWidth: '1000px' }}>

                {/* Cabeçalho e Botão de Voltar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 className="admin-title">Detalhes do Utilizador</h2>
                        <p className="admin-subtitle">A visualizar dados de: <strong>@{username}</strong></p>
                    </div>
                    <button
                        onClick={() => navigate('/admin')}
                        style={{ padding: '8px 16px', backgroundColor: '#7f8c8d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        &larr; Voltar à Lista
                    </button>
                </div>

                {error && <div className="alert-message alert-error">{error}</div>}

                {loadingDetails ? (
                    <p className="loading-text">A carregar clientes e leads de {username}...</p>
                ) : (
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

                        {/* COLUNA DOS CLIENTES */}
                        <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #ddd' }}>
                            <h3 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px', color: '#2c3e50' }}>
                                Clientes ({userClients.length})
                            </h3>
                            {userClients.length === 0 ? (
                                <p style={{ color: '#999', fontStyle: 'italic', marginTop: '10px' }}>Este utilizador não tem clientes.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
                                    {userClients.map(client => (
                                        <li key={client.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                            <strong>{client.nome}</strong> <br/>
                                            <span style={{ fontSize: '13px', color: '#666' }}>{client.email || 'Sem email'}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* COLUNA DAS LEADS */}
                        <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #ddd' }}>
                            <h3 style={{ borderBottom: '2px solid #e67e22', paddingBottom: '10px', color: '#2c3e50' }}>
                                Leads ({userLeads.length})
                            </h3>
                            {userLeads.length === 0 ? (
                                <p style={{ color: '#999', fontStyle: 'italic', marginTop: '10px' }}>Este utilizador não tem leads.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
                                    {userLeads.map(lead => (
                                        <li key={lead.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                            <strong>{lead.nome}</strong> <br/>
                                            <span style={{ fontSize: '13px', color: '#666' }}>Estado: {lead.estado || 'N/A'}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}