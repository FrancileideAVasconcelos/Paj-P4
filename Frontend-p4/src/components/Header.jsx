import {useEffect} from "react";
import '../styles/AsideFooterHeader.css'
import tokenStore from "../store/tokenStore.js";
import useUserStore from '../store/useUserStore.js';
import {useNavigate} from "react-router-dom";

export default function Header({ toggleMenu }) {
    const token = tokenStore((state) => state.token);
    const logout = tokenStore((state) => state.logout);
    const currentUser = useUserStore((state) => state.currentUser);
    const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);

    const navigate = useNavigate();

    useEffect(() => {
        if (token && !currentUser) {
            fetchCurrentUser(token);
        }
    }, [token, currentUser, fetchCurrentUser]);

    return (
        <header className="main-header">
            <div className="header-left">
                {/* Ícone Hambúrguer (só aparece no mobile via CSS) */}
                <button className="menu-toggle" onClick={toggleMenu}>
                    <i className="fa-solid fa-bars"></i>
                </button>
                <div className="logo">CRM</div>
            </div>

            <div className="header-actions">
                {token && <p>Bem-vindo, {currentUser ? currentUser.primeiroNome : '...'}</p>}
                {token && <div className="logout-btn" onClick={() => navigate('/profile')}>Meu Perfil</div>}
                {token && <div className="logout-btn" onClick={logout}>Logout</div>}
            </div>
        </header>
    );
}