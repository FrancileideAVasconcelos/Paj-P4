import { create } from 'zustand';
import { AdminService } from "../services/api.js";

const useAdminStore = create((set, get) => ({

    users: [],
    loading: false,
    error: null,

    userClients: [],
    userLeads: [],
    loadingDetails: false,

    // --- FUNÇÕES DA LISTA GERAL ---
    fetchUsers: async (token) => {
        set({ loading: true, error: null });
        try {
            const response = await AdminService.getAllUsers();
            set({ users: response, loading: false });
        } catch (error) {
            set({ error: error.message || "Erro ao carregar utilizadores", loading: false });
        }
    },

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
                userClients: [], // Proteção extra contra o erro 'undefined'
                userLeads: [],
                error: error.message || "Erro ao carregar detalhes",
                loadingDetails: false
            });
        }
    },

    clearUserDetails: () => set({ userClients: [], userLeads: [], error: null }),

    // --- NOVAS FUNÇÕES PARA CLIENTES ---


    editClientAdmin: async (token, username, id, clientData) => {
        try {
            await AdminService.editClient(id,clientData)

            set((state) => ({
                userClients: state.userClients.map(c => c.id === id ? { ...c, ...clientData } : c)
            }));

            return true;
        } catch (error) {
            console.error("Erro ao editar cliente:", error);
            return false;
        }
    },

    editLeadAdmin: async (token, username, id, leadData) => {
        try {
            await AdminService.editLead(id, leadData)

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

    toggleItemStatus: async (token, username, type, id, isAtivo) => {

        try {
            if (isAtivo) {
                await AdminService.toggleItemStatus(type,id, isAtivo)
            } else {
                await AdminService.toggleItemStatus(type, id, isAtivo)
            }

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

    deleteItemPermanent: async (token, username, type, id) => {
        try {
            await AdminService.deleteItemPermanent(type,id)

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

    toggleAllItemsStatus: async (token, username, type, inativar) => {
        try {
            if (inativar) {
                await AdminService.toggleAllItemsStatus(username, type, inativar)
            } else {
                await AdminService.toggleAllItemsStatus(username, type, inativar)
            }

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

    deleteAllItemsPermanent: async (token, username, type) => {
        try {
            await AdminService.deleteAllItemsPermanent(username, type)

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