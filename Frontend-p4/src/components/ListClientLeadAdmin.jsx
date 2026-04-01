/**
 * @file ListClientLeadAdmin.jsx
 * @description Componente reutilizável para a interface de administração que lista e gere registos de Clientes ou Leads.
 * Oferece suporte para ações individuais (edição, inativação, exclusão) e ações em lote (reativar, inativar ou excluir todos).
 */

import '../styles/Admin.css'
import React from 'react';

/**
 * Componente de lista administrativa para Clientes e Leads.
 * * @component
 * @param {Object} props - Propriedades do componente.
 * @param {string} props.title - O título visível do cartão (ex: "Clientes" ou "Leads").
 * @param {string} props.type - Define o tipo de dados a renderizar: 'client' ou 'lead'.
 * @param {Array} props.data - Array de objetos contendo os dados a serem listados.
 * @param {string} [props.cardClass] - Classe CSS opcional para estilização personalizada do contentor.
 * @param {React.ReactElement} [props.filterElement] - Elemento de interface (ex: select) para filtragem, injetado no cabeçalho.
 * @param {Function} props.onEdit - Função chamada ao clicar no botão de editar um item individual.
 * @param {Function} props.onToggleActive - Função para alternar o estado ativo/inativo de um item individual.
 * @param {Function} props.onDelete - Função para a exclusão (normalmente lógica) de um item individual.
 * @param {Function} props.onReactivateAll - Ação em lote para reativar todos os itens da lista.
 * @param {Function} props.onInactivateAll - Ação em lote para inativar todos os itens da lista.
 * @param {Function} props.onDeleteAll - Ação em lote para a exclusão definitiva de todos os itens exibidos.
 * * @returns {JSX.Element} Um cartão estruturado com cabeçalho de ações globais e lista de itens detalhados.
 */
export default function ListClientLeadAdmin({
                                                title, type, data, cardClass, filterElement,
                                                onEdit, onToggleActive, onDelete,
                                                onReactivateAll, onInactivateAll, onDeleteAll}) {

    /** * Dicionário local para tradução dos códigos de estado das Leads.
     * Mapeia o valor numérico do backend para uma string legível.
     * @type {Object.<number, string>}
     */
    const nomesDosEstados = {
        0: "Novo", 1: "Em análise", 2: "Proposta", 3: "Ganho", 4: "Perdido"
    };

    return (
        <div className={`data-card ${cardClass || ''}`}>
            {/* CABEÇALHO DO CARTÃO: Título, contador e ações em lote */}
            <div className="data-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3>{title} ({data?.length || 0})</h3>
                    {/* Renderização condicional do elemento de filtro passado pelo pai */}
                    {filterElement}
                </div>

                <div className="data-card-actions">
                    <button className="icon-btn green-btn" title="Reativar Todos" onClick={onReactivateAll} ><i className="fa-solid fa-folder-open"></i></button>
                    <button className="icon-btn orange-btn" title="Inativar Todos" onClick={onInactivateAll}><i className="fa-solid fa-ban"></i></button>
                    <button className="icon-btn red-btn" title="Excluir Definitivamente Todos" onClick={onDeleteAll}><i className="fa-solid fa-fire"></i></button>
                </div>
            </div>

            {/* CONTEÚDO DO CARTÃO: Lista de itens ou mensagem de lista vazia */}
            <div className="data-card-content">
                {(!data || data.length === 0) ? (
                    <p className="empty-text">Nenhum(a) {title.toLowerCase()} encontrado(a).</p>
                ) : (
                    <ul className="data-list">
                        {data.map(item => (
                            <li className="admin-list-item" key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                                <div>
                                    {/* NOME/TÍTULO: Lógica dinâmica baseada no tipo do item */}
                                    <strong>{type === 'client' ? item.nome : (item.titulo || item.nome || 'Sem Título')}</strong><br/>

                                    {/* SUBTÍTULO: Exibe a Empresa para Clientes e o Estado para Leads */}
                                    <span className="item-subtitle" style={{ fontSize: '13px', color: '#666' }}>
                                        {type === 'client' ? (
                                            <><i className="fa-regular fa-building"></i> <span style={{ fontWeight: 'bold', color: '#2980b9' }}>{item.empresa || item.email}</span></>
                                        ) : (
                                            <><i className="fa-solid fa-flag"></i> Estado: <span style={{ fontWeight: 'bold', color: '#2980b9' }}>{nomesDosEstados[item.estado] || "Desconhecido"}</span></>
                                        )}
                                    </span>

                                    {/* INDICADOR DE INATIVIDADE: Badge visível apenas se o item não estiver ativo */}
                                    {!item.ativo && (
                                        <span style={{ backgroundColor: '#d9534f', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', marginLeft: '10px', fontWeight: 'bold' }}>
                                            <i className="fa-solid fa-ban"></i> Inativo
                                        </span>
                                    )}
                                </div>

                                {/* BOTÕES DE AÇÃO INDIVIDUAIS */}
                                <div className="action-buttons">
                                    <button className="icon-btn" title="Editar" onClick={() => onEdit && onEdit(item)}>
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