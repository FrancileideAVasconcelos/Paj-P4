import tokenStore from '../store/tokenStore';

/**
 * URL base para as chamadas à API REST.
 * @constant {string}
 */
const BASE_URL = 'http://localhost:8080/projeto4/rest';

/**
 * Função utilitária centralizada para realizar requisições HTTP utilizando fetch.
 * Gere automaticamente cabeçalhos de autenticação e parsing de erros.
 * * @async
 * @function apiRequest
 * @param {string} endpoint - O caminho do recurso (ex: '/users/profile').
 * @param {Object} [options={}] - Configurações adicionais do fetch (method, headers, body).
 * @returns {Promise<any>} Promessa com os dados da resposta formatados em JSON ou texto.
 * @throws {Error} Lança um erro se a resposta não for bem-sucedida ou a sessão expirar.
 */
const apiRequest = async (endpoint, options = {}) => {
    const { token } = tokenStore.getState();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) headers['token'] = token;

    const config = { ...options, headers };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (response.status === 401) {
            tokenStore.getState().logout();
            throw new Error("Sessão expirada.");
        }

        // 1. Lemos a resposta primeiro como texto
        const text = await response.text();

        if (!response.ok) {
            throw new Error(text || `Erro: ${response.status}`);
        }

        try {
            return text ? JSON.parse(text) : null;
        } catch (e) {
            return text;
        }
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

/**
 * Objeto que expõe métodos HTTP básicos (GET, POST, PUT, DELETE, PATCH).
 * @namespace api
 */
export const api = {
    /** Realiza uma requisição GET. */
    get: (url, options = {}) => apiRequest(url, { method: 'GET', ...options }),
    /** Realiza uma requisição POST com corpo em JSON. */
    post: (url, body, options = {}) => apiRequest(url, { method: 'POST', body: JSON.stringify(body), ...options }),
    /** Realiza uma requisição PUT com corpo em JSON. */
    put: (url, body, options = {}) => apiRequest(url, { method: 'PUT', body: JSON.stringify(body), ...options }),
    /** Realiza uma requisição DELETE. */
    delete: (url, options = {}) => apiRequest(url, { method: 'DELETE', ...options }),
    /** Realiza uma requisição PATCH com corpo em JSON. */
    patch: (endpoint, body, options = {}) => apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),
};


// ==========================================
// CAMADAS DE SERVIÇO
// ==========================================

/**
 * Serviços relacionados com a gestão de conta do próprio utilizador.
 * @namespace UserService
 */
export const UserService = {
    /** Procura o perfil do utilizador autenticado. */
    getprofile: () => api.get('/users/profile'),
    /** Verifica se a password atual é válida enviando-a pelo cabeçalho. */
    checkPassword: (passAtual) => api.get('/users/checkPass', { headers: { passatual: passAtual } }),
    /** Atualiza os dados do perfil do utilizador. */
    updateProfile: (data) => api.patch('/users/perfil', data),
}

/**
 * Serviços exclusivos para utilizadores com perfil de Administrador.
 * @namespace AdminService
 */
export const AdminService = {
    /** Lista todos os utilizadores do sistema. */
    getAllUsers: () => api.get('/admin/users'),
    /** Lista os clientes associados a um utilizador específico. */
    getUserClients: (username) => api.get(`/admin/users/${username}/clients`),
    /** Lista as leads associadas a um utilizador específico. */
    getUserLeads: (username) => api.get(`/admin/users/${username}/leads`),
    /** Inativa ou apaga permanentemente um utilizador. */
    deleteUser: (username, permanente) => api.delete(`/admin/users/${username}?permanente=${permanente}`),
    /** Reativa a conta de um utilizador inativo. */
    reactivateUser: (username) => api.patch(`/admin/users/${username}/reactivate`, {}),

    /** Altera o estado de um item (Lead ou Cliente) entre ativo/inativo. */
    toggleItemStatus: (type, id, isAtivo) =>
        isAtivo ? api.delete(`/admin/${type}s/${id}?permanente=false`)
            : api.patch(`/admin/${type}s/${id}/reactivate`, {}),

    /** Remove permanentemente um item (Lead ou Cliente) da base de dados. */
    deleteItemPermanent: (type, id) => api.delete(`/admin/${type}s/${id}?permanente=true`),

    /** Inativa ou reativa todos os itens de um determinado tipo de um utilizador. */
    toggleAllItemsStatus: (username, type, inativar) =>
        inativar ? api.delete(`/admin/users/${username}/${type}s?permanente=false`)
            : api.patch(`/admin/users/${username}/${type}s/reactivate`, {}),

    /** Remove permanentemente todos os itens de um determinado tipo de um utilizador. */
    deleteAllItemsPermanent: (username, type) => api.delete(`/admin/users/${username}/${type}s?permanente=true`),
    /** Permite ao Admin editar dados de um cliente de qualquer utilizador. */
    editClient: (id, data) => api.patch(`/admin/clients/${id}`, data),
    /** Permite ao Admin editar dados de uma lead de qualquer utilizador. */
    editLead: (id, data) => api.patch(`/admin/leads/${id}`, data),
};

/**
 * Serviços para gestão de Clientes por parte do utilizador comum.
 * @namespace ClientService
 */
export const ClientService = {
    /** Lista os clientes do próprio utilizador. */
    getAll: () => api.get('/clients'),
    /** Obtém detalhes de um cliente específico pelo ID. */
    getById: (id) => api.get(`/clients/${id}`),
    /** Cria um novo cliente associado ao utilizador autenticado. */
    create: (data) => api.post('/clients', data),
    /** Atualiza os dados de um cliente. */
    update: (id, data) => api.patch(`/clients/${id}`, data),
    /** Inativa um cliente. */
    delete: (id) => api.delete(`/clients/${id}`),
};

/**
 * Serviços para gestão de Leads por parte do utilizador comum.
 * @namespace LeadService
 */
export const LeadService = {
    /** Lista as leads do utilizador, permitindo filtragem opcional por estado. */
    getAll: (filtro) => api.get(`/leads${filtro ? `?estado=${filtro}` : ''}`),
    /** Obtém detalhes de uma lead específica pelo ID. */
    getById: (id) => api.get(`/leads/${id}`),
    /** Cria uma nova lead associada ao utilizador autenticado. */
    create: (data) => api.post('/leads', data),
    /** Atualiza os dados de uma lead. */
    update: (id, data) => api.patch(`/leads/${id}`, data),
    /** Inativa uma lead. */
    delete: (id) => api.delete(`/leads/${id}`),
};