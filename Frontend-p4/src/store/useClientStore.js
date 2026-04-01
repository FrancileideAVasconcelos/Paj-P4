/**
 * @file useClientStore.js
 * @description Store do Zustand para a gestão de Clientes.
 * Responsável por armazenar a lista de clientes, gerir o cliente selecionado e as operações de CRUD.
 */

import { create } from 'zustand';
import { ClientService } from "../services/api.js";

/**
 * Store global para a gestão de clientes.
 * * @typedef {Object} ClientStore
 * @property {Array} clients - Lista de clientes carregados.
 * @property {Object|null} currentClient - Objeto contendo os detalhes do cliente selecionado.
 * @property {boolean} loading - Estado que indica se uma operação de rede está a decorrer.
 * @property {Function} fetchClient - Carrega todos os clientes associados ao utilizador.
 * @property {Function} fetchClientById - Carrega os detalhes de um cliente específico.
 * @property {Function} addClient - Adiciona um novo cliente ao sistema.
 * @property {Function} updateClient - Atualiza os dados de um cliente existente.
 * @property {Function} softDeleteClient - Inativa um cliente (remoção lógica).
 */

const useClientStore = create((set, get) => ({
    /** Lista de objetos de clientes. */
    clients: [],
    /** Cliente selecionado para visualização ou edição. */
    currentClient: null,
    /** Indica se a aplicação está a aguardar uma resposta da API. */
    loading: false,

    /**
     * Procura a lista de clientes do utilizador através do ClientService.
     * * @async
     * @function fetchClient
     * @param {string} token - Token de autenticação (gerido internamente pela api.js).
     * @returns {Promise<void>}
     */
    fetchClient: async (token) => {
        set({ loading: true });
        try {
            const data = await ClientService.getAll();
            set({ clients: Array.isArray(data) ? data : [], loading: false });
        } catch (error) {
            console.error("Erro ao carregar clients:", error);
            set({ loading: false });
        }
    },

    /**
     * Obtém os dados detalhados de um cliente pelo seu identificador único.
     * * @async
     * @function fetchClientById
     * @param {string} token - Token de autenticação.
     * @param {number|string} id - ID do cliente.
     * @returns {Promise<void>}
     */
    fetchClientById: async (token, id) => {
        set({ loading: true });
        try {
            const data = await ClientService.getById(id);
            set({ currentClient: data, loading: false });
        } catch (error) {
            console.error("Erro ao carregas detalhes:", error);
            set({ loading: false});
        }
    },

    /**
     * Cria um novo cliente e atualiza a lista local em caso de sucesso.
     * * @async
     * @function addClient
     * @param {string} token - Token de autenticação.
     * @param {Object} novoClient - Dados do novo cliente a criar.
     * @returns {Promise<{sucesso: boolean, mensagem?: string}>}
     */
    addClient: async (token, novoClient) => {
        set({ loading: true });
        try {
            await ClientService.create(novoClient);
            // Sincroniza a lista local com os dados do servidor
            await get().fetchClient(token);
            set({ loading: false });
            return { sucesso: true };
        } catch (error) {
            set({ loading: false });
            return { sucesso: false, mensagem: error.message };
        }
    },

    /**
     * Atualiza os dados de um cliente e reflete as alterações imediatamente no estado local.
     * * @async
     * @function updateClient
     * @param {string} token - Token de autenticação.
     * @param {number|string} id - ID do cliente a atualizar.
     * @param {Object} clientAtualizado - Objeto com os novos dados do cliente.
     * @returns {Promise<{sucesso: boolean, mensagem?: string}>}
     */
    updateClient: async (token, id, clientAtualizado) => {
        set({ loading: true });
        try {
            await ClientService.update(id, clientAtualizado);

            set((state) => ({
                // Mapeia a lista para atualizar apenas o cliente editado
                clients: state.clients.map(c => c.id === id ? { ...c, ...clientAtualizado } : c),
                // Se estivermos na página de detalhes do cliente editado, atualiza o currentClient
                currentClient: state.currentClient?.id === id ? { ...state.currentClient, ...clientAtualizado } : state.currentClient,
                loading: false
            }));

            return { sucesso: true };
        } catch (error) {
            set({ loading: false });
            return { sucesso: false, mensagem: error.message };
        }
    },

    /**
     * Efetua a inativação de um cliente (soft delete) no servidor e atualiza o estado local.
     * * @async
     * @function softDeleteClient
     * @param {string} token - Token de autenticação.
     * @param {number|string} id - ID do cliente a inativar.
     * @returns {Promise<boolean>} Retorna true se a operação foi bem-sucedida.
     */
    softDeleteClient: async (token, id) => {
        set({ loading: true });
        try {
            await ClientService.delete(id);

            set((state) => ({
                // Atualiza a flag 'ativo' localmente para evitar um novo fetch
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