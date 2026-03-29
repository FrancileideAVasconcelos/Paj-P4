import tokenStore from '../store/tokenStore';
import {data} from "react-router-dom";

const BASE_URL = 'http://localhost:8080/projeto4/rest';

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

export const api = {
    get: (url, options = {}) => apiRequest(url, { method: 'GET', ...options }),
    post: (url, body, options = {}) => apiRequest(url, { method: 'POST', body: JSON.stringify(body), ...options }),
    put: (url, body, options = {}) => apiRequest(url, { method: 'PUT', body: JSON.stringify(body), ...options }),
    delete: (url, options = {}) => apiRequest(url, { method: 'DELETE', ...options }),
    patch: (endpoint, body, options = {}) => apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),
};


// ==========================================
// CAMADAS DE SERVIÇO
// ==========================================

export const UserService = {
    getprofile: () => api.get('/users/profile'),
    checkPassword: (passAtual) => api.get('/users/checkPass', {
        headers: { passatual: passAtual }
    }),

    updateProfile: (data) => api.patch('/users/perfil', data),


}

export const AdminService = {
    getAllUsers: () => api.get('/admin/users'),
    getUserClients: (username) => api.get(`/admin/users/${username}/clients`),
    getUserLeads: (username) => api.get(`/admin/users/${username}/leads`),
    deleteUser: (username, permanente) => api.delete(`/admin/users/${username}?permanente=${permanente}`),
    reactivateUser: (username) => api.patch(`/admin/users/${username}/reactivate`, {}),
    // Funções Unificadas
    toggleItemStatus: (type, id, isAtivo) =>
        isAtivo ? api.delete(`/admin/${type}s/${id}?permanente=false`)
            : api.patch(`/admin/${type}s/${id}/reactivate`, {}),

    deleteItemPermanent: (type, id) => api.delete(`/admin/${type}s/${id}?permanente=true`),

    toggleAllItemsStatus: (username, type, inativar) =>
        inativar ? api.delete(`/admin/users/${username}/${type}s?permanente=false`)
            : api.patch(`/admin/users/${username}/${type}s/reactivate`, {}),

    deleteAllItemsPermanent: (username, type) => api.delete(`/admin/users/${username}/${type}s?permanente=true`),
    editClient: (id, data) => api.patch(`/admin/clients/${id}`, data),
    editLead: (id, data) => api.patch(`/admin/leads/${id}`, data),
};

export const ClientService = {
    getAll: () => api.get('/clients'),
    getById: (id) => api.get(`/clients/${id}`),
    create: (data) => api.post('/clients', data),
    update: (id, data) => api.patch(`/clients/${id}`, data),
    delete: (id) => api.delete(`/clients/${id}`),
};

export const LeadService = {
    getAll: (filtro) => api.get(`/leads${filtro ? `?estado=${filtro}` : ''}`),
    getById: (id) => api.get(`/leads/${id}`),
    create: (data) => api.post('/leads', data),
    update: (id, data) => api.patch(`/leads/${id}`, data),
    delete: (id) => api.delete(`/leads/${id}`),
};