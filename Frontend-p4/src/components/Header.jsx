/**
 * @file Header.jsx
 * @description Componente de cabeçalho global da aplicação.
 * Responsável por exibir a identidade da marca, saudar o utilizador autenticado
 * e fornecer atalhos para o perfil e logout.
 */

import {useEffect} from "react";
import '../styles/AsideFooterHeader.css'
import tokenStore from "../store/tokenStore.js";
import useUserStore from '../store/useUserStore.js';
import {useNavigate} from "react-router-dom";

/**
 * Componente funcional que renderiza a barra superior da interface.
 * @component
 * @param {Object} props - Propriedades do componente.
 * @param {Function} props.toggleMenu - Função para alternar a visibilidade do menu lateral (útil em dispositivos móveis).
 * @returns {JSX.Element} Estrutura do cabeçalho com logótipo e ações do utilizador.
 */
export default function Header({ toggleMenu }) {
    /** @type {string|null} Token de autenticação atual. */
    const token = tokenStore((state) => state.token);

    /** @type {Function} Função para remover o token e limpar a sessão. */
    const logout = tokenStore((state) => state.logout);

    /** @type {Object|null} Dados do utilizador autenticado. */
    const currentUser = useUserStore((state) => state.currentUser);

    /** @type {Function} Função para procurar os dados do perfil no servidor. */
    const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);

    /** @type {Function} Hook para navegação entre rotas. */
    const navigate = useNavigate();

    /**
     * Efeito de Sincronização: Garante que os dados do utilizador são carregados
     * sempre que existe um token mas o objeto currentUser está vazio (ex: após refresh).
     */
    useEffect(() => {
        if (token && !currentUser) {
            fetchCurrentUser(token); // Procura os dados do perfil
        }
    }, [token, currentUser, fetchCurrentUser]);

    return (
        <header className="main-header">
            <div className="header-left">
                {/* Botão de controlo do menu lateral para resoluções móveis */}
                <button className="menu-toggle" onClick={toggleMenu}>
                    <i className="fa-solid fa-bars"></i>
                </button>
                <div className="logo">CRM</div>
            </div>

            {/* Secção de ações do utilizador, visível apenas se autenticado */}
            <div className="header-actions">
                {/* Saudação personalizada utilizando o primeiro nome do utilizador */}
                {token && <p>Bem-vindo, {currentUser ? currentUser.primeiroNome : '...'}</p>}

                {/* Link para a página de edição de perfil */}
                {token && <div className="logout-btn" onClick={() => navigate('/profile')}>Meu Perfil</div>}

                {/* Botão de encerramento de sessão */}
                {token && <div className="logout-btn" onClick={logout}>Logout</div>}
            </div>
        </header>
    );
}