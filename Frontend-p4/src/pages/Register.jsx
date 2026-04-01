/**
 * @file Register.jsx
 * @description Componente de página para o registo de novos utilizadores no sistema.
 * Gere o estado de um formulário extenso, aplica validações locais e comunica com o endpoint de registo.
 */

import { useState } from 'react';
import { api } from '../services/api';
import { Link, useNavigate } from "react-router-dom";
import '../styles/loginRegister.css';

/**
 * Componente funcional que renderiza e gere o formulário de registo.
 * * @component
 * @returns {JSX.Element} O formulário de registo estruturado em containers de autenticação.
 */
export default function Register(){

    /** @type {Function} Hook de navegação do react-router-dom para redirecionamento após sucesso. */
    const navigate = useNavigate();

    // --- ESTADOS DO FORMULÁRIO ---
    /** @type {string} Primeiro nome do utilizador. */
    const [primeiroNome, setPrimeiroNome] = useState('');
    /** @type {string} Último nome do utilizador. */
    const [ultimoNome , setUltimoNome] = useState('');
    /** @type {string} URL da imagem de perfil. */
    const [fotoUrl, setFotoUrl] = useState('');
    /** @type {string} Endereço de email. */
    const [email, setEmail] = useState('');
    /** @type {string} Número de telefone (validado para o formato português). */
    const [telefone, setTelefone] = useState('');
    /** @type {string} Nome de utilizador único no sistema. */
    const [username, setUsername] = useState('');
    /** @type {string} Password de acesso. */
    const [password, setPassword] = useState('');
    /** @type {string} Armazena mensagens de erro retornadas pela API ou validações. */
    const [erro, setErro] = useState('');

    /**
     * Gere o processo de registo.
     * Realiza verificações de campos obrigatórios e formato de telefone antes de submeter os dados.
     * * @async
     * @function handleRegister
     * @param {React.FormEvent} e - Evento de submissão do formulário.
     * @returns {Promise<void>} Redireciona para /login em caso de sucesso ou define mensagem de erro.
     */
    const handleRegister = async (e) => {
        e.preventDefault(); // Evita que a página recarregue ao submeter o formulário
        setErro('');

        // Validação de preenchimento obrigatório
        if (!primeiroNome || !ultimoNome || !email || !username || !password || !fotoUrl || !telefone){
            alert("Por favor, preenche todos os campos obrigatórios.");
            return;
        }

        /**
         * Validação de Telefone:
         * Deve ter exatamente 9 dígitos e começar por 2 (fixo) ou 9 (móvel).
         */
        if (!/^[29][0-9]{8}$/.test(telefone)) {
            alert("O telefone deve ter 9 dígitos e começar por 2 ou 9.");
            return;
        }

        /** @type {Object} Objeto com os dados do novo utilizador formatados para o backend. */
        const novoUtilizador = { primeiroNome, ultimoNome, email, username, password, fotoUrl, telefone };

        try {
            /** * Chamada ao endpoint de registo na API.
             * @see {@link api.post}
             */
            await api.post('/users/register', novoUtilizador);
            alert("Sucesso!");

            // Redireciona para a página de login após o registo bem-sucedido
            navigate('/login');
        } catch (err) {
            /** Define o erro capturado (ex: username já existente) para exibição na UI. */
            setErro(err.message);
        }
    }

    return (
        <div className="login-page-container">
            <div className="login-container">
                <h2>Registar Conta</h2>

                {/* Exibição condicional de erros de validação ou de rede */}
                {erro && <p style={{ color: '#e74c3c', textAlign: 'center', marginBottom: '10px', fontWeight: 'bold' }}>{erro}</p>}

                <form onSubmit={handleRegister} className="custom-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Primeiro Nome</label>
                            <input type="text" value={primeiroNome} onChange={(e) => setPrimeiroNome(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Último Nome</label>
                            <input type="text" value={ultimoNome} onChange={(e) => setUltimoNome(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>URL da Foto</label>
                        <input type="text" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>Telefone</label>
                        <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-auth">Registar</button>
                        <Link to="/login" className="btn-auth btn-secondary">
                            Voltar
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}