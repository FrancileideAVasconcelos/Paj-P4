// Leads.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tokenStore from '../store/tokenStore.js';
import leadStore from '../store/LeadStore.js';
import '../styles/Leads.css';
import {STATUS_OPTIONS} from "../utils/constants.js";

export default function Leads() {
    const navigate = useNavigate();
    const token = tokenStore((state) => state.token);
    const { leads, fetchLeads, addLead, loading } = leadStore();

    const [filtro, setFiltro] = useState("");
    const [mostrarForm, setMostrarForm] = useState(false);
    const [novaLead, setNovaLead] = useState({ titulo: '', descricao: '', estado: 0 });


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

    const handleCriarLead = async (e) => {
        e.preventDefault();

        // Validação: Título e Descrição não podem ser vazios
        if (!novaLead.titulo.trim() || !novaLead.descricao.trim()) {
            alert("Erro: O Título e a Descrição são obrigatórios.");
            return;
        }

        const sucesso = await addLead(token, novaLead);
        if (sucesso) {
            setMostrarForm(false);
            setNovaLead({ titulo: '', descricao: '', estado: 0 });
            alert("Lead criada com sucesso!");
        }
    };

    return (
        <div className="admin-container">
            <div className="barra-container">
                <h2>Gestão de Leads</h2>
                <button
                    className={`btn-toggle ${mostrarForm ? 'cancel' : 'add'}`}
                    onClick={() => setMostrarForm(!mostrarForm)}
                >
                    {mostrarForm ? "Cancelar" : "Nova Lead"}
                </button>
            </div>

            {mostrarForm && (
                <div className="form-container">
                    <h3 className="form-title">Registar Nova Lead</h3>
                    <form onSubmit={handleCriarLead} className="custom-form">
                        <div className="form-group">
                            <label>Título da Oportunidade</label>
                            <input
                                type="text"
                                placeholder="Ex: Sistema de Gestão"
                                value={novaLead.titulo}
                                onChange={(e) => setNovaLead({...novaLead, titulo: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Descrição / Notas</label>
                            <textarea
                                placeholder="Detalhes sobre a oportunidade..."
                                value={novaLead.descricao}
                                onChange={(e) => setNovaLead({...novaLead, descricao: e.target.value})}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-save">
                                <i className="fa-solid fa-check"></i> Gravar Lead
                            </button>
                        </div>
                    </form>
                </div>
            )}

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
        </div>
    );
}