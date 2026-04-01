/**
 * @file AdminUserDetails.jsx
 * @description Componente de painel administrativo detalhado para a gestão de um utilizador específico.
 * Permite ao administrador visualizar e manipular Clientes e Leads de outros utilizadores,
 * gerir o estado da conta (ativar/inativar) e realizar exclusões permanentes.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAdminStore from '../store/useAdminStore.js';
import useUserStore from '../store/useUserStore.js';
import tokenStore from '../store/tokenStore.js';
import { STATUS_OPTIONS } from "../utils/constants.js";
import ListClientLeadAdmin from '../components/ListClientLeadAdmin.jsx';
import FormModal from "./formModal.jsx";
import useFormModal from "../hooks/useFormModal.js";

import '../styles/ClientLead.css';
import '../styles/Admin.css';

/**
 * Componente funcional que renderiza o painel de controlo total sobre um utilizador.
 * @component
 * @returns {JSX.Element} Interface administrativa com cartões de perfil, listas de dados e ações de gestão.
 */
export default function AdminUserDetails() {
    /** @type {string} Username extraído dos parâmetros da URL para identificar o utilizador a gerir. */
    const { username } = useParams();
    /** @type {Function} Hook de navegação para redirecionamentos (ex: após apagar conta). */
    const navigate = useNavigate();
    /** @type {string|null} Token de autenticação para autorizar operações administrativas. */
    const token = tokenStore((state) => state.token);
    /** @type {string} Estado local para o filtro de estado aplicado à lista de Leads. */
    const [filtro, setFiltro] = useState("");

    /** @type {Object|null} Dados do administrador atualmente logado para validação de segurança. */
    const currentUser = useUserStore((state) => state.currentUser);
    /** @type {boolean} Verifica se o perfil em visualização pertence ao próprio administrador logado. */
    const isMe = currentUser?.username === username;

    // --- ESTADOS E ACÇÕES DA STORE ADMINISTRATIVA ---
    const {
        users, userClients, userLeads, loadingDetails, fetchUserDetails, clearUserDetails, error,
        editClientAdmin, editLeadAdmin, deleteUser, reactivateUser, fetchUsers,
        toggleItemStatus, deleteItemPermanent, toggleAllItemsStatus, deleteAllItemsPermanent
    } = useAdminStore();

    /** @type {Object} Encontra o objeto do utilizador selecionado dentro da lista global de utilizadores. */
    const selectedUser = users.find(u => u.username === username) || {};

    /** * Hook de modal configurado especificamente para a edição de CLIENTES de terceiros.
     * @type {Object}
     */
    const clientModal = useFormModal(
        async () => {}, // Criação não é permitida diretamente pelo admin neste painel
        (t, id, data) => editClientAdmin(t, username, id, data),
        token
    );

    /** * Hook de modal configurado especificamente para a edição de LEADS de terceiros.
     * @type {Object}
     */
    const leadModal = useFormModal(
        async () => {},
        (t, id, data) => editLeadAdmin(t, username, id, data),
        token
    );

    /**
     * Efeito de Ciclo de Vida: Carrega os dados detalhados (Leads e Clientes) do utilizador.
     * Se a lista global de utilizadores estiver vazia (ex: refresh da página), recarrega-a primeiro.
     */
    useEffect(() => {
        if (token && username) {
            if (users.length === 0) fetchUsers(token);
            fetchUserDetails(token, username);
        } else if (!token) {
            navigate('/login');
        }
        // Limpa os dados de detalhes da store ao sair do componente para evitar "leaks" de UI
        return () => clearUserDetails();
    }, [token, username, fetchUserDetails, clearUserDetails, fetchUsers, navigate, users.length]);

    /** @type {string} Avatar padrão caso o utilizador não possua fotoUrl. */
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    /** * Elemento JSX de filtro (Select) para ser injetado no componente de lista de Leads.
     * @type {JSX.Element}
     */
    const filtroLeads = (
        <select className="filtro" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todos os Estados</option>
            {STATUS_OPTIONS && STATUS_OPTIONS.map((nome, idx) => (
                <option key={idx} value={idx}>{nome}</option>
            ))}
        </select>
    );

    /** @type {Array} Lista de leads filtrada com base na escolha do administrador. */
    const leadsFiltradas = filtro === ""
        ? userLeads
        : userLeads.filter(lead => String(lead.estado) === String(filtro));

    /**
     * Altera o estado 'ativo' de um Cliente ou Lead individual.
     * @async
     * @param {Object} item - O objeto do item a alterar.
     * @param {string} type - 'client' ou 'lead'.
     */
    const handleToggleActive = async (item, type) => {
        const acao = item.ativo ? 'inativar' : 'reativar';
        if (window.confirm(`Tem a certeza que deseja ${acao} este registo?`)) {
            await toggleItemStatus(token, username, type, item.id, item.ativo);
        }
    };

    /**
     * Remove permanentemente um registo (Cliente ou Lead) do sistema.
     * @async
     * @param {Object} item - O objeto do item a apagar.
     * @param {string} type - 'client' ou 'lead'.
     */
    const handleDelete = async (item, type) => {
        if (window.confirm(`ATENÇÃO: Vai apagar permanentemente este registo e perder os dados. Continuar?`)) {
            await deleteItemPermanent(token, username, type, item.id);
        }
    };

    /**
     * Altera o estado de TODOS os itens de um tipo (Clientes ou Leads) em lote.
     * @async
     * @param {string} type - 'client' ou 'lead'.
     * @param {boolean} inativar - Se deve inativar (true) ou reativar (false).
     */
    const handleToggleAll = async (type, inativar) => {
        const acao = inativar ? 'inativar' : 'reativar';
        const nomeTipo = type === 'client' ? 'todos os clientes' : 'todas as leads';
        if (window.confirm(`Tem a certeza que deseja ${acao} ${nomeTipo} do utilizador @${username}?`)) {
            await toggleAllItemsStatus(token, username, type, inativar);
        }
    };

    /**
     * Remove PERMANENTEMENTE todos os itens de um tipo pertencentes ao utilizador.
     * @async
     * @param {string} type - 'client' ou 'lead'.
     */
    const handleDeleteAll = async (type) => {
        const nomeTipo = type === 'client' ? 'TODOS os clientes' : 'TODAS as leads';
        if (window.confirm(`ATENÇÃO EXPLOSIVA 💣: Vai apagar permanentemente ${nomeTipo}. Continuar?`)) {
            await deleteAllItemsPermanent(token, username, type);
        }
    };

    /**
     * Inativa ou Reativa a conta do utilizador (Soft Delete/Reactivate).
     * @async
     */
    const handleToggleUserStatus = async () => {
        const acao = selectedUser.ativo ? 'inativar' : 'reativar';
        if (window.confirm(`Tem a certeza que deseja ${acao} a conta de @${username}?`)) {
            if (selectedUser.ativo) await deleteUser(token, username, false);
            else await reactivateUser(token, username);
        }
    };

    /**
     * Remove o utilizador e TODOS os seus dados permanentemente da base de dados.
     * Após o sucesso, redireciona para a lista geral de utilizadores.
     * @async
     */
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
                <button className="btn-back" onClick={() => navigate('/admin')} style={{ marginBottom: 0 }}>
                    <i className="fa-solid fa-arrow-left"></i> Voltar à Lista
                </button>
            </div>

            {/* Alerta de erro caso ocorra falha na API */}
            {error && <div className="alert-message alert-error">{error}</div>}

            {/* CARTÃO DE PERFIL DO UTILIZADOR */}
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

                {/* ACÇÕES DE CONTA: Proteção para não permitir que o admin se auto-inative */}
                <div className="profile-detail-actions">
                    {!isMe ? (
                        <>
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
                        </>
                    ) : (
                        <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic' }}>
                            Este é o seu perfil. Use a página de Perfil para edições pessoais.
                        </p>
                    )}
                </div>
            </div>

            {/* LISTAGENS DE DADOS (CLIENTES E LEADS) */}
            {loadingDetails ? (
                <p className="loading-text">A carregar dados...</p>
            ) : (
                <div className="data-cards-container">
                    {/* Lista de Clientes com ações administrativas unificadas */}
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

                    {/* Lista de Leads com suporte para filtro de estado */}
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

            {/* MODAIS DE EDIÇÃO */}
            <FormModal isOpen={clientModal.modalAberto} type="client" initialData={clientModal.itemEmEdicao} onClose={clientModal.fecharModal} onSave={clientModal.handleSalvar} />
            <FormModal isOpen={leadModal.modalAberto} type="lead" initialData={leadModal.itemEmEdicao} onClose={leadModal.fecharModal} onSave={leadModal.handleSalvar} />
        </div>
    );
}