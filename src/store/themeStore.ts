import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  mode: 'light' | 'dark';
  isMacOS: boolean;
  toggleMode: () => void;
  toggleMacOS: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      isMacOS: false,
      toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
      toggleMacOS: () => set((state) => ({ isMacOS: !state.isMacOS })),
    }),
    {
      name: 'tms-theme-storage',
    }
  )
);
