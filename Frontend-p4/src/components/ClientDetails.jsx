import {useNavigate, useParams} from "react-router-dom";
import clientStore from "../store/ClientStore.js";
import tokenStore from "../store/tokenStore.js";
import '../styles/Client.css';
import {useEffect, useState} from "react";

export default function ClientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = tokenStore((state) => state.token);
    const { currentClient, fetchClientById, softDeleteClient, updateClient, loading } = clientStore();

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ nome: '', email: '', telefone: '', empresa: '' }); // Empresa para minúsculo

    useEffect(() => {
        if (token && id) fetchClientById(token, id);
    }, [token, id, fetchClientById]);

    const entrarNoModoEdicao = () => {
        setEditData({
            nome: currentClient.nome,
            email: currentClient.email,
            telefone: currentClient.telefone,
            empresa: currentClient.empresa
        });
        setIsEditing(true);
    };

    const validarTelefone = (telefone) => {
        // Aceita apenas números, opcionalmente começando com +, entre 9 a 13 dígitos
        const regex = /^(\+)?\d{9,13}$/;
        return regex.test(telefone.trim());
    };

    const validarEmail = (email) => {
        // Verifica se tem caracteres antes do @, o símbolo @, e um domínio válido
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email.trim());
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        //Validacao
        if (!editData.nome.trim() || !editData.empresa.trim() || !editData.telefone.trim() || !editData.email.trim()) {
            alert("Nenhum campo pode estar vazio");
            return;
        }

        // 2. Valida o formato do telefone
        if (!validarTelefone(editData.telefone)) {
            alert("Formato de telefone inválido. Use apenas números (ex: 912345678).");
            return;
        }

        // 3. Validação do Email
        if (!validarEmail(editData.email)) {
            alert("Por favor, insira um email válido (ex: nome@empresa.com).");
            return;
        }

        const resultado = await updateClient(token, id, editData); // Agora recebe o objeto

        if (resultado.sucesso) {
            setIsEditing(false);
        } else {
            // Mostra a mensagem do Java: "Este cliente já está registado..."
            alert(resultado.mensagem || "Erro ao editar cliente");
        }
    };

    const temAlteracoes = currentClient ? (
        editData.nome.trim() !== currentClient.nome ||
        editData.email.trim() !== currentClient.email ||
        editData.telefone.trim() !== currentClient.telefone ||
        editData.empresa.trim() !== currentClient.empresa
    ) : false;

    const handleRemover = async () => {
        if (window.confirm("Tem a certeza que deseja remover esse cliente?")){
            const sucesso = await softDeleteClient(token, id);
            if (sucesso) {
                alert("Cliente removido!");
                navigate('/client'); // Ajustado para plural para ser consistente com as rotas
            }
        }
    };

    if (loading) return <div className="loading-state"><p>A carregar...</p></div>;
    if (!currentClient) return <div className="no-data"><p>Cliente não encontrada.</p></div>;

    return (
        <div className="admin-container">
            <button onClick={() => navigate(-1)} className="btn-toggle cancel btn-back">
                <i className="fa-solid fa-arrow-left"></i> Voltar
            </button>

            <div className="form-container">
                {isEditing ? (
                    <>
                        <h3 className="form-title">Editar Detalhes do Cliente</h3>
                        <form onSubmit={handleUpdate} className="custom-form">
                            <div className="form-group">
                                <label>Nome</label>
                                <input
                                    type="text"
                                    value={editData.nome}
                                    onChange={(e) => setEditData({...editData, nome: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Telefone</label>
                                <input
                                    type="tel"
                                    value={editData.telefone}
                                    onChange={(e) => setEditData({...editData, telefone: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Empresa</label>
                                <input
                                    type="text"
                                    value={editData.empresa}
                                    onChange={(e) => setEditData({...editData, empresa: e.target.value})}
                                    required
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
                                <button onClick={entrarNoModoEdicao} className="btn-save">
                                    <i className="fa-solid fa-pen"></i> Editar Detalhes
                                </button>
                                <button onClick={handleRemover} className="btn-save-red">
                                    <i className="fa-solid fa-trash-can"></i> Remover Cliente
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>

    )
}




