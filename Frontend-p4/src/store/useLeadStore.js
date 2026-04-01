/**
 * @file useLeadStore.js
 * @description Store do Zustand para a gestão de Leads (potenciais clientes).
 * Controla a listagem, criação, atualização e remoção lógica de leads do utilizador.
 */

import { create } from 'zustand';
import { LeadService } from "../services/api.js";

/**
 * Store global para a gestão de leads.
 * * @typedef {Object} LeadStore
 * @property {Array} leads - Lista de leads carregadas do servidor.
 * @property {Object|null} currentLead - Dados da lead selecionada para visualização detalhada ou edição.
 * @property {boolean} loading - Indica se uma operação assíncrona está em curso.
 * @property {Function} fetchLeads - Procura a lista de leads, com filtragem opcional.
 * @property {Function} fetchLeadById - Procura os detalhes de uma única lead.
 * @property {Function} addLead - Envia uma nova lead para o servidor.
 * @property {Function} updateLead - Atualiza os dados de uma lead existente.
 * @property {Function} softDeleteLead - Realiza a inativação (remoção lógica) de uma lead.
 */

const useLeadStore = create((set, get) => ({
    /** Lista de leads do utilizador. */
    leads: [],
    /** Lead atualmente selecionada. */
    currentLead: null,
    /** Estado de carregamento. */
    loading: false,

    /**
     * Procura todas as leads associadas ao utilizador.
     * Permite filtrar por estado (ex: Aberta, Ganha, Perdida).
     * * @async
     * @function fetchLeads
     * @param {string} token - Token de autenticação (não utilizado diretamente devido à configuração da api.js).
     * @param {string} [estado=""] - Filtro de estado para a listagem.
     * @returns {Promise<void>}
     */
    fetchLeads: async (token, estado = "") => {
        set({ loading: true });
        try {
            const data = await LeadService.getAll(estado);
            set({ leads: Array.isArray(data) ? data : [], loading: false });
        } catch (error) {
            console.error("Erro ao carregar leads:", error);
            set({ loading: false });
        }
    },

    /**
     * Obtém os detalhes completos de uma lead específica através do seu ID.
     * * @async
     * @function fetchLeadById
     * @param {string} token - Token de autenticação.
     * @param {number|string} id - O identificador único da lead.
     * @returns {Promise<void>}
     */
    fetchLeadById: async (token, id) => {
        set({ loading: true });
        try {
            const data = await LeadService.getById(id);
            set({ currentLead: data, loading: false });
        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
            set({ loading: false });
        }
    },

    /**
     * Cria uma nova lead no sistema.
     * Após a criação, atualiza automaticamente a lista local de leads.
     * * @async
     * @function addLead
     * @param {string} token - Token de autenticação.
     * @param {Object} novaLead - Objeto contendo os dados da nova lead.
     * @returns {Promise<boolean>} Retorna true se a operação for bem-sucedida.
     */
    addLead: async (token, novaLead) => {
        set({ loading: true });
        try {
            await LeadService.create(novaLead);
            // Recarrega a lista para refletir a nova lead na UI
            await get().fetchLeads(token);
            set({ loading: false });
            return true;
        } catch (error) {
            console.error("Erro ao criar lead:", error);
            set({ loading: false });
            return false;
        }
    },

    /**
     * Atualiza os dados de uma lead existente no servidor e sincroniza o estado local.
     * * @async
     * @function updateLead
     * @param {string} token - Token de autenticação.
     * @param {number|string} id - ID da lead a ser editada.
     * @param {Object} leadAtualizada - Novos dados para a lead.
     * @returns {Promise<boolean>} Retorna true se a atualização for concluída com sucesso.
     */
    updateLead: async (token, id, leadAtualizada) => {
        set({ loading: true });
        try {
            await LeadService.update(id, leadAtualizada);

            set((state) => ({
                // Atualiza a lead dentro da lista de leads
                leads: state.leads.map(l => l.id === id ? { ...l, ...leadAtualizada } : l),
                // Se a lead atualizada for a que está a ser visualizada, atualiza o detalhe
                currentLead: state.currentLead?.id === id ? { ...state.currentLead, ...leadAtualizada } : state.currentLead,
                loading: false
            }));

            return true;
        } catch (error) {
            console.error("Erro ao atualizar lead:", error);
            set({ loading: false });
            return false;
        }
    },

    /**
     * Realiza a eliminação lógica (inativação) de uma lead.
     * Altera a flag 'ativo' para false no servidor e no estado local.
     * * @async
     * @function softDeleteLead
     * @param {string} token - Token de autenticação.
     * @param {number|string} id - ID da lead a ser inativada.
     * @returns {Promise<boolean>} Retorna true se a inativação for concluída.
     */
    softDeleteLead: async (token, id) => {
        set({ loading: true });
        try {
            await LeadService.delete(id);

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