/**
 * @file formModal.jsx
 * @description Componente de interface modal reutilizável para criação e edição de entidades.
 * Adapta dinamicamente os campos do formulário dependendo se a entidade é um 'client' ou uma 'lead'.
 */

import {useState, useEffect} from 'react';
import {STATUS_OPTIONS} from "../utils/constants.js";
import '../styles/ClientLead.css';

/**
 * Componente funcional que renderiza um formulário dentro de uma sobreposição (overlay) modal.
 * @component
 * @param {Object} props - Propriedades do componente.
 * @param {boolean} props.isOpen - Controla se o modal está visível no ecrã.
 * @param {string} props.type - O tipo de entidade a gerir: 'client' ou 'lead'.
 * @param {Object} props.initialData - Dados iniciais para preencher o formulário (vazio para criação, preenchido para edição).
 * @param {Function} props.onClose - Função chamada para encerrar o modal sem guardar.
 * @param {Function} props.onSave - Função chamada ao submeter o formulário com sucesso.
 * @returns {JSX.Element|null} O portal do modal ou null se isOpen for falso.
 */
export default function FormModal({isOpen, type, initialData, onClose, onSave}) {
    /** * @type {Object|null} Estado local que armazena os dados temporários enquanto o utilizador edita os campos.
     */
    const [formData, setFormData] = useState(null);

    /**
     * Efeito de Sincronização: Sempre que o modal abre, clona os dados iniciais para o estado local
     * para permitir a edição sem afetar os dados originais prematuramente.
     */
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({...initialData});
        }
    }, [isOpen, initialData]);

    // Proteção para não renderizar o componente se não estiver aberto ou sem dados
    if (!isOpen || !formData) return null;

    /** * @type {boolean} Verifica se houve qualquer alteração comparando o estado inicial com o estado atual.
     * Utilizado para controlar a propriedade 'disabled' do botão de guardar.
     */
    const teveAlteracao = JSON.stringify(initialData) !== JSON.stringify(formData);

    /** @type {boolean} Determina se o formulário está em modo de edição baseado na presença de um ID. */
    const isEdit = !!initialData.id;
    /** @type {string} Nome amigável da entidade para exibição nos títulos. */
    const entityName = type === 'client' ? 'Cliente' : 'Lead';

    /**
     * Gere a submissão do formulário.
     * Previne o comportamento padrão do navegador e envia os dados editados para o componente pai.
     * @function handleSubmit
     * @param {React.FormEvent} e - Evento de submissão.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData); // Devolve o objeto editado para a página principal
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{isEdit ? `Editar ${entityName}` : `Adicionar ${entityName}`}</h3>
                <form onSubmit={handleSubmit} className="custom-form">

                    {/* RENDERIZAÇÃO CONDICIONAL: CAMPOS DE CLIENTE */}
                    {type === 'client' ? (
                        <>
                            <div className="form-group">
                                <label>Nome</label>
                                <input
                                    type="text"
                                    value={formData.nome || ''}
                                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Telefone</label>
                                <input
                                    type="text"
                                    value={formData.telefone || ''}
                                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Empresa</label>
                                <input
                                    type="text"
                                    value={formData.empresa || ''}
                                    onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                                />
                            </div>
                        </>
                    ) : (
                        /* RENDERIZAÇÃO CONDICIONAL: CAMPOS DE LEAD */
                        <>
                            <div className="form-group">
                                <label>Título da Oportunidade *</label>
                                <input
                                    type="text"
                                    value={formData.titulo || formData.nome || ''}
                                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea
                                    value={formData.descricao || ''}
                                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        minHeight: '80px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc'
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Estado</label>
                                <select
                                    value={formData.estado || 0}
                                    onChange={(e) => setFormData({...formData, estado: parseInt(e.target.value)})}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc'
                                    }}
                                >
                                    {/* Mapeia as opções de estado definidas nas constantes do projeto */}
                                    {STATUS_OPTIONS.map((nome, idx) => (
                                        <option key={idx} value={idx}>{nome}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* ACÇÕES DO MODAL */}
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={!teveAlteracao} // Bloqueia o clique se não houver mudanças reais
                        >
                            {isEdit ? 'Salvar Alterações' : 'Adicionar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}