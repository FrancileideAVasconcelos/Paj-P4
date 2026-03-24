import { useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import tokenStore from "../store/tokenStore.js";
import clientStore from "../store/ClientStore.js";



export default function Client(){
    const navigate = useNavigate();
    const token = tokenStore((state) => state.token);
    // Ajusta para 'clients' (plural)
    const { clients,addClient, fetchClient, loading } = clientStore();

    const [mostrarForm, setMostrarForm] = useState(false);
    const [novoClient, setNovoClient] = useState({ nome: '', email: '', telefone: '', empresa: ''});


    useEffect(() => {
        if (token) fetchClient(token);
    }, [token, fetchClient]);

    const handleCriarCliente = async (e) => {
        e.preventDefault();

        if (!novoClient.nome.trim() ||!novoClient.empresa.trim() || !novoClient.telefone.trim() || !novoClient.email.trim()) {
            alert("Nenhum campo pode estar vazios")
            return;
        }

        // 2. Valida o formato do telefone
        if (!validarTelefone(novoClient.telefone)) {
            alert("Formato de telefone inválido. Use apenas números (ex: 912345678).");
            return;
        }

        // 3. Validação do Email
        if (!validarEmail(novoClient.email)) {
            alert("Por favor, insira um email válido (ex: nome@empresa.com).");
            return;
        }

        const resultado = await addClient(token, novoClient); // Agora recebe um objeto

        if (resultado.sucesso) {
            setMostrarForm(false);
            setNovoClient({ nome: '', telefone: '', email: '', empresa: '' });
        } else {
            // Mostra a mensagem real que veio do Java: "Este cliente já está registado..."
            alert(resultado.mensagem || "Erro ao criar cliente");
        }
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

    return (
        <div className="admin-container">
            <div className="barra-container">
                <h2>Gestão de Clientes</h2>
                {/* Em React, onClick recebe uma função {}, não uma string "" */}
                <button
                    className={`btn-toggle ${mostrarForm ? 'cancel' : 'add'}`}
                    onClick={() => setMostrarForm(!mostrarForm)}
                >
                    {mostrarForm ? "Cancelar" : "Novo Cliente"}
                </button>
            </div>

            {mostrarForm && (
                <div className="form-container">
                    <h3 className="form-title">Registar Novo Cliente</h3>
                    <form onSubmit={handleCriarCliente} className="custom-form">
                        <div className="form-group">
                            <label>Nome</label>
                            <input
                                type="text" placeholder="Ex: Joao Silva" value={novoClient.nome}
                                onChange={(e) => setNovoClient({...novoClient, nome: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Telefone</label>
                            <input
                                type="tel" // Use "tel" para teclados numéricos em telemóveis
                                placeholder="Ex: 912345678"
                                value={novoClient.telefone}
                                onChange={(e) => setNovoClient({...novoClient, telefone: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Ex: email@email.com"
                                value={novoClient.email}
                                onChange={(e) => setNovoClient({...novoClient, email: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Empresa</label>
                            <input
                                type="text"
                                placeholder="Ex: Google"
                                value={novoClient.empresa}
                                onChange={(e) => setNovoClient({...novoClient, empresa: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-save">
                                <i className="fa-solid fa-check"></i> Gravar Cliente
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="loading-state"><p>A carregar clientes...</p></div>
            ) : (
                <div className="lista-leads">
                    {clients.map((client) => (
                        <div key={client.id} className="lead-item" onClick={() => navigate(`/clients/${client.id}`)}>
                            <div className="lead-info">
                                <div className="lead-header-row">
                                    <h4 className="lead-title">{client.nome}</h4>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}