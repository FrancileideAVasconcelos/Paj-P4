import { useState } from 'react';
import { api } from '../services/api';
import {Link, useNavigate} from "react-router-dom";
import '../styles/loginRegister.css';

export default function Register(){

    const navigate = useNavigate();

    const [primeiroNome, setPrimeiroNome] = useState('');
    const [ultimoNome , setUltimoNome] = useState('');
    const [fotoUrl, setFotoUrl] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();// Evita que a página recarregue ao submeter o formulário
        setErro('');

        if (!primeiroNome || !ultimoNome || !email || !username || !password || !fotoUrl || !telefone){
            alert("Por favor, preenche todos os campos obrigatórios.");
            return;
        }

        if (!/^[29][0-9]{8}$/.test(telefone)) {
            alert("O telefone deve ter 9 dígitos e começar por 2 ou 9.");
            return;
        }

        const novoUtilizador = { primeiroNome, ultimoNome, email, username, password, fotoUrl, telefone };


        try {
            // Ajusta o URL se o teu endpoint de login for diferente!
            await api.post('/users/register', novoUtilizador);
            alert("Sucesso!");

            navigate('/login');
        } catch (err) {
            setErro(err.message);
        }
    }
    return (
        <div className="login-page-container">
            <div className="login-container">
                <h2>Registar Conta</h2>

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