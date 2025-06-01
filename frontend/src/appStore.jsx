import { create } from "zustand";
import { persist } from "zustand/middleware";

let appStore = (set) => ({
    dopen: true,
    UpdateOpen: (dopen) => set((state) => ({ dopen: dopen })),
    
    // Ajoutez ces états pour le mode sombre
    mode: 'light', // 'light' ou 'dark'
    toggleMode: () => set((state) => ({
        mode: state.mode === 'light' ? 'dark' : 'light'
    })),
    
    // Exemple d'autres états que vous pourriez avoir
    notificationsEnabled: true,
    toggleNotifications: () => set((state) => ({
        notificationsEnabled: !state.notificationsEnabled
    })),
});

appStore = persist(appStore, {
    name: 'app-storage', // Nom pour le stockage local
    // Vous pouvez spécifier quels états persister si nécessaire
    // partialize: (state) => ({ mode: state.mode }),
});

export const useAppStore = create(appStore);