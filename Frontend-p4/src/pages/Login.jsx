/**
 * @file Login.jsx
 * @description Componente de página responsável pela autenticação de utilizadores.
 * Gere o estado do formulário de entrada, comunica com a API de login e
 * coordena a atualização das stores globais de token e utilizador.
 */

import { useState } from 'react';
import tokenStore from '../store/tokenStore.js';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/loginRegister.css';
import useUserStore from "../store/useUserStore.js";

/**
 * Componente funcional para renderização da interface de Login.
 * * @component
 * @returns {JSX.Element} A página de login com campos de credenciais.
 */
export default function Login() {

    /** @type {string} Estado local para o nome de utilizador inserido. */
    const [username, setUsername] = useState('');

    /** @type {string} Estado local para a password inserida. */
    const [password, setPassword] = useState('');

    /** @type {string} Estado para exibir mensagens de erro provenientes da API ou validação. */
    const [erro, setErro] = useState('');

    /** * Função de login proveniente da store de tokens (Zustand).
     * @type {Function}
     */
    const login = tokenStore((state) => state.login);

    /**
     * Processa a tentativa de autenticação.
     * 1. Envia as credenciais para o endpoint `/users/login`.
     * 2. Em caso de sucesso, guarda o token recebido.
     * 3. Dispara a procura dos dados detalhados do utilizador logado.
     * * @async
     * @function handleLogin
     * @param {React.FormEvent} e - Evento de submissão do formulário.
     * @returns {Promise<void>}
     */
    const handleLogin = async (e) => {
        e.preventDefault(); // Evita o refresh da página
        setErro('');

        try {
            /** * Chamada à API para autenticação.
             * @type {Object} Contém o token JWT retornado pelo servidor.
             */
            const data = await api.post('/users/login', { username, password });

            if (data && data.token) {
                // Guarda o token no localStorage e no estado global
                login(data.token);

                // Força a atualização dos dados do utilizador na store de perfil
                await useUserStore.getState().fetchCurrentUser();
            } else {
                setErro('Resposta do servidor inválida.');
            }

        } catch (err) {
            /** Captura erros de rede ou credenciais inválidas (ex: 401). */
            setErro(err.message);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-container">
                <h2>Login</h2>

                {/* Área de exibição de erros críticos */}
                {erro && (
                    <p style={{
                        color: '#e74c3c',
                        textAlign: 'center',
                        marginBottom: '15px',
                        fontWeight: 'bold'
                    }}>
                        {erro}
                    </p>
                )}

                <form onSubmit={handleLogin} className="custom-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-actions" style={{ marginTop: '10px' }}>
                        <button className="btn-auth" type="submit">
                            Entrar
                        </button>
                    </div>

                    <div className="auth-links">
                        <p>Não tem conta? <Link to="/register">Registar</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
}