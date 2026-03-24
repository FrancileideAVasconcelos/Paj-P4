import { useState } from 'react';
import tokenStore from '../store/tokenStore.js';
import { api } from '../services/api';
import { Link } from 'react-router-dom'

import '../styles/loginRegister.css';

export default function Login() {
    // Variáveis de estado para os inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState('');

    // Vamos buscar a nossa função de login à store do Zustand
    const login = tokenStore((state) => state.login);

    const handleLogin = async (e) => {
        e.preventDefault(); // Evita que a página recarregue ao submeter o formulário
        setErro('');

        try {
            // Ajusta o URL se o teu endpoint de login for diferente!
            const data = await api.post('/users/login',{ username, password});

            if (data && data.token) {
                login(data.token); // Guarda na store e no localStorage
            } else {
                setErro('Resposta do servidor inválida.');
            }

        } catch (err) {
            setErro(err.message);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin} className="custom-form">
                <div className="form-group">
                    <label>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <button className="btn-login" type="submit">
                    Login
                </button>
                <div className="registo">
                    <p>Não tem conta? <Link to="/register">Registar</Link></p>
                </div>
            </form>
        </div>
    );
}