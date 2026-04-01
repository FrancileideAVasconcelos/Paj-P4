/**
 * @file LeadDetails.jsx
 * @description Componente de página para visualização detalhada de uma Lead específica.
 * Permite consultar informações completas, editar dados através de um modal e
 * realizar a remoção lógica (inativação) do registo.
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useLeadStore from '../store/useLeadStore.js';
import tokenStore from '../store/tokenStore.js';
import { STATUS_OPTIONS } from '../utils/constants.js';
import useFormModal from "../hooks/useFormModal.js";
import FormModal from "./formModal.jsx";
import '../styles/ClientLead.css';

/**
 * Componente funcional que exibe os detalhes de uma Lead.
 * @component
 * @returns {JSX.Element} Interface de detalhes com ações de edição e remoção.
 */
export default function LeadDetails() {
    /** @type {string} ID da lead extraído dos parâmetros da URL. */
    const { id } = useParams();

    /** @type {Function} Hook para navegação entre rotas. */
    const navigate = useNavigate();

    /** @type {string|null} Token de autenticação para autorizar pedidos à API. */
    const token = tokenStore((state) => state.token);

    // --- ESTADO DA STORE DE LEADS ---
    /** @type {Object} Dados da lead atual e funções de manipulação provenientes da store. */
    const { currentLead, fetchLeadById, updateLead, softDeleteLead, loading } = useLeadStore();

    /** * Hook personalizado para gerir o modal de edição.
     * @type {Object}
     * @property {Function} abrirParaEditar - Prepara o modal com os dados da lead atual.
     */
    const modalProps = useFormModal(async () => {}, updateLead, token);

    /**
     * Efeito de carregamento: Procura os detalhes da lead no servidor
     * sempre que o ID ou o token de autenticação mudarem.
     */
    useEffect(() => {
        if (token && id) fetchLeadById(token, id);
    }, [token, id, fetchLeadById]);

    /**
     * Gere o processo de remoção da lead.
     * Exibe uma confirmação nativa e, em caso de sucesso, redireciona o utilizador para a listagem global.
     * @async
     * @function handleRemover
     * @returns {Promise<void>}
     */
    const handleRemover = async () => {
        if (window.confirm("Tem a certeza que deseja remover esta lead?")) {
            const sucesso = await softDeleteLead(token, id);
            if (sucesso) {
                alert("Lead removida!");
                navigate('/leads');
            }
        }
    };

    // --- RENDERIZAÇÃO CONDICIONAL DE ESTADOS DE CARREGAMENTO E ERRO ---
    if (loading) return <div className="loading-state"><p>A carregar...</p></div>;
    if (!currentLead) return <div className="no-data"><p>Lead não encontrada.</p></div>;

    return (
        <div className="admin-container">
            {/* Botão de navegação para retornar à listagem de leads */}
            <button className="btn-back" onClick={() => navigate('/leads')}>
                <i className="fa-solid fa-arrow-left"></i> Voltar à Lista
            </button>

            <div className="form-container">
                <h3 className="form-title">Detalhes da Lead</h3>
                <div className="custom-form">
                    {/* Exibição estática dos dados da Lead */}
                    <div className="form-group">
                        <label>Título</label>
                        <p className="static-data">{currentLead.titulo}</p>
                    </div>

                    <div className="form-group">
                        <label>Descrição / Notas</label>
                        <p className="static-data" style={{ whiteSpace: 'pre-wrap' }}>
                            {currentLead.descricao || "Sem notas adicionais."}
                        </p>
                    </div>

                    <div className="form-group">
                        <label>Estado</label>
                        <div className="static-data-badge">
                            {/* Badge dinâmica baseada no estado da lead definida nas constantes */}
                            <span className={`badge status-${currentLead.estado}`}>
                                {STATUS_OPTIONS[currentLead.estado]}
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Data de Registo</label>
                        <p className="static-data">
                            {new Date(currentLead.dataCriacao).toLocaleDateString('pt-PT')}
                        </p>
                    </div>

                    {/* Ações de Gestão da Lead */}
                    <div className="form-actions">
                        <button onClick={(e) => modalProps.abrirParaEditar(e, currentLead)} className="btn-save">
                            <i className="fa-solid fa-pen"></i> Editar Detalhes
                        </button>
                        <button onClick={handleRemover} className="btn-save-red">
                            <i className="fa-solid fa-trash-can"></i> Remover Lead
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de formulário para edição de leads */}
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