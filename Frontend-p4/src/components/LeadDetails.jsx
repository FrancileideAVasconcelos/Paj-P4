import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import leadStore from '../store/LeadStore.js';
import tokenStore from '../store/tokenStore.js';
import { STATUS_OPTIONS } from '../utils/constants.js';

import '../styles/Leads.css';

export default function LeadDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = tokenStore((state) => state.token);
    const { currentLead, fetchLeadById, softDeleteLead, updateLead, loading } = leadStore();

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ titulo: '', descricao: '', estado: 0 });


    useEffect(() => {
        if (token && id) fetchLeadById(token, id);
    }, [token, id, fetchLeadById]);

    const entrarNoModoEdicao = () => {
        setEditData({
            titulo: currentLead.titulo,
            descricao: currentLead.descricao,
            estado: currentLead.estado
        });
        setIsEditing(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        // Validação rigorosa antes de enviar
        if (!editData.titulo.trim() || !editData.descricao.trim()) {
            alert("Título e Descrição não podem estar vazios.");
            return;
        }

        const sucesso = await updateLead(token, id, editData);
        if (sucesso) {
            setIsEditing(false);
        }
    };

    const temAlteracoes = currentLead ? (
        (editData.titulo.trim() !== currentLead.titulo && editData.titulo.trim() !== "") ||
        (editData.descricao.trim() !== (currentLead.descricao || "") && editData.descricao.trim() !== "") ||
        editData.estado !== currentLead.estado
    ) : false;

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
            <button onClick={() => navigate(-1)} className="btn-toggle cancel btn-back">
                <i className="fa-solid fa-arrow-left"></i> Voltar
            </button>

            <div className="form-container">
                {isEditing ? (
                    <>
                        <h3 className="form-title">Editar Detalhes da Lead</h3>
                        <form onSubmit={handleUpdate} className="custom-form">
                            <div className="form-group">
                                <label>Título da Oportunidade</label>
                                <input
                                    type="text"
                                    value={editData.titulo}
                                    onChange={(e) => setEditData({...editData, titulo: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Estado Atual</label>
                                <select
                                    value={editData.estado}
                                    onChange={(e) => setEditData({...editData, estado: parseInt(e.target.value)})}
                                >
                                    {STATUS_OPTIONS.map((nome, idx) => (
                                        <option key={idx} value={idx}>{nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Descrição / Notas</label>
                                <textarea
                                    value={editData.descricao}
                                    onChange={(e) => setEditData({...editData, descricao: e.target.value})}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-save"
                                    disabled={!temAlteracoes}>
                                    <i className="fa-solid fa-check"></i> Guardar Alterações
                                </button>
                                <button type="button" onClick={() => setIsEditing(false)} className="btn-toggle cancel">Cancelar</button>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <h3 className="form-title">Detalhes da Lead</h3>
                        <div className="custom-form">
                            <div className="form-group">
                                <label>Título da Oportunidade</label>
                                <p className="static-data">{currentLead.titulo}</p>
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
                                <label>Descrição / Notas</label>
                                <p className="static-data">{currentLead.descricao || "Sem notas adicionais."}</p>
                            </div>
                            <div className="form-group">
                                <label>Data de Registo</label>
                                <p className="static-data">{new Date(currentLead.dataCriacao).toLocaleDateString('pt-PT')}</p>
                            </div>

                            <div className="form-actions">
                                <button onClick={entrarNoModoEdicao} className="btn-save">
                                    <i className="fa-solid fa-pen"></i> Editar Detalhes
                                </button>
                                <button onClick={handleRemover} className="btn-save-red">
                                    <i className="fa-solid fa-trash-can"></i> Remover Lead
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}