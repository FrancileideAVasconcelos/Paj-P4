// src/components/ListClientLeadAdmin.jsx
import React from 'react';

export default function ListClientLeadAdmin({
                                                title, type, data, cardClass, filterElement,
                                                onEdit, onToggleActive, onDelete}) {
    // Dicionário de estados (agora vive aqui dentro, isolado!)
    const nomesDosEstados = {
        0: "Novo", 1: "Em análise", 2: "Proposta", 3: "Ganho", 4: "Perdido"
    };

    return (
        <div className={`data-card ${cardClass || ''}`}>
            <div className="data-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3>{title} ({data?.length || 0})</h3>
                    {/* Se a página passar um filtro, ele aparece aqui. Senão, fica vazio! */}
                    {filterElement}
                </div>

                <div className="data-card-actions">
                    <button className="icon-btn green-btn" title="Reativar Todos"><i className="fa-solid fa-folder-open"></i></button>
                    <button className="icon-btn orange-btn" title="Inativar Todos"><i className="fa-solid fa-ban"></i></button>
                    <button className="icon-btn red-btn" title="Excluir Definitivamente Todos"><i className="fa-solid fa-fire"></i></button>
                </div>
            </div>
            <div className="data-card-content">
                {(!data || data.length === 0) ? (
                    <p className="empty-text">Nenhum(a) {title.toLowerCase()} encontrado(a).</p>
                ) : (
                    <ul className="data-list">
                        {data.map(item => (
                            <li className="admin-list-item" key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                                <div>
                                    {/* NOME/TÍTULO */}
                                    <strong>{type === 'client' ? item.nome : (item.titulo || item.nome || 'Sem Título')}</strong><br/>

                                    {/* SUBTÍTULO: Difere consoante seja Cliente ou Lead */}
                                    <span className="item-subtitle" style={{ fontSize: '13px', color: '#666' }}>
                                        {type === 'client' ? (
                                            <><i className="fa-regular fa-building"></i> <span style={{ fontWeight: 'bold', color: '#2980b9' }}>{item.empresa || item.email}</span></>
                                        ) : (
                                            <><i className="fa-solid fa-flag"></i> Estado: <span style={{ fontWeight: 'bold', color: '#2980b9' }}>{nomesDosEstados[item.estado] || "Desconhecido"}</span></>
                                        )}
                                    </span>

                                    {/* BADGE DE INATIVO */}
                                    {!item.ativo && (
                                        <span style={{ backgroundColor: '#d9534f', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', marginLeft: '10px', fontWeight: 'bold' }}>
                                            <i className="fa-solid fa-ban"></i> Inativo
                                        </span>
                                    )}
                                </div>

                                {/* BOTÕES DE AÇÃO INDIVIDUAIS */}
                                <div className="action-buttons" style={{ display: 'flex', gap: '5px' }}>
                                    <button className="icon-btn" style={{ backgroundColor: '#000080', color: 'white' }} title="Editar" onClick={() => onEdit && onEdit(item)}>
                                        <i className="fa-solid fa-pen"></i>
                                    </button>
                                    <button className="icon-btn orange-btn" title={item.ativo ? "Inativar" : "Reativar"} onClick={() => onToggleActive && onToggleActive(item)}>
                                        <i className={`fa-solid ${item.ativo ? 'fa-ban' : 'fa-folder-open'}`}></i>
                                    </button>
                                    <button className="icon-btn red-btn" title="Excluir" onClick={() => onDelete && onDelete(item)}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}