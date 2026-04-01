import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAdminStore from '../store/useAdminStore.js';
import tokenStore from '../store/tokenStore.js';
import { STATUS_OPTIONS } from "../utils/constants.js";
import ListClientLeadAdmin from '../components/ListClientLeadAdmin.jsx';
import FormModal from "./formModal.jsx";
import useFormModal from "../hooks/useFormModal.js";

import '../styles/ClientLead.css';
import '../styles/Admin.css';

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

    const clientModal = useFormModal(
        async () => {},
        (t, id, data) => editClientAdmin(t, username, id, data),
        token
    );

    const leadModal = useFormModal(
        async () => {},
        (t, id, data) => editLeadAdmin(t, username, id, data),
        token
    );

    useEffect(() => {
        if (!token) return navigate('/login');
        if (users.length === 0) fetchUsers(token);

        fetchUserDetails(token, username);
        return () => clearUserDetails();
    }, [token, username, fetchUserDetails, clearUserDetails, fetchUsers, navigate, users.length]);

    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

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
            await toggleItemStatus(token, username, type, item.id, item.ativo);
        }
    };

    const handleDelete = async (item, type) => {
        if (window.confirm(`ATENÇÃO: Vai apagar permanentemente este registo e perder os dados. Continuar?`)) {
            await deleteItemPermanent(token, username, type, item.id);
        }
    };

    const handleToggleAll = async (type, inativar) => {
        const acao = inativar ? 'inativar' : 'reativar';
        const nomeTipo = type === 'client' ? 'todos os clientes' : 'todas as leads';
        if (window.confirm(`Tem a certeza que deseja ${acao} ${nomeTipo} do utilizador @${username}?`)) {
            await toggleAllItemsStatus(token, username, type, inativar);
        }
    };

    const handleDeleteAll = async (type) => {
        const nomeTipo = type === 'client' ? 'TODOS os clientes' : 'TODAS as leads';
        if (window.confirm(`ATENÇÃO EXPLOSIVA 💣: Vai apagar permanentemente ${nomeTipo}. Continuar?`)) {
            await deleteAllItemsPermanent(token, username, type);
        }
    };

    const handleToggleUserStatus = async () => {
        const acao = selectedUser.ativo ? 'inativar' : 'reativar';
        if (window.confirm(`Tem a certeza que deseja ${acao} a conta de @${username}?`)) {
            if (selectedUser.ativo) await deleteUser(token, username, false);
            else await reactivateUser(token, username);
        }
    };

    const handleDeleteUserPermanent = async () => {
        if (window.confirm(`ATENÇÃO EXPLOSIVA 💣: Vai apagar @${username} e TODOS os seus dados permanentemente. Continuar?`)) {
            const sucesso = await deleteUser(token, username, true);
            if (sucesso) {
                alert("Utilizador apagado permanentemente!");
                navigate('/admin');
            }
        }
    };

    return (
        <div className="admin-container" style={{ maxWidth: '1100px' }}>
            <div className="details-header">
                <h2>Painel do Utilizador</h2>
                {/* O novo botão unificado! */}
                <button className="btn-back" onClick={() => navigate('/admin')} style={{ marginBottom: 0 }}>
                    <i className="fa-solid fa-arrow-left"></i> Voltar à Lista
                </button>
            </div>

            {error && <div className="alert-message alert-error">{error}</div>}

            <div className="profile-detail-card">
                <div className="profile-detail-left">
                    <img src={selectedUser.fotoUrl || defaultAvatar} alt="Avatar" className="profile-detail-avatar" onError={(e) => { e.target.src = defaultAvatar; }} />
                    <div className="profile-detail-info">
                        <h3>{selectedUser.primeiroNome} {selectedUser.ultimoNome} {selectedUser.admin && <span style={{fontSize:'12px', color: '#3498db'}}><i className="fa-solid fa-crown"></i> Admin</span>}</h3>
                        <div className="profile-detail-contacts">
                            <span><strong>@</strong> {username}</span>
                            <span><strong>✉️</strong> {selectedUser.email || 'Sem email'}</span>
                            <span><strong>📞</strong> {selectedUser.telefone || 'Sem telefone'}</span>
                        </div>
                    </div>
                </div>
                <div className="profile-detail-actions">
                    {/* Reutilizamos o btn-save, mas com cores flexíveis */}
                    <button
                        className="btn-save"
                        style={{ backgroundColor: selectedUser.ativo ? '#f39c12' : '#27ae60', justifyContent: 'center' }}
                        onClick={handleToggleUserStatus}
                    >
                        <i className={`fa-solid ${selectedUser.ativo ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                        {selectedUser.ativo ? ' Inativar Conta' : ' Reativar Conta'}
                    </button>
                    <button
                        className="btn-save-red"
                        style={{ justifyContent: 'center' }}
                        onClick={handleDeleteUserPermanent}
                    >
                        <i className="fa-solid fa-trash"></i> Excluir Conta
                    </button>
                </div>
            </div>

            {loadingDetails ? (
                <p className="loading-text">A carregar dados...</p>
            ) : (
                <div className="data-cards-container">
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

            <FormModal isOpen={clientModal.modalAberto} type="client" initialData={clientModal.itemEmEdicao} onClose={clientModal.fecharModal} onSave={clientModal.handleSalvar} />
            <FormModal isOpen={leadModal.modalAberto} type="lead" initialData={leadModal.itemEmEdicao} onClose={leadModal.fecharModal} onSave={leadModal.handleSalvar} />
        </div>
    );
}