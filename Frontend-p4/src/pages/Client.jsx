import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import tokenStore from "../store/tokenStore.js";
import useClientStore from "../store/useClientStore.js";
import FormModal from '../components/formModal.jsx';
import useFormModal from "../hooks/useFormModal.js";
import '../styles/ClientLead.css';

export default function Client(){
    const navigate = useNavigate();
    const token = tokenStore((state) => state.token);
    const { clients, addClient, fetchClient, updateClient, loading } = useClientStore();
    const modalProps = useFormModal(addClient, updateClient, token);

    useEffect(() => {
        if (token) fetchClient(token);
    }, [token, fetchClient]);

    return (
        <div className="admin-container">
            <div className="barra-container">
                <h2>Gestão de Clientes</h2>
                <button type="button" className="btn-save" onClick={() => modalProps.abrirParaCriar({ nome: '', email: '', telefone: '', empresa: '' })}>
                    <i className="fa-solid fa-plus"></i> Adicionar Cliente
                </button>
            </div>

            {loading ? (
                <div className="loading-state"><p>A carregar clientes...</p></div>
            ) : (
                <div className="data-list">
                    {clients.map((client) => (
                        <div key={client.id} className="data-item" onClick={() => navigate(`/clients/${client.id}`)}>
                            <div className="data-info">
                                <h4 className="data-title">{client.nome}</h4>
                                <p>{client.empresa}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <FormModal isOpen={modalProps.modalAberto} type="client" initialData={modalProps.itemEmEdicao} onClose={modalProps.fecharModal} onSave={modalProps.handleSalvar} />
        </div>
    );
}