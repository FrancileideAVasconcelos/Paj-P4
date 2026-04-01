/**
 * @file tokenStore.js
 * @description Store do Zustand responsável pela gestão do token de autenticação (JWT).
 * Trata da persistência do token no LocalStorage e da lógica de entrada/saída do utilizador.
 */

import { create } from 'zustand';
import useUserStore from './useUserStore.js';

/**
 * Store global para a gestão do token de sessão.
 * * @typedef {Object} TokenStore
 * @property {string|null} token - O token de autenticação atual.
 * @property {Function} login - Guarda o token e estabelece a sessão.
 * @property {Function} logout - Remove o token e limpa os dados do utilizador.
 */

const tokenStore = create((set) => ({
    /** * Inicializa o estado do token verificando o armazenamento persistente do navegador.
     * @type {string|null}
     */
    token: localStorage.getItem('token') || null,

    /**
     * Efetua o login do utilizador.
     * Persiste o token no LocalStorage para que a sessão se mantenha após o refresh da página.
     * * @function login
     * @param {string} newToken - O token JWT retornado pelo servidor.
     */
    login: (newToken) => {
        localStorage.setItem('token', newToken);
        set({ token: newToken });
    },

    /**
     * Encerra a sessão do utilizador.
     * Remove o token do armazenamento local e limpa o estado global do utilizador na useUserStore.
     * * @function logout
     */
    logout: () => {
        localStorage.removeItem('token');
        set({ token: null });

        /** * Acede ao estado da useUserStore para limpar os dados do perfil (currentUser).
         */
        useUserStore.getState().clearUser();
    }
}));

export default tokenStore;