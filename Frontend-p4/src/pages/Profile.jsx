/**
 * @file Profile.jsx
 * @description Componente de página para visualização e edição do perfil do utilizador.
 * Implementa uma lógica de segurança rigorosa que exige a password atual para qualquer alteração de dados.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore.js';
import tokenStore from '../store/tokenStore.js';

/**
 * Componente funcional que gere o formulário de perfil.
 * * @component
 * @returns {JSX.Element} O painel de perfil com campos de dados pessoais e segurança.
 */
export default function Profile() {
    /** @type {Function} Hook para redirecionamento (ex: caso o token expire). */
    const navigate = useNavigate();
    /** @type {string|null} Token de sessão obtido da store de autenticação. */
    const token = tokenStore((state) => state.token);

    // --- ESTADO GLOBAL (Zustand) ---
    const {
        currentUser,
        fetchCurrentUser,
        updateUserProfile,
        checkCurrentPassword,
        loading
    } = useUserStore();

    /**
     * Estado local para os campos de texto do formulário.
     * @type {Object}
     */
    const [formData, setFormData] = useState({
        primeiroNome: '',
        ultimoNome: '',
        email: '',
        telefone: '',
        fotoUrl: '',
        password: '',
        username: ''
    });

    /**
     * Estado para mensagens de feedback ao utilizador (sucesso ou erro).
     * @type {Object}
     * @property {string} texto - Conteúdo da mensagem.
     * @property {string} tipo - Categoria da mensagem ('sucesso', 'erro', 'info').
     */
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    /**
     * Estado específico para a lógica de alteração de passwords.
     * @type {Object}
     */
    const [passwords, setPasswords] = useState({
        atual: '', nova: '', confirmar: ''
    });

    /**
     * Efeito inicial: Verifica autenticação e carrega dados do utilizador se necessário.
     */
    useEffect(() => {
        if (!token) navigate('/login');
        if (!currentUser && token) fetchCurrentUser(token);
    }, [token, currentUser, fetchCurrentUser, navigate]);

    /**
     * Efeito de Sincronização: Preenche o formulário local sempre que os dados do utilizador global mudarem.
     */
    useEffect(() => {
        if (currentUser) {
            setFormData({
                primeiroNome: currentUser.primeiroNome || '',
                ultimoNome: currentUser.ultimoNome || '',
                email: currentUser.email || '',
                telefone: currentUser.telefone || '',
                fotoUrl: currentUser.fotoUrl || '',
                username: currentUser.username || '',
                password: ''
            });
        }
    }, [currentUser]);

    /**
     * Manipulador genérico para mudanças nos campos de dados pessoais.
     * @param {React.ChangeEvent<HTMLInputElement>} e
     */
    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    /**
     * Manipulador específico para mudanças nos campos de password.
     * @param {React.ChangeEvent<HTMLInputElement>} e
     */
    const handlePassChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    /**
     * Submete as alterações do perfil.
     * Realiza três níveis de validação:
     * 1. Presença da password atual.
     * 2. Verificação da password atual no backend.
     * 3. Coerência entre nova password e a sua confirmação.
     * * @async
     * @function handleSubmit
     * @param {React.FormEvent} e
     * @returns {Promise<void>}
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagem({ texto: 'A validar dados...', tipo: 'info' });

        /** @type {Object} Dados preparados para envio, integrando passwords e informações pessoais. */
        const dadosParaEnviar = {
            username: formData.username,
            primeiroNome: formData.primeiroNome,
            ultimoNome: formData.ultimoNome,
            email: formData.email,
            telefone: formData.telefone,
            fotoUrl: formData.fotoUrl,
            password: passwords.nova.trim() !== '' ? passwords.nova : passwords.atual
        };

        // Validação 1: Obrigatoriedade da password atual
        if (!passwords.atual) {
            return setMensagem({ texto: 'A password atual é obrigatória para guardar alterações no perfil.', tipo: 'erro' });
        }

        // Validação 2: Verificação de identidade no servidor
        const passValida = await checkCurrentPassword(passwords.atual);
        if (!passValida.sucesso) {
            return setMensagem({ texto: passValida.mensagem, tipo: 'erro' });
        }

        // Validação 3: Gestão de troca de password
        const querMudarPassword = passwords.nova.trim() !== '';

        if (querMudarPassword) {
            if (passwords.nova !== passwords.confirmar) {
                return setMensagem({ texto: 'A nova password e a confirmação não coincidem!', tipo: 'erro' });
            }
            dadosParaEnviar.password = passwords.nova;
        } else {
            // Garante que o campo obrigatório do backend é preenchido com a password atual
            dadosParaEnviar.password = passwords.atual;
        }

        // Envio final para a base de dados
        setMensagem({ texto: 'A guardar alterações...', tipo: 'info' });
        const response = await updateUserProfile(dadosParaEnviar);

        if (response.sucesso) {
            setMensagem({ texto: 'Perfil atualizado com sucesso!', tipo: 'sucesso' });
            setPasswords({ atual: '', nova: '', confirmar: '' });
        } else {
            setMensagem({ texto: `Erro: ${response.mensagem}`, tipo: 'erro' });
        }
    };

    if (!currentUser) return <p className="loading-text">A carregar perfil...</p>;

    /** @type {string} Imagem padrão caso o utilizador não tenha foto definida. */
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    return (
        <div className="main-content">
            <div className="form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>

                <h2 className="form-title">O Meu Perfil</h2>

                {/* Bloco de alertas para feedback visual */}
                {mensagem.texto && (
                    <div className={`alert-message ${mensagem.tipo === 'erro' ? 'alert-error' : 'alert-success'}`}
                         style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px',
                             backgroundColor: mensagem.tipo === 'erro' ? '#ffebee' : '#e8f5e9',
                             color: mensagem.tipo === 'erro' ? '#c62828' : '#2e7d32' }}>
                        {mensagem.texto}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="custom-form">

                    {/* Secção de Foto com pré-visualização instantânea */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                        <img
                            src={formData.fotoUrl || defaultAvatar}
                            alt="Foto de Perfil"
                            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2c3e50', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                            onError={(e) => { e.target.src = defaultAvatar; }}
                        />
                        <div className="form-group" style={{ width: '100%', marginTop: '15px' }}>
                            <label>URL da Foto de Perfil</label>
                            <input type="text" name="fotoUrl" value={formData.fotoUrl} onChange={handleFormChange} placeholder="Ex: https://link-da-imagem.com/foto.jpg" />
                        </div>
                    </div>

                    <hr style={{ border: '1px solid #eee', marginBottom: '20px' }}/>

                    <h3 style={{ marginBottom: '15px', color: '#333' }}>Dados Pessoais</h3>

                    <div className="form-group">
                        <label>Username (Não editável)</label>
                        <input type="text" value={formData.username} disabled style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} />
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Primeiro Nome *</label>
                            <input type="text" name="primeiroNome" value={formData.primeiroNome} onChange={handleFormChange} required />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Último Nome *</label>
                            <input type="text" name="ultimoNome" value={formData.ultimoNome} onChange={handleFormChange} required />
                        </div>
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Email *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleFormChange} required />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Telefone</label>
                            <input type="text" name="telefone" value={formData.telefone} onChange={handleFormChange} />
                        </div>
                    </div>

                    <hr style={{ border: '1px solid #eee', margin: '20px 0' }}/>

                    <h3 style={{ marginBottom: '15px', color: '#333' }}>Segurança e Validação</h3>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Confirme a sua identidade para guardar as alterações.</p>

                    <div className="form-group">
                        <label>Password Atual (Obrigatório) *</label>
                        <input type="password" name="atual" value={passwords.atual} onChange={handlePassChange} placeholder="Digite a sua password atual" required />
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Nova Password (Opcional)</label>
                            <input type="password" name="nova" value={passwords.nova} onChange={handlePassChange} placeholder="Deixe em branco para manter a atual" />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Confirmar Nova Password</label>
                            <input type="password" name="confirmar" value={passwords.confirmar} onChange={handlePassChange} placeholder="Repita a nova password" />
                        </div>
                    </div>

                    <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'A Guardar...' : 'Guardar Perfil'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}