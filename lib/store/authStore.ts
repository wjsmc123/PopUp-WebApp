'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile, EventConfig } from '@/types';

interface AuthState {
  user: UserProfile | null;
  eventData: EventConfig | null;
  isHydrated: boolean;
  setUser: (user: UserProfile | null) => void;
  setEventData: (event: EventConfig | null) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      eventData: null,
      isHydrated: false,
      setUser: (user) => set({ user }),
      setEventData: (event) => set({ eventData: event }),
      logout: () => set({ user: null, eventData: null }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'popup-hotel-auth',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
    }
  )
);
