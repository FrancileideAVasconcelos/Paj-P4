import { useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import useAdminStore from '../store/AdminStore.js';
import tokenStore from '../store/tokenStore.js';
import '../styles/AsideFooterHeader.css'; // Mantém os globais se precisares
import '../styles/Admin.css'; // O teu novo ficheiro de estilos! (Ajusta o caminho se necessário)

export default function Admin() {
    const navigate = useNavigate();
    const token = tokenStore((state) => state.token);
    const { users, loading, error, fetchUsers, deleteUser, reactivateUser } = useAdminStore();

    useEffect(() => {
        if (token) fetchUsers(token);
        else navigate('/login');
    }, [token, fetchUsers, navigate]);

    const sortedUsers = useMemo(() => {
        if (!users || !Array.isArray(users)) return [];

        return [...users].sort((a, b) => {
            const nomeA = `${a.primeiroNome} ${a.ultimoNome}`.toLowerCase();
            const nomeB = `${b.primeiroNome} ${b.ultimoNome}`.toLowerCase();
            return nomeA.localeCompare(nomeB);
        });
    }, [users]);

    const handleInativar = async (e, username) => {
        e.stopPropagation();
        if(window.confirm(`Tem a certeza que deseja inativar o utilizador ${username}?`)) {
            await deleteUser(token, username, false);
        }
    };

    const handleReativar = async (e, username) => {
        e.stopPropagation();
        await reactivateUser(token, username);
    };

    const handleApagarPermanente = async (e, username) => {
        e.stopPropagation();
        if(window.confirm(`ATENÇÃO: Vai apagar o ${username} e todos os seus dados. Continuar?`)) {
            await deleteUser(token, username, true);
        }
    };

    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    return (
        <div className="main-content">
            <div className="admin-container">
                <h2 className="admin-title">Equipa e Utilizadores</h2>

                {error && <div className="alert-message alert-error">{error}</div>}

                {loading ? (
                    <p className="loading-text">A carregar utilizadores...</p>
                ) : (
                    <div className="users-list">
                        {sortedUsers.map((user) => (
                            <div
                                key={user.username}
                                className={`user-card ${user.ativo ? 'card-active' : 'card-inactive'}`}
                                onClick={() => navigate(`/admin/user/${user.username}`)}
                            >
                                {/* Esquerda: Foto e Info */}
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
                                            {user.admin && <span className="admin-badge">[Admin]</span>}
                                        </h3>
                                        <p>@{user.username} | {user.email}</p>
                                    </div>
                                </div>

                                {/* Direita: Estado e Botões de Ação */}
                                <div className="user-actions">
                                    <span className={`status-badge ${user.ativo ? 'badge-active' : 'badge-inactive'}`}>
                                        {user.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {sortedUsers.length === 0 && !loading && (
                            <p className="empty-list-text">Nenhum utilizador encontrado.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}