import { create } from 'zustand';
import { ClientService } from "../services/api.js";


const useClientStore = create((set, get) => ({
    clients: [], // Nome no plural para ser consistente
    currentClient: null, // Armazena o cliente selecionada
    loading: false,

    fetchClient: async (token) => {
        set({ loading: true });
        try {
            const data = await ClientService.getAll()

            set({ clients: Array.isArray(data) ? data : [], loading: false });
        } catch (error) {
            console.error("Erro ao carregar clients:", error);
            set({ loading: false });
        }
    },

    fetchClientById: async (token, id) => {
        set({ loading: true });
        try {
            const data = await ClientService.getById(id)
            set({ currentClient: data, loading: false });
        } catch (error) {
            console.error("Erro ao carregas detalhes:", error);
            set({ loading: false});
        }
    },

    addClient: async (token, novoClient) => {
        set({ loading: true });
        try {
            await ClientService.create(novoClient)
            await get().fetchClient(token);
            set({ loading: false });
            return { sucesso: true };
        } catch (error) {
            set({ loading: false });
            return { sucesso: false, mensagem: error.message };
        }
    },

    updateClient: async (token, id, clientAtualizado) => {
        set({ loading: true });
        try {
            await ClientService.update(id, clientAtualizado)

            set((state) => ({
                clients: state.clients.map(c => c.id === id ? { ...c, ...clientAtualizado } : c),
                currentClient: state.currentClient?.id === id ? { ...state.currentClient, ...clientAtualizado } : state.currentClient,
                loading: false
            }));

            return { sucesso: true }; // Retorna objeto de sucesso
        } catch (error) {
            set({ loading: false });
            // Se a validação falhar, o error.message terá as mensagens do DTO
            return { sucesso: false, mensagem: error.message };
        }
    },

    softDeleteClient: async (token, id) => {
        set({ loading: true });
        try {
            await ClientService.delete(id)

            set((state) => ({
                clients: state.clients.map(c => c.id === id ? { ...c, ativo: false } : c),
                currentClient: state.currentClient?.id === id ? { ...state.currentClient, ativo: false } : state.currentClient,
                loading: false
            }));

            return true;
        } catch (error) {
            console.error("Erro ao eliminar cliente:", error);
            set({ loading: false });
            return false;
        }
    }

}));

export default useClientStore;






