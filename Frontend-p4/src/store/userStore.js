import { create } from 'zustand';
import {api} from "../services/api.js";


const useUserStore = create((set,get ) => ({
    currentUser: null, // Aqui vamos guardar o UserDto

    fetchCurrentUser: async (token) => {
        try {
            const response = await api.get('/users/profile', {
                headers: { token: token }
            });

            set({ currentUser: response });

        } catch (error) {
            console.error("Erro ao buscar perfil:", error);
            set({ currentUser: null });
        }
    },

    checkCurrentPassword: async (token, passAtual) => {
        try {
            await api.get('/users/checkPass', {
                headers: {
                    token: token,
                    passatual: passAtual // 1. TUDO EM MINÚSCULAS AQUI TAMBÉM!
                }
            });
            return { sucesso: true };
        } catch (error) {
            // Agora o erro que chega aqui será o nosso 403 e a mensagem é capturada!
            return { sucesso: false, mensagem: "A password atual está incorreta." };
        }
    },

    updateUserProfile: async (token, novosDados) => {
        set({ loading: true });
        try {
            await api.patch('/users/perfil', novosDados, { headers: { token } });

            await get().fetchCurrentUser(token);

            set({ loading: false });
            return { sucesso: true };
        } catch (error) {
            set({ loading: false });
            return { sucesso: false, mensagem: error.message };
        }
    },


    clearUser: () => set({ currentUser: null })
}));

export default useUserStore;