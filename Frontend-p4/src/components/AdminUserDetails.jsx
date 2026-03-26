import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAdminStore from '../store/useAdminStore.js';
import tokenStore from '../store/tokenStore.js';
import '../styles/AsideFooterHeader.css';
import '../styles/admin.css';
import { STATUS_OPTIONS } from "../utils/constants.js";
import ListClientLeadAdmin from '../components/ListClientLeadAdmin.jsx'; // <-- O teu novo componente!
import FormModal from "./formModal.jsx";

export default function AdminUserDetails() {
    const { username } = useParams();
    const navigate = useNavigate();
    const token = tokenStore((state) => state.token);
    const [filtro, setFiltro] = useState("");

    // --- ESTADOS DO MODAL DE EDIÇÃO ---
    const [modalAberto, setModalAberto] = useState(false);
    const [itemEmEdicao, setItemEmEdicao] = useState(null); // Guarda os dados a ser editados
    const [itemOriginal, setItemOriginal] = useState(null); // <-- ADICIONA ESTE NOVO!
    const [tipoEdicao, setTipoEdicao] = useState(""); // Vai ser 'client' ou 'lead'

    const {
        users, userClients, userLeads, loadingDetails, fetchUserDetails, clearUserDetails, error,
        toggleClientStatus, deleteClientPermanent, toggleLeadStatus, deleteLeadPermanent,
        editClientAdmin, editLeadAdmin
        } = useAdminStore();

    const selectedUser = users.find(u => u.username === username) || {};

    useEffect(() => {
        if (!token) return navigate('/login');
        fetchUserDetails(token, username);
        return () => clearUserDetails();
    }, [token, username, fetchUserDetails, clearUserDetails, navigate]);

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

    const handleEdit = (item, type) => {
        setItemEmEdicao({ ...item });
        setItemOriginal({ ...item }); // <-- GUARDA A CÓPIA INTACTA AQUI!
        setTipoEdicao(type);
        setModalAberto(true);
    };

    // Função a colocar no AdminUserDetails.jsx e passar como onSave={handleSalvarEdicao}
    const handleSalvarEdicao = async (itemEditado) => {
        let sucesso = false;
        if (tipoEdicao === 'client') {
            sucesso = await editClientAdmin(token, username, itemEditado.id, itemEditado);
        } else {
            sucesso = await editLeadAdmin(token, username, itemEditado.id, itemEditado);
        }

        if (sucesso) {
            setModalAberto(false);
        } else {
            alert("Ocorreu um erro ao guardar as alterações.");
        }
    };

    const handleToggleActive = async (item, type) => {
        const acao = item.ativo ? 'inativar' : 'reativar';
        if (window.confirm(`Tem a certeza que deseja ${acao} este registo?`)) {
            if (type === 'client') await toggleClientStatus(token, username, item.id, item.ativo);
            else await toggleLeadStatus(token, username, item.id, item.ativo);
        }
    };

    const handleDelete = async (item, type) => {
        if (window.confirm(`ATENÇÃO: Vai apagar permanentemente este registo e perder os dados. Continuar?`)) {
            if (type === 'client') await deleteClientPermanent(token, username, item.id);
            else await deleteLeadPermanent(token, username, item.id);
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
                        <button className="btn-action-inativar"><i className="fa-solid fa-user-slash"></i> Inativar Conta</button>
                        <button className="btn-action-excluir"><i className="fa-solid fa-trash"></i> Excluir Conta</button>
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
                            onEdit={(item) => handleEdit(item, 'client')}
                            onToggleActive={(item) => handleToggleActive(item, 'client')}
                            onDelete={(item) => handleDelete(item, 'client')}
                        />

                        {/* 2. Componente a agir como Lista de Leads */}
                        <ListClientLeadAdmin
                            title="Leads"
                            type="lead"
                            data={leadsFiltradas}
                            cardClass="leads-card"
                            filterElement={filtroLeads}
                            onEdit={(item) => handleEdit(item, 'lead')}
                            onToggleActive={(item) => handleToggleActive(item, 'lead')}
                            onDelete={(item) => handleDelete(item, 'lead')}
                        />

                    </div>
                )}
            </div>

            <FormModal
                isOpen={modalAberto}
                type={tipoEdicao}
                initialData={itemEmEdicao}
                onClose={() => setModalAberto(false)}
                onSave={handleSalvarEdicao}
            />
        </div>
    );
}