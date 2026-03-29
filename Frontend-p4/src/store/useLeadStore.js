import { create } from 'zustand';
import { LeadService } from "../services/api.js";

const useLeadStore = create((set, get) => ({
    leads: [],
    currentLead: null, // Armazena a lead selecionada
    loading: false,

    fetchLeads: async (token, estado = "") => {
        set({ loading: true });
        try {
            const data = await LeadService.getAll(estado)
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
            const data = await LeadService.getById(id)
            set({ currentLead: data, loading: false });
        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
            set({ loading: false });
        }
    },

    addLead: async (token, novaLead) => {
        set({ loading: true });
        try {
            await LeadService.create(novaLead)
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
            await LeadService.update(id, leadAtualizada)

            set((state) => ({
                leads: state.leads.map(l => l.id === id ? { ...l, ...leadAtualizada } : l),
                currentLead: state.currentLead?.id === id ? { ...state.currentLead, ...leadAtualizada } : state.currentLead,
                loading: false
            }));

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
            await LeadService.delete(id)

            set((state) => ({
                leads: state.leads.map(l => l.id === id ? { ...l, ativo: false } : l),
                currentLead: state.currentLead?.id === id ? { ...state.currentLead, ativo: false } : state.currentLead,
                loading: false
            }));

            return true;
        } catch (error) {
            console.error("Erro ao eliminar lead:", error);
            set({ loading: false });
            return false;
        }
    }

}));

export default useLeadStore;