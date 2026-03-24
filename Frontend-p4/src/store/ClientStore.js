import { create } from 'zustand';
import {api} from "../services/api.js";


const clientStore = create((set, get) => ({
    clients: [], // Nome no plural para ser consistente
    currentClient: null, // Armazena o cliente selecionada
    loading: false,

    fetchClient: async (token) => {
        set({ loading: true });
        try {
            // O serviço 'api' já trata o token e o response.ok
            const data = await api.get('/clients');

            set({ clients: Array.isArray(data) ? data : [], loading: false });
        } catch (error) {
            console.error("Erro ao carregar clients:", error);
            set({ loading: false });
        }
    },

    fetchClientById: async (token, id) => {
        set({ loading: true });
        try {
            const data = await api.get(`/clients/${id}`);
            set({ currentClient: data, loading: false });
        } catch (error) {
            console.error("Erro ao carregas detalhes:", error);
            set({ loading: false});
        }
    },

    addClient: async (token, novoClient) => {
        set({ loading: true });
        try {
            await api.post('/clients', novoClient);
            await get().fetchClient(token);
            set({ loading: false });
            return { sucesso: true }; // Devolvemos um objeto em vez de apenas true
        } catch (error) {
            set({ loading: false });
            // Se a validação falhar, o error.message terá as mensagens do DTO
            return { sucesso: false, mensagem: error.message };
        }
    },

    updateClient: async (token, id, clientAtualizado) => {
        set({ loading: true });
        try {
            await api.patch(`/clients/${id}`, clientAtualizado);
            await get().fetchClientById(token, id);
            await get().fetchClient(token);
            set({ loading: false });
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
            // Chama o endpoint DELETE /leads/{id} do teu LeadService.java
            await api.delete(`/clients/${id}`);

            // Atualiza a lista localmente chamando o fetchLeads
            await get().fetchClient(token);
            set({ loading: false });
            return true;
        } catch (error) {
            console.error("Erro ao eliminar cliente:", error);
            set({ loading: false });
            return false;
        }
    }

}));

export default clientStore;






