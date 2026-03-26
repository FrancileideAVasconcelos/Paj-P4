import { create } from 'zustand';
import { api } from "../services/api.js";

const useAdminStore = create((set, get) => ({
    // 1. ESTADO GLOBAL DE ADMIN
    users: [],
    loading: false,
    error: null,

    // 2. ESTADO ESPECÍFICO DOS DETALHES DO UTILIZADOR (A correção está aqui!)
    userClients: [],
    userLeads: [],
    loadingDetails: false,

    // --- FUNÇÕES DA LISTA GERAL ---
    fetchUsers: async (token) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/admin/users');
            set({ users: response, loading: false });
        } catch (error) {
            set({ error: error.message || "Erro ao carregar utilizadores", loading: false });
        }
    },

    deleteUser: async (token, username, permanente = false) => {
        try {
            await api.delete(`/admin/users/${username}?permanente=${permanente}`);
            get().fetchUsers(token);
            return true;
        } catch (error) {
            return false;
        }
    },

    reactivateUser: async (token, username) => {
        try {
            await api.patch(`/admin/users/${username}/reactivate`, {});
            get().fetchUsers(token);
            return true;
        } catch (error) {
            return false;
        }
    },

    // --- FUNÇÕES DOS DETALHES ---
    fetchUserDetails: async (token, username) => {
        set({ loadingDetails: true, error: null });
        try {
            const [clientsResponse, leadsResponse] = await Promise.all([
                api.get(`/admin/users/${username}/clients`),
                api.get(`/admin/users/${username}/leads`)
            ]);

            // Garante que mesmo que o Java falhe, guarda sempre um array vazio []
            set({
                userClients: Array.isArray(clientsResponse) ? clientsResponse : [],
                userLeads: Array.isArray(leadsResponse) ? leadsResponse : [],
                loadingDetails: false
            });
        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
            set({
                userClients: [], // Proteção extra contra o erro 'undefined'
                userLeads: [],
                error: error.message || "Erro ao carregar detalhes",
                loadingDetails: false
            });
        }
    },

    clearUserDetails: () => set({ userClients: [], userLeads: [], error: null }),

    // --- NOVAS FUNÇÕES PARA CLIENTES ---
    toggleClientStatus: async (token, username, id, isAtivo) => {
        try {
            if (isAtivo) {
                // Chama: DELETE /admin/clients/{id}?permanente=false
                await api.delete(`/admin/clients/${id}?permanente=false`);
            } else {
                // Chama: PATCH /admin/clients/{id}/reactivate
                await api.patch(`/admin/clients/${id}/reactivate`, {});
            }
            await get().fetchUserDetails(token, username);
        } catch (error) {
            console.error("Erro ao alterar estado do cliente:", error);
        }
    },

    editClientAdmin: async (token, username, id, clientData) => {
        try {
            await api.patch(`/admin/clients/${id}`, clientData);
            await get().fetchUserDetails(token, username); // Recarrega a lista
            return true;
        } catch (error) {
            console.error("Erro ao editar cliente:", error);
            return false;
        }
    },

    deleteClientPermanent: async (token, username, id) => {
        try {
            // Chama: DELETE /admin/clients/{id}?permanente=true
            await api.delete(`/admin/clients/${id}?permanente=true`);
            await get().fetchUserDetails(token, username);
        } catch (error) {
            console.error("Erro ao apagar cliente:", error);
        }
    },

    // --- NOVAS FUNÇÕES PARA LEADS ---
    toggleLeadStatus: async (token, username, id, isAtivo) => {
        try {
            if (isAtivo) {
                // Chama: DELETE /admin/leads/{id}?permanente=false
                await api.delete(`/admin/leads/${id}?permanente=false`);
            } else {
                // Chama: PATCH /admin/leads/{id}/reactivate
                await api.patch(`/admin/leads/${id}/reactivate`, {});
            }
            await get().fetchUserDetails(token, username);
        } catch (error) {
            console.error("Erro ao alterar estado da lead:", error);
        }
    },

    editLeadAdmin: async (token, username, id, leadData) => {
        try {
            await api.patch(`/admin/leads/${id}`, leadData);
            await get().fetchUserDetails(token, username); // Recarrega a lista
            return true;
        } catch (error) {
            console.error("Erro ao editar lead:", error);
            return false;
        }
    },

    deleteLeadPermanent: async (token, username, id) => {
        try {
            // Chama: DELETE /admin/leads/{id}?permanente=true
            await api.delete(`/admin/leads/${id}?permanente=true`);
            await get().fetchUserDetails(token, username);
        } catch (error) {
            console.error("Erro ao apagar lead:", error);
        }
    }
}));

export default useAdminStore;