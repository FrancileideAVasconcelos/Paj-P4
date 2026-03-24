import tokenStore from '../store/tokenStore';

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

        // 2. Tentamos converter para JSON, se falhar, devolvemos o texto original
        try {
            return text ? JSON.parse(text) : null;
        } catch (e) {
            return text; // Retorna a String "Lead adicionada..." sem dar erro
        }
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

// Helpers para facilitar o uso (AGORA ACEITAM OPÇÕES EXTRA COMO HEADERS)
export const api = {
    get: (url, options = {}) => apiRequest(url, { method: 'GET', ...options }),

    post: (url, body, options = {}) => apiRequest(url, { method: 'POST', body: JSON.stringify(body), ...options }),

    put: (url, body, options = {}) => apiRequest(url, { method: 'PUT', body: JSON.stringify(body), ...options }),

    delete: (url, options = {}) => apiRequest(url, { method: 'DELETE', ...options }),

    patch: (endpoint, body, options = {}) => apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),
};