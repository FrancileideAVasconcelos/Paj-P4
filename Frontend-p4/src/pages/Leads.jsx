/**
 * @file Leads.jsx
 * @description Componente de página para a gestão de Leads do utilizador.
 * Permite listar, filtrar por estado e abrir o formulário para criação de novas leads.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tokenStore from '../store/tokenStore.js';
import useLeadStore from '../store/useLeadStore.js';
import { STATUS_OPTIONS } from "../utils/constants.js";
import FormModal from "../components/formModal.jsx";
import useFormModal from "../hooks/useFormModal.js";
import '../styles/ClientLead.css';

/**
 * Componente funcional para visualização e filtragem da lista de leads.
 * @component
 * @returns {JSX.Element} Painel de gestão de leads.
 */
export default function Leads() {
    /** @type {Function} Hook de navegação para aceder aos detalhes da lead. */
    const navigate = useNavigate();
    /** @type {string|null} Token de autenticação ativo. */
    const token = tokenStore((state) => state.token);

    // --- ESTADO DA STORE DE LEADS ---
    const { leads, fetchLeads, addLead, updateLead, loading } = useLeadStore();

    /** @type {string} Estado local para o filtro de estado selecionado. */
    const [filtro, setFiltro] = useState("");

    /** * Hook personalizado para gerir a lógica do modal de formulário (criação/edição).
     * @type {Object}
     */
    const modalProps = useFormModal(addLead, updateLead, token);

    /**
     * Efeito de carregamento: Procura as leads sempre que o token ou o filtro mudarem.
     */
    useEffect(() => {
        if (token) fetchLeads(token, filtro);
    }, [token, filtro, fetchLeads]);

    /**
     * Formata datas provenientes do backend.
     * Suporta o formato de array [ano, mes, dia] comum em respostas JSON de Java/Hibernate.
     * @function formatarData
     * @param {Array|string|Date} data - A data a ser formatada.
     * @returns {string} Data formatada no padrão PT-PT (DD/MM/AAAA).
     */
    const formatarData = (data) => {
        if (!data) return "---";
        if (Array.isArray(data)) {
            const [ano, mes, dia] = data;
            return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
        }
        return new Date(data).toLocaleDateString('pt-PT');
    };

    return (
        <div className="admin-container">
            <div className="barra-container">
                <h2>Gestão de Leads</h2>
                {/* Abre o modal configurado para criação de um novo registo */}
                <button type="button" className="btn-save" onClick={() => modalProps.abrirParaCriar({ titulo: '', descricao: '', estado: 0 })}>
                    <i className="fa-solid fa-plus"></i> Adicionar Lead
                </button>
            </div>

            <div className="filtros">
                <label>Filtrar por estado: </label>
                <select value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ padding: '8px', marginLeft: '10px', borderRadius: '5px' }}>
                    <option value="">Todos os Estados</option>
                    {/* Renderiza as opções de estado baseadas nas constantes globais */}
                    {STATUS_OPTIONS.map((nome, idx) => (
                        <option key={idx} value={idx}>{nome}</option>
                    ))}
                </select>
            </div>

            {/* Exibição condicional: Spinner de carregamento ou lista de dados */}
            {loading ? (
                <div className="loading-state"><p>A carregar leads...</p></div>
            ) : (
                <div className="data-list">
                    {leads.map((lead) => (
                        <div key={lead.id} className="data-item" onClick={() => navigate(`/leads/${lead.id}`)}>
                            <div className="data-info">
                                <div className="data-header-row">
                                    <div>
                                        <h4 className="data-title">{lead.titulo}</h4>
                                        <span className="data-date">{formatarData(lead.dataCriacao)}</span>
                                    </div>
                                </div>
                                {/* Badge dinâmica baseada no estado da lead */}
                                <span className={`badge status-${lead.estado}`}>
                                    {STATUS_OPTIONS[lead.estado]}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Componente de Modal reutilizável para operações de Lead */}
            <FormModal
                isOpen={modalProps.modalAberto}
                type="lead"
                initialData={modalProps.itemEmEdicao}
                onClose={modalProps.fecharModal}
                onSave={modalProps.handleSalvar}
            />
        </div>
    );
}