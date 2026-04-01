/**
 * @file Admin.jsx
 * @description Componente de página principal para a área de administração.
 * Responsável por listar todos os utilizadores do sistema, permitindo visualizar o seu estado (ativo/inativo),
 * cargos (admin) e navegar para a gestão detalhada de cada conta.
 */

import { useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import useAdminStore from '../store/useAdminStore.js';
import tokenStore from '../store/tokenStore.js';

import '../styles/ClientLead.css';
import '../styles/Admin.css';

/**
 * Componente funcional que renderiza o painel de gestão de utilizadores.
 * @component
 * @returns {JSX.Element} Lista de cartões de utilizadores com informações de perfil e estado.
 */
export default function Admin() {
    /** @type {Function} Hook para navegação programática para as rotas de detalhes de utilizador. */
    const navigate = useNavigate();

    /** @type {string|null} Token de autenticação para autorizar o acesso aos dados administrativos. */
    const token = tokenStore((state) => state.token);

    // --- ESTADOS DA STORE DE ADMINISTRAÇÃO ---
    /** @type {Object} Dados e funções de ação provenientes da useAdminStore. */
    const { users, loading, error, fetchUsers } = useAdminStore();

    /**
     * Efeito de carregamento: Procura a lista de utilizadores no servidor assim que o componente é montado.
     * Caso o token não exista, redireciona o utilizador para a página de login.
     */
    useEffect(() => {
        if (token) fetchUsers(token);
        else navigate('/login');
    }, [token, fetchUsers, navigate]);

    /**
     * Ordena a lista de utilizadores alfabeticamente pelo nome completo.
     * Utiliza useMemo para evitar reordenações desnecessárias durante re-renderizações que não alterem a lista base.
     * @type {Array<Object>} Lista de utilizadores ordenada.
     */
    const sortedUsers = useMemo(() => {
        if (!users || !Array.isArray(users)) return [];
        return [...users].sort((a, b) => {
            const nomeA = `${a.primeiroNome} ${a.ultimoNome}`.toLowerCase();
            const nomeB = `${b.primeiroNome} ${b.ultimoNome}`.toLowerCase();
            return nomeA.localeCompare(nomeB);
        });
    }, [users]);

    /** @type {string} URL da imagem de avatar padrão para utilizadores sem foto. */
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    return (
        <div className="admin-container">
            <h2 className="admin-title">Gestão de Utilizadores</h2>

            {/* Exibição de mensagens de erro globais da store */}
            {error && <div className="alert-message alert-error">{error}</div>}

            {/* Renderização condicional: Feedback de carregamento ou lista de cartões */}
            {loading ? (
                <p className="loading-text">A carregar utilizadores...</p>
            ) : (
                <div className="users-list">
                    {/* Mapeia os utilizadores ordenados para criar a interface de cartões */}
                    {sortedUsers.map((user) => (
                        <div
                            key={user.username}
                            className={`user-card ${user.ativo ? 'card-active' : 'card-inactive'}`}
                            onClick={() => navigate(`/admin/user/${user.username}`)}
                        >
                            <div className="user-info">
                                <img
                                    src={user.fotoUrl || defaultAvatar}
                                    alt={`Foto de ${user.primeiroNome}`}
                                    className="user-avatar"
                                    onError={(e) => { e.target.src = defaultAvatar; }}
                                />
                                <div className="user-details">
                                    <h3>
                                        {user.primeiroNome} {user.ultimoNome}
                                        {/* Exibição condicional do badge de administrador */}
                                        {user.admin && <span className="admin-badge"><i className="fa-solid fa-crown"></i> Admin</span>}
                                    </h3>
                                    <p>@{user.username} | {user.email}</p>
                                </div>
                            </div>

                            {/* Indicador visual de conta ativa ou inativa */}
                            <div className="user-actions">
                                <span className={`status-badge ${user.ativo ? 'badge-active' : 'badge-inactive'}`}>
                                    {user.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Mensagem de fallback para listas vazias */}
                    {sortedUsers.length === 0 && !loading && (
                        <p className="empty-list-text">Nenhum utilizador encontrado.</p>
                    )}
                </div>
            )}
        </div>
    );
}