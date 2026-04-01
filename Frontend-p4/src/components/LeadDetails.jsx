import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useLeadStore from '../store/useLeadStore.js';
import tokenStore from '../store/tokenStore.js';
import { STATUS_OPTIONS } from '../utils/constants.js';
import useFormModal from "../hooks/useFormModal.js";
import FormModal from "./formModal.jsx";
import '../styles/ClientLead.css';

export default function LeadDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = tokenStore((state) => state.token);
    const { currentLead, fetchLeadById, updateLead, softDeleteLead, loading } = useLeadStore();

    const modalProps = useFormModal(async () => {}, updateLead, token);

    useEffect(() => {
        if (token && id) fetchLeadById(token, id);
    }, [token, id, fetchLeadById]);

    const handleRemover = async () => {
        if (window.confirm("Tem a certeza que deseja remover esta lead?")) {
            const sucesso = await softDeleteLead(token, id);
            if (sucesso) {
                alert("Lead removida!");
                navigate('/leads');
            }
        }
    };

    if (loading) return <div className="loading-state"><p>A carregar...</p></div>;
    if (!currentLead) return <div className="no-data"><p>Lead não encontrada.</p></div>;

    return (
        <div className="admin-container">
            <button className="btn-back" onClick={() => navigate('/leads')}>
                <i className="fa-solid fa-arrow-left"></i> Voltar à Lista
            </button>

            <div className="form-container">
                <h3 className="form-title">Detalhes da Lead</h3>
                <div className="custom-form">
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
                            <span className={`badge status-${currentLead.estado}`}>
                                {STATUS_OPTIONS[currentLead.estado]}
                            </span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Data de Registo</label>
                        <p className="static-data">{new Date(currentLead.dataCriacao).toLocaleDateString('pt-PT')}</p>
                    </div>

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

            <FormModal isOpen={modalProps.modalAberto} type="lead" initialData={modalProps.itemEmEdicao} onClose={modalProps.fecharModal} onSave={modalProps.handleSalvar} />
        </div>
    );
}