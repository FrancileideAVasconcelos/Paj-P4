import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/UserStore.js';
import tokenStore from '../store/tokenStore.js';

export default function Profile() {
    const navigate = useNavigate();
    const token = tokenStore((state) => state.token);

    const { currentUser, fetchCurrentUser, updateUserProfile, checkCurrentPassword ,loading } = useUserStore();

    // Estado local para o formulário
    const [formData, setFormData] = useState({
        primeiroNome: '',
        ultimoNome: '',
        email: '',
        telefone: '',
        fotoUrl: '',
        password: '', // Obrigatório no teu UserDto!
        username: ''
    });

    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    const [passwords, setPasswords] = useState({
        atual: '', nova: '', confirmar: ''
    });

    // 1. Carregar os dados para o formulário quando a página abre
    useEffect(() => {
        if (!token) navigate('/login');
        if (!currentUser && token) fetchCurrentUser(token);
    }, [token, currentUser, fetchCurrentUser, navigate]);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                primeiroNome: currentUser.primeiroNome || '',
                ultimoNome: currentUser.ultimoNome || '',
                email: currentUser.email || '',
                telefone: currentUser.telefone || '',
                fotoUrl: currentUser.fotoUrl || '',
                username: currentUser.username || '',
                password: '' // Deixamos a password em branco por segurança
            });
        }
    }, [currentUser]);

    // 2. Lidar com as alterações nos inputs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handlePassChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    // 3. Enviar para a API
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagem({ texto: 'A validar dados...', tipo: 'info' });

        let dadosParaEnviar = { ...currentUser, ...formData };

        // 1. A PASSWORD ATUAL PASSA A SER OBRIGATÓRIA PARA QUALQUER ALTERAÇÃO
        if (!passwords.atual) {
            return setMensagem({ texto: 'A password atual é obrigatória para guardar alterações no perfil.', tipo: 'erro' });
        }

        // 2. VAMOS SEMPRE VERIFICAR SE A PASSWORD ATUAL ESTÁ CERTA
        const passValida = await checkCurrentPassword(token, passwords.atual);
        if (!passValida.sucesso) {
            return setMensagem({ texto: passValida.mensagem, tipo: 'erro' });
        }

        // 3. SE ELE DIGITOU UMA NOVA PASSWORD, VALIDAMOS A CONFIRMAÇÃO
        const querMudarPassword = passwords.nova.trim() !== '';

        if (querMudarPassword) {
            if (passwords.nova !== passwords.confirmar) {
                return setMensagem({ texto: 'A nova password e a confirmação não coincidem!', tipo: 'erro' });
            }
            // Envia a password nova
            dadosParaEnviar.password = passwords.nova;
        } else {
            // Se não quer mudar, envia a atual para o Java não dar erro de "Password Obrigatória"!
            dadosParaEnviar.password = passwords.atual;
        }

        // ENVIAR PARA A BASE DE DADOS
        setMensagem({ texto: 'A guardar alterações...', tipo: 'info' });
        const response = await updateUserProfile(token, dadosParaEnviar);

        if (response.sucesso) {
            setMensagem({ texto: 'Perfil atualizado com sucesso!', tipo: 'sucesso' });
            setPasswords({ atual: '', nova: '', confirmar: '' }); // Limpa os campos
        } else {
            setMensagem({ texto: `Erro: ${response.mensagem}`, tipo: 'erro' });
        }
    };

    if (!currentUser) return <p className="loading-text">A carregar perfil...</p>;
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    return (
        <div className="main-content"> {/* Adapta à class principal do teu layout */}
            <div className="form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>

                <h2 className="form-title">O Meu Perfil</h2>

                {mensagem.texto && (
                    <div className={`alert-message ${mensagem.tipo === 'erro' ? 'alert-error' : 'alert-success'}`}
                         style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px',
                             backgroundColor: mensagem.tipo === 'erro' ? '#ffebee' : '#e8f5e9',
                             color: mensagem.tipo === 'erro' ? '#c62828' : '#2e7d32' }}>
                        {mensagem.texto}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="custom-form">

                    {/* ZONA DA FOTO EM DESTAQUE */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                        <img
                            src={formData.fotoUrl || defaultAvatar}
                            alt="Foto de Perfil"
                            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2c3e50', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                            onError={(e) => { e.target.src = defaultAvatar; }} // Se o link falhar, mostra o default
                        />
                        <div className="form-group" style={{ width: '100%', marginTop: '15px' }}>
                            <label>URL da Foto de Perfil</label>
                            <input type="text" name="fotoUrl" value={formData.fotoUrl} onChange={handleFormChange} placeholder="Ex: https://link-da-imagem.com/foto.jpg" />
                        </div>
                    </div>

                    <hr style={{ border: '1px solid #eee', marginBottom: '20px' }}/>

                    {/* DADOS PESSOAIS */}
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

                    {/* ZONA DE ALTERAÇÃO DE PASSWORD */}
                    <h3 style={{ marginBottom: '15px', color: '#333' }}>Segurança e Validação</h3>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Confirme a sua identidade para guardar as alterações.</p>

                    <div className="form-group">
                        <label>Password Atual (Obrigatório) *</label>
                        <input type="password" name="atual" value={passwords.atual} onChange={handlePassChange} placeholder="Digite a sua password atual" required />
                    </div>

                    <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button type="submit" className="btn-submit" disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                            {loading ? 'A Guardar...' : 'Guardar Perfil'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}