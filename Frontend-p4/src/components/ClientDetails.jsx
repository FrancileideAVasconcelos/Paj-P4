import { useNavigate, useParams } from "react-router-dom";
import useClientStore from "../store/useClientStore.js";
import tokenStore from "../store/tokenStore.js";
import { useEffect } from "react";
import FormModal from "./formModal.jsx";
import useFormModal from "../hooks/useFormModal.js";
import '../styles/ClientLead.css';

export default function ClientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = tokenStore((state) => state.token);
    const { currentClient, fetchClientById, softDeleteClient, updateClient, loading } = useClientStore();

    const modalProps = useFormModal(async () => {}, updateClient, token);

    useEffect(() => {
        if (token && id) fetchClientById(token, id);
    }, [token, id, fetchClientById]);

    const handleRemover = async () => {
        if (window.confirm("Tem a certeza que deseja remover esse cliente?")) {
            const sucesso = await softDeleteClient(token, id);
            if (sucesso) {
                alert("Cliente removido!");
                navigate('/client');
            }
        }
    };

    if (loading) return <div className="loading-state"><p>A carregar...</p></div>;
    if (!currentClient) return <div className="no-data"><p>Cliente não encontrado.</p></div>;

    return (
        <div className="admin-container">
            <button onClick={() => navigate(-1)} className="btn-back">
                <i className="fa-solid fa-arrow-left"></i> Voltar
            </button>

            <div className="form-container">
                <h3 className="form-title">Detalhes do Cliente</h3>
                <div className="custom-form">
                    <div className="form-group">
                        <label>Nome</label>
                        <p className="static-data">{currentClient.nome}</p>
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <p className="static-data">{currentClient.email}</p>
                    </div>
                    <div className="form-group">
                        <label>Telefone</label>
                        <p className="static-data">{currentClient.telefone}</p>
                    </div>
                    <div className="form-group">
                        <label>Empresa</label>
                        <p className="static-data">{currentClient.empresa}</p>
                    </div>

                    <div className="form-actions">
                        <button onClick={(e) => modalProps.abrirParaEditar(e, currentClient)} className="btn-save">
                            <i className="fa-solid fa-pen"></i> Editar Detalhes
                        </button>
                        <button onClick={handleRemover} className="btn-save-red">
                            <i className="fa-solid fa-trash-can"></i> Remover Cliente
                        </button>
                    </div>
                </div>
            </div>

            <FormModal isOpen={modalProps.modalAberto} type="client" initialData={modalProps.itemEmEdicao} onClose={modalProps.fecharModal} onSave={modalProps.handleSalvar} />
        </div>
    );
}