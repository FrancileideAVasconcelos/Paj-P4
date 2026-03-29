import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAdminStore from '../store/useAdminStore.js';
import tokenStore from '../store/tokenStore.js';
import '../styles/AsideFooterHeader.css';
import '../styles/admin.css';
import { STATUS_OPTIONS } from "../utils/constants.js";
import ListClientLeadAdmin from '../components/ListClientLeadAdmin.jsx'; // <-- O teu novo componente!
import FormModal from "./formModal.jsx";
import useFormModal from "../hooks/useFormModal.js";

export default function AdminUserDetails() {
    const { username } = useParams();
    const navigate = useNavigate();
    const token = tokenStore((state) => state.token);
    const [filtro, setFiltro] = useState("");

    const {
        users, userClients, userLeads, loadingDetails, fetchUserDetails, clearUserDetails, error,
        editClientAdmin, editLeadAdmin, deleteUser, reactivateUser, fetchUsers,
        toggleItemStatus, deleteItemPermanent, toggleAllItemsStatus, deleteAllItemsPermanent
    } = useAdminStore();

    const selectedUser = users.find(u => u.username === username) || {};

    // Hook exclusivo para Clientes (passamos a função editClientAdmin)
    const clientModal = useFormModal(
        async () => {}, // Função vazia porque o admin não cria clientes aqui
        (t, id, data) => editClientAdmin(t, username, id, data), // Injetamos o username que o Java pede!
        token
    );

    // Hook exclusivo para Leads (passamos a função editLeadAdmin)
    const leadModal = useFormModal(
        async () => {}, // Função vazia porque o admin não cria leads aqui
        (t, id, data) => editLeadAdmin(t, username, id, data), // Injetamos o username que o Java pede!
        token
    );

    useEffect(() => {
        if (!token) return navigate('/login');

        // Se a lista estiver vazia (ex: F5 na página), vamos buscá-la primeiro!
        if (users.length === 0) fetchUsers(token);

        fetchUserDetails(token, username);
        return () => clearUserDetails();
    }, [token, username, fetchUserDetails, clearUserDetails, fetchUsers, navigate, users.length]);

    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    // O elemento de filtro (dropdown) que só vamos passar para a lista de Leads
    const filtroLeads = (
        <select className="filtro" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todos os Estados</option>
            {STATUS_OPTIONS && STATUS_OPTIONS.map((nome, idx) => (
                <option key={idx} value={idx}>{nome}</option>
            ))}
        </select>
    );

    const leadsFiltradas = filtro === ""
        ? userLeads
        : userLeads.filter(lead => String(lead.estado) === String(filtro));

    const handleToggleActive = async (item, type) => {
        const acao = item.ativo ? 'inativar' : 'reativar';
        if (window.confirm(`Tem a certeza que deseja ${acao} este registo?`)) {
            // Removido o IF para funcionar com clientes E leads!
            await toggleItemStatus(token, username, type, item.id, item.ativo);
        }
    };

    const handleDeleteUserPermanent = async () => {
        if (window.confirm(`ATENÇÃO: Vai apagar o utilizador @${username} e TODOS os seus clientes e leads permanentemente. Esta ação não pode ser desfeita. Continuar?`)) {
            const sucesso = await deleteUser(token, username, true); // True = Apaga tudo da BD (Hard Delete)
            if (sucesso) {
                alert("Utilizador apagado permanentemente!");
                navigate('/admin'); // Como a conta já não existe, voltamos à lista geral
            } else {
                alert("Ocorreu um erro ao apagar o utilizador.");
            }
        }
    };

    const handleDelete = async (item, type) => {
        if (window.confirm(`ATENÇÃO: Vai apagar permanentemente este registo e perder os dados. Continuar?`)) {
            // Removido o IF para funcionar com clientes E leads!
            await deleteItemPermanent(token, username, type, item.id);
        }
    };

    const handleToggleUserStatus = async () => {
        const acao = selectedUser.ativo ? 'inativar' : 'reativar';
        if (window.confirm(`Tem a certeza que deseja ${acao} a conta do utilizador @${username}?`)) {
            let sucesso;
            if (selectedUser.ativo) {
                sucesso = await deleteUser(token, username, false); // False = Apenas Inativa (Soft Delete)
            } else {
                sucesso = await reactivateUser(token, username);
            }

            if (sucesso) {
                alert(`Conta ${acao}da com sucesso!`);
            } else {
                alert(`Ocorreu um erro ao tentar ${acao} a conta.`);
            }
        }
    };

    const handleToggleAll = async (type, inativar) => {
        const acao = inativar ? 'inativar' : 'reativar';
        const nomeTipo = type === 'client' ? 'todos os clientes' : 'todas as leads';

        if (window.confirm(`Tem a certeza que deseja ${acao} ${nomeTipo} do utilizador @${username}?`)) {
            // Removido o IF para funcionar com clientes E leads!
            await toggleAllItemsStatus(token, username, type, inativar);
        }
    };

    const handleDeleteAll = async (type) => {
        const nomeTipo = type === 'client' ? 'TODOS os clientes' : 'TODAS as leads';
        if (window.confirm(`ATENÇÃO EXPLOSIVA 💣: Vai apagar permanentemente ${nomeTipo} do utilizador @${username}. Esta ação NÃO pode ser desfeita. Continuar?`)) {
            // Removido o IF para funcionar com clientes E leads!
            await deleteAllItemsPermanent(token, username, type);
        }
    };


    return (
        <div className="main-content">
            <div className="admin-container" style={{ maxWidth: '1100px' }}>

                <div className="details-header">
                    <h2>Painel de Administração</h2>
                    <button className="btn-voltar" onClick={() => navigate('/admin')}>
                        <i className="fa-solid fa-arrow-left"></i> Voltar à Lista
                    </button>
                </div>

                {error && <div className="alert-message alert-error">{error}</div>}

                {/* CARTÃO DE PERFIL */}
                <div className="profile-detail-card">
                    <div className="profile-detail-left">
                        <img src={selectedUser.fotoUrl || defaultAvatar} alt="Avatar" className="profile-detail-avatar" onError={(e) => { e.target.src = defaultAvatar; }} />
                        <div className="profile-detail-info">
                            <h3>{selectedUser.primeiroNome} {selectedUser.ultimoNome} {selectedUser.admin && <span title="Administrador"> 👑</span>}</h3>
                            <div className="profile-detail-contacts">
                                <span><strong>@</strong> {username}</span>
                                <span><strong>✉️</strong> {selectedUser.email || 'Sem email'}</span>
                                <span><strong>📞</strong> {selectedUser.telefone || 'Sem telefone'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="profile-detail-actions">
                        <button
                            className="btn-action-inativar"
                            onClick={handleToggleUserStatus}
                        >
                            <i className={`fa-solid ${selectedUser.ativo ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                            {selectedUser.ativo ? ' Inativar Conta' : ' Reativar Conta'}
                        </button>
                        <button
                            className="btn-action-excluir"
                            onClick={handleDeleteUserPermanent}
                        >
                            <i className="fa-solid fa-trash"></i> Excluir Conta
                        </button>

                    </div>
                </div>

                {/* ZONA DE CLIENTES E LEADS */}
                {loadingDetails ? (
                    <p className="loading-text">A carregar dados...</p>
                ) : (
                    <div className="data-cards-container">

                        {/* 1. Componente a agir como Lista de Clientes */}
                        <ListClientLeadAdmin
                            title="Clientes"
                            type="client"
                            data={userClients}
                            cardClass="clients-card"
                            onEdit={(item) => clientModal.abrirParaEditar(null, item)}
                            onToggleActive={(item) => handleToggleActive(item, 'client')}
                            onDelete={(item) => handleDelete(item, 'client')}
                            onReactivateAll={() => handleToggleAll('client', false)}
                            onInactivateAll={() => handleToggleAll('client', true)}
                            onDeleteAll={() => handleDeleteAll('client')}
                        />

                        {/* 2. Componente a agir como Lista de Leads */}
                        <ListClientLeadAdmin
                            title="Leads"
                            type="lead"
                            data={leadsFiltradas}
                            cardClass="leads-card"
                            filterElement={filtroLeads}
                            onEdit={(item) => leadModal.abrirParaEditar(null, item)}
                            onToggleActive={(item) => handleToggleActive(item, 'lead')}
                            onDelete={(item) => handleDelete(item, 'lead')}
                            onReactivateAll={() => handleToggleAll('lead', false)}
                            onInactivateAll={() => handleToggleAll('lead', true)}
                            onDeleteAll={() => handleDeleteAll('lead')}
                        />

                    </div>
                )}
            </div>

            <FormModal
                isOpen={clientModal.modalAberto}
                type="client"
                initialData={clientModal.itemEmEdicao}
                onClose={clientModal.fecharModal}
                onSave={clientModal.handleSalvar}
            />

            <FormModal
                isOpen={leadModal.modalAberto}
                type="lead"
                initialData={leadModal.itemEmEdicao}
                onClose={leadModal.fecharModal}
                onSave={leadModal.handleSalvar}
            />

        </div>
    );
}