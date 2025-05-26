import create from 'zustand';

export const useAppStore = create((set) => ({
  dopen: true,
  mode: 'light',
  primaryColor: '#283593',
  notificationsEnabled: true,
  UpdateOpen: (dopen) => set({ dopen }),
  toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
  setPrimaryColor: (color) => set({ primaryColor: color }),
  toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
}));