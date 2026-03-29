import { create } from 'zustand';
import {UserService} from "../services/api.js";


const useUserStore = create((set,get ) => ({
    currentUser: null, // Aqui vamos guardar o UserDto

    fetchCurrentUser: async () => {
        try {
            const response = await UserService.getprofile();
            set({ currentUser: response });

        } catch (error) {
            console.error("Erro ao buscar perfil:", error);
            set({ currentUser: null });
        }
    },

    checkCurrentPassword: async (passAtual) => {
        try {
            await UserService.checkPassword(passAtual);
            return { sucesso: true };
        } catch (error) {
            // Agora o erro que chega aqui será o nosso 403 e a mensagem é capturada!
            return { sucesso: false, mensagem: "A password atual está incorreta." };
        }
    },

    updateUserProfile: async (token, novosDados) => {
        set({ loading: true });
        try {
            await UserService.updateProfile(novosDados);
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