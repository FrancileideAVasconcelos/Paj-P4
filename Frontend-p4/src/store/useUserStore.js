/**
 * @file useUserStore.js
 * @description Store do Zustand para gerir o estado do utilizador autenticado e operações de perfil.
 */

import { create } from 'zustand';
import { UserService } from "../services/api.js";

/**
 * Store global para a gestão de dados do utilizador.
 * * @typedef {Object} UserStore
 * @property {Object|null} currentUser - Armazena o DTO do utilizador autenticado (UserDto).
 * @property {boolean} loading - Estado de carregamento para operações assíncronas.
 * @property {Function} fetchCurrentUser - Procura os dados do perfil no servidor.
 * @property {Function} checkCurrentPassword - Valida a password atual no backend.
 * @property {Function} updateUserProfile - Atualiza os dados de perfil e recarrega o estado.
 * @property {Function} clearUser - Limpa os dados do utilizador (usado no logout).
 */

const useUserStore = create((set, get) => ({
    /** * Armazena o objeto UserDto do utilizador logado.
     * Inicia como null.
     */
    currentUser: null,

    /**
     * Procura o perfil do utilizador autenticado através do UserService.
     * Atualiza o estado `currentUser` em caso de sucesso.
     * * @async
     * @function fetchCurrentUser
     * @returns {Promise<void>}
     */
    fetchCurrentUser: async () => {
        try {
            const response = await UserService.getprofile();
            set({ currentUser: response });
        } catch (error) {
            console.error("Erro ao buscar perfil:", error);
            set({ currentUser: null });
        }
    },

    /**
     * Envia a password atual para o servidor para validação de identidade.
     * Útil antes de operações sensíveis como alteração de dados.
     * * @async
     * @function checkCurrentPassword
     * @param {string} passAtual - A password atual inserida pelo utilizador.
     * @returns {Promise<{sucesso: boolean, mensagem?: string}>} Objeto com o status da validação.
     */
    checkCurrentPassword: async (passAtual) => {
        try {
            await UserService.checkPassword(passAtual);
            return { sucesso: true };
        } catch (error) {
            // Captura o erro (normalmente 403 Forbidden do backend)
            return { sucesso: false, mensagem: "A password atual está incorreta." };
        }
    },

    /**
     * Atualiza os dados de perfil do utilizador.
     * Após a atualização, dispara um novo fetch para garantir que o estado local está sincronizado.
     * * @async
     * @function updateUserProfile
     * @param {Object} novosDados - Objeto contendo os dados atualizados do utilizador.
     * @returns {Promise<{sucesso: boolean, mensagem?: string}>} Resposta da operação.
     */
    updateUserProfile: async (novosDados) => {
        set({ loading: true });
        try {
            await UserService.updateProfile(novosDados);
            // Recarrega os dados do utilizador para atualizar o Header e UI
            await get().fetchCurrentUser();
            set({ loading: false });
            return { sucesso: true };
        } catch (error) {
            set({ loading: false });
            return { sucesso: false, mensagem: error.message };
        }
    },

    /**
     * Limpa o estado do utilizador.
     * Invocado durante o processo de logout para remover dados sensíveis da memória.
     * * @function clearUser
     */
    clearUser: () => set({ currentUser: null })
}));

export default useUserStore;