import { create } from 'zustand';
import {api} from "../services/api.js";

// useLeadStore.js
const useLeadStore = create((set, get) => ({
    leads: [],
    currentLead: null, // Armazena a lead selecionada
    loading: false,

    fetchLeads: async (token, estado = "") => {
        set({ loading: true });
        try {
            // A 'api' já faz o fetch e o processamento
            // Nota: Corrigi o '=' que faltava no teu código original
            const data = await api.get(`/leads?estado=${estado}`);

            // 'data' já são as leads, não precisas de .ok nem .json()!
            set({ leads: Array.isArray(data) ? data : [], loading: false });
        } catch (error) {
            console.error("Erro ao carregar leads:", error);
            set({ loading: false });
        }
    },

    fetchLeadById: async (token, id) => {
        set({ loading: true });
        try {
            const data = await api.get(`/leads/${id}`); // Rota do teu backend
            set({ currentLead: data, loading: false });
        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
            set({ loading: false });
        }
    },

    addLead: async (token, novaLead) => {
        set({ loading: true });
        try {
            // Se o Java devolver "Lead adicionada...", o 'api.post' lida com isso
            await api.post('/leads', novaLead);

            // Recarrega a lista para mostrar a nova lead
            await get().fetchLeads(token);
            set({ loading: false });
            return true;
        } catch (error) {
            console.error("Erro ao criar lead:", error);
            set({ loading: false });
            return false;
        }
    },


    updateLead: async (token, id, leadAtualizada) => {
        set({ loading: true });
        try {
            // Agora o api.patch já deve funcionar!
            await api.patch(`/leads/${id}`, leadAtualizada);

            await get().fetchLeadById(token, id); // Recarrega os detalhes
            await get().fetchLeads(token);       // Recarrega a lista global

            set({ loading: false });
            return true;
        } catch (error) {
            console.error("Erro ao atualizar lead:", error);
            set({ loading: false });
            return false;
        }
    },

    softDeleteLead: async (token, id) => {
        set({ loading: true });
        try {
            // Chama o endpoint DELETE /leads/{id} do teu LeadService.java
            await api.delete(`/leads/${id}`);

            // Atualiza a lista localmente chamando o fetchLeads
            await get().fetchLeads(token);
            set({ loading: false });
            return true;
        } catch (error) {
            console.error("Erro ao eliminar lead:", error);
            set({ loading: false });
            return false;
        }
    }

}));

export default useLeadStore;