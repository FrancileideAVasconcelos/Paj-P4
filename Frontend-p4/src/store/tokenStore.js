import { create } from 'zustand';

const tokenStore = create((set) => ({
    // Começamos por verificar se já existe um token guardado no LocalStorage
    token: localStorage.getItem('token') || null,

    // Função para fazer o login (guarda o token no estado e no LocalStorage)
    login: (newToken) => {
        localStorage.setItem('token', newToken);
        set({ token: newToken });
    },

    // Função para fazer logout (limpa tudo)
    logout: () => {
        localStorage.removeItem('token');
        set({ token: null });
    }
}));

export default tokenStore;