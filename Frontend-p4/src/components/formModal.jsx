import {useState, useEffect} from 'react';
import {STATUS_OPTIONS} from "../utils/constants.js";
import '../styles/admin.css'; // Assume os estilos do modal que adicionámos

export default function FormModal({isOpen, type, initialData, onClose, onSave}) {
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({...initialData});
        }
    }, [isOpen, initialData]);

    if (!isOpen || !formData) return null;

    const teveAlteracao = JSON.stringify(initialData) !== JSON.stringify(formData);

    const isEdit = !!initialData.id;
    const entityName = type === 'client' ? 'Cliente' : 'Lead';

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData); // Devolve o objeto editado para a página principal
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{isEdit ? `Editar ${entityName}` : `Adicionar ${entityName}`}</h3>
                <form onSubmit={handleSubmit} className="custom-form">

                    {/* SE FOR UM CLIENTE, MOSTRA ESTES CAMPOS */}
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
                        /* SE FOR UMA LEAD, MOSTRA ESTES CAMPOS */
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
                                    {STATUS_OPTIONS.map((nome, idx) => (
                                        <option key={idx} value={idx}>{nome}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={!teveAlteracao}
                        >
                            {isEdit ? 'Salvar Alterações' : 'Adicionar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}