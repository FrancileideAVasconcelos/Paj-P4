// src/store/AdminStore.js
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
            const response = await api.get('/admin/users', { headers: { token: token } });
            set({ users: response, loading: false });
        } catch (error) {
            set({ error: error.message || "Erro ao carregar utilizadores", loading: false });
        }
    },

    deleteUser: async (token, username, permanente = false) => {
        try {
            await api.delete(`/admin/users/${username}?permanente=${permanente}`, { headers: { token: token } });
            get().fetchUsers(token);
            return true;
        } catch (error) {
            return false;
        }
    },

    reactivateUser: async (token, username) => {
        try {
            await api.patch(`/admin/users/${username}/reactivate`, {}, { headers: { token: token } });
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
                api.get(`/admin/users/${username}/clients`, { headers: { token } }),
                api.get(`/admin/users/${username}/leads`, { headers: { token } })
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

    clearUserDetails: () => set({ userClients: [], userLeads: [], error: null })
}));

export default useAdminStore;