/**
 * @file useAdminStore.js
 * @description Store do Zustand para operações administrativas.
 * Gere a lista global de utilizadores e o acesso detalhado aos dados de cada utilizador (Clientes e Leads).
 */

import { create } from 'zustand';
import { AdminService } from "../services/api.js";

/**
 * Store global para administração do sistema.
 * * @typedef {Object} AdminStore
 * @property {Array} users - Lista de todos os utilizadores do sistema.
 * @property {boolean} loading - Estado de carregamento da lista geral.
 * @property {string|null} error - Mensagem de erro em caso de falha nas operações.
 * @property {Array} userClients - Lista de clientes do utilizador selecionado no painel admin.
 * @property {Array} userLeads - Lista de leads do utilizador selecionado no painel admin.
 * @property {boolean} loadingDetails - Estado de carregamento para os detalhes do utilizador.
 */

const useAdminStore = create((set, get) => ({

    /** Lista global de utilizadores. */
    users: [],
    /** Estado de carregamento global. */
    loading: false,
    /** Armazena erros de API. */
    error: null,

    /** Clientes do utilizador em visualização. */
    userClients: [],
    /** Leads do utilizador em visualização. */
    userLeads: [],
    /** Estado de carregamento de detalhes específicos. */
    loadingDetails: false,

    // --- FUNÇÕES DA LISTA GERAL ---

    /**
     * Procura todos os utilizadores registados no sistema.
     * * @async
     * @function fetchUsers
     * @param {string} token - Token de autenticação.
     * @returns {Promise<void>}
     */
    fetchUsers: async (token) => {
        set({ loading: true, error: null });
        try {
            const response = await AdminService.getAllUsers();
            set({ users: response, loading: false });
        } catch (error) {
            set({ error: error.message || "Erro ao carregar utilizadores", loading: false });
        }
    },

    /**
     * Inativa ou remove permanentemente um utilizador.
     * * @async
     * @function deleteUser
     * @param {string} token - Token de autenticação.
     * @param {string} username - Username do utilizador a remover/inativar.
     * @param {boolean} [permanente=false] - Se true, remove do banco; se false, apenas inativa.
     * @returns {Promise<boolean>} Retorna true se a operação teve sucesso.
     */
    deleteUser: async (token, username, permanente = false) => {
        try {
            await AdminService.deleteUser(username, permanente);

            set((state) => ({
                users: permanente
                    ? state.users.filter(u => u.username !== username)
                    : state.users.map(u => u.username === username ? { ...u, ativo: false } : u)
            }));

            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Reativa a conta de um utilizador que estava inativo.
     * * @async
     * @function reactivateUser
     * @param {string} token - Token de autenticação.
     * @param {string} username - Username do utilizador.
     * @returns {Promise<boolean>}
     */
    reactivateUser: async (token, username) => {
        try {
            await AdminService.reactivateUser(username);

            set((state) => ({
                users: state.users.map(u => u.username === username ? { ...u, ativo: true } : u)
            }));

            return true;
        } catch (error) {
            return false;
        }
    },

    // --- FUNÇÕES DOS DETALHES ---

    /**
     * Carrega em simultâneo os clientes e leads de um utilizador específico para o painel de detalhes.
     * * @async
     * @function fetchUserDetails
     * @param {string} token - Token de autenticação.
     * @param {string} username - O utilizador cujos dados serão carregados.
     * @returns {Promise<void>}
     */
    fetchUserDetails: async (token, username) => {
        set({ loadingDetails: true, error: null });
        try {
            const [clientsResponse, leadsResponse] = await Promise.all([
                AdminService.getUserClients(username),
                AdminService.getUserLeads(username)
            ]);
            set({
                userClients: Array.isArray(clientsResponse) ? clientsResponse : [],
                userLeads: Array.isArray(leadsResponse) ? leadsResponse : [],
                loadingDetails: false
            });
        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
            set({
                userClients: [],
                userLeads: [],
                error: error.message || "Erro ao carregar detalhes",
                loadingDetails: false
            });
        }
    },

    /**
     * Limpa as listas de detalhes e erros do estado. Invocado ao sair do painel de um utilizador.
     * @function clearUserDetails
     */
    clearUserDetails: () => set({ userClients: [], userLeads: [], error: null }),

    // --- FUNÇÕES DE EDIÇÃO ADMINISTRATIVA ---

    /**
     * Permite ao Administrador editar os dados de um cliente pertencente a outro utilizador.
     * * @async
     * @function editClientAdmin
     * @param {string} token - Token de autenticação.
     * @param {string} username - Dono do cliente.
     * @param {number|string} id - ID do cliente.
     * @param {Object} clientData - Novos dados do cliente.
     * @returns {Promise<boolean>}
     */
    editClientAdmin: async (token, username, id, clientData) => {
        try {
            await AdminService.editClient(id, clientData);
            set((state) => ({
                userClients: state.userClients.map(c => c.id === id ? { ...c, ...clientData } : c)
            }));
            return true;
        } catch (error) {
            console.error("Erro ao editar cliente:", error);
            return false;
        }
    },

    /**
     * Permite ao Administrador editar os dados de uma lead pertencente a outro utilizador.
     * * @async
     * @function editLeadAdmin
     * @param {string} token - Token de autenticação.
     * @param {string} username - Dono da lead.
     * @param {number|string} id - ID da lead.
     * @param {Object} leadData - Novos dados da lead.
     * @returns {Promise<boolean>}
     */
    editLeadAdmin: async (token, username, id, leadData) => {
        try {
            await AdminService.editLead(id, leadData);
            set((state) => ({
                userLeads: state.userLeads.map(l => l.id === id ? { ...l, ...leadData } : l)
            }));
            return true;
        } catch (error) {
            console.error("Erro ao editar lead:", error);
            return false;
        }
    },

    // ==========================================
    // FUNÇÕES UNIFICADAS (CLIENTES & LEADS)
    // ==========================================

    /**
     * Alterna o estado ativo/inativo de um item individual (Lead ou Cliente).
     * * @async
     * @function toggleItemStatus
     * @param {string} token - Token de autenticação.
     * @param {string} username - Dono do item.
     * @param {string} type - O tipo do item ('client' ou 'lead').
     * @param {number|string} id - ID do item.
     * @param {boolean} isAtivo - Estado atual do item.
     * @returns {Promise<void>}
     */
    toggleItemStatus: async (token, username, type, id, isAtivo) => {
        try {
            await AdminService.toggleItemStatus(type, id, isAtivo);

            set((state) => {
                const listName = type === 'client' ? 'userClients' : 'userLeads';
                return {
                    [listName]: state[listName].map(item => item.id === id ? { ...item, ativo: !isAtivo } : item)
                };
            });
        } catch (error) {
            console.error(`Erro ao alterar estado de ${type}:`, error);
        }
    },

    /**
     * Remove permanentemente um item (Lead ou Cliente) do sistema através do painel admin.
     * * @async
     * @function deleteItemPermanent
     * @param {string} token - Token de autenticação.
     * @param {string} username - Dono do item.
     * @param {string} type - Tipo do item ('client' ou 'lead').
     * @param {number|string} id - ID do item.
     * @returns {Promise<void>}
     */
    deleteItemPermanent: async (token, username, type, id) => {
        try {
            await AdminService.deleteItemPermanent(type, id);

            set((state) => {
                const listName = type === 'client' ? 'userClients' : 'userLeads';
                return {
                    [listName]: state[listName].filter(item => item.id !== id)
                };
            });
        } catch (error) {
            console.error(`Erro ao apagar ${type}:`, error);
        }
    },

    /**
     * Altera o estado de todos os itens de um tipo específico (ex: todas as leads) de um utilizador.
     * * @async
     * @function toggleAllItemsStatus
     * @param {string} token - Token de autenticação.
     * @param {string} username - Dono dos itens.
     * @param {string} type - Tipo dos itens ('client' ou 'lead').
     * @param {boolean} inativar - Se true inativa todos, se false reativa todos.
     * @returns {Promise<void>}
     */
    toggleAllItemsStatus: async (token, username, type, inativar) => {
        try {
            await AdminService.toggleAllItemsStatus(username, type, inativar);

            set((state) => {
                const listName = type === 'client' ? 'userClients' : 'userLeads';
                return {
                    [listName]: state[listName].map(item => ({ ...item, ativo: !inativar }))
                };
            });
        } catch (error) {
            console.error(`Erro ao alterar estado de todos os ${type}s:`, error);
        }
    },

    /**
     * Remove permanentemente todos os clientes ou todas as leads de um utilizador específico.
     * * @async
     * @function deleteAllItemsPermanent
     * @param {string} token - Token de autenticação.
     * @param {string} username - Dono dos itens.
     * @param {string} type - Tipo dos itens ('client' ou 'lead').
     * @returns {Promise<void>}
     */
    deleteAllItemsPermanent: async (token, username, type) => {
        try {
            await AdminService.deleteAllItemsPermanent(username, type);

            set((state) => {
                const listName = type === 'client' ? 'userClients' : 'userLeads';
                return {
                    [listName]: []
                };
            });
        } catch (error) {
            console.error(`Erro ao apagar todos os ${type}s:`, error);
        }
    }

}));

export default useAdminStore;