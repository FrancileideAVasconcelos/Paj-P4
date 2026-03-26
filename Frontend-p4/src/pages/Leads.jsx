
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tokenStore from '../store/tokenStore.js';
import useLeadStore from '../store/useLeadStore.js';
import '../styles/Leads.css';
import {STATUS_OPTIONS} from "../utils/constants.js";
import FormModal from "../components/formModal.jsx";
import useFormModal from "../hooks/useFormModal.js";

export default function Leads() {
    const navigate = useNavigate();
    const token = tokenStore((state) => state.token);
    const { leads, fetchLeads, addLead, updateLead, loading } = useLeadStore();
    const [filtro, setFiltro] = useState("");


    const modalProps = useFormModal(addLead, updateLead, token);


    useEffect(() => {
        if (token) fetchLeads(token, filtro);
    }, [token, filtro, fetchLeads]);

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
                <button
                    type="button"
                    className="btn-save"
                    onClick={() => modalProps.abrirParaCriar({ titulo: '', descricao: '', estado: 0 })}
                >
                    <i className="fa-solid fa-plus"></i> Adicionar Lead
                </button>
            </div>

            <div className="filtros">
                <label>Filtrar por estado: </label>
                <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                    <option value="">Todos os Estados</option>
                    {STATUS_OPTIONS.map((nome, idx) => (
                        <option key={idx} value={idx}>{nome}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading-state"><p>A carregar leads...</p></div>
            ) : (
                <div className="lista-leads">
                    {leads.map((lead) => (
                        <div key={lead.id} className="lead-item" onClick={() => navigate(`/leads/${lead.id}`)}>
                            <div className="lead-info">
                                <div className="lead-header-row">
                                    <h4 className="lead-title">{lead.titulo}</h4>
                                    <span className="lead-date">{formatarData(lead.dataCriacao)}</span>
                                </div>
                                <span className={`badge status-${lead.estado}`}>
                                    {STATUS_OPTIONS[lead.estado]}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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