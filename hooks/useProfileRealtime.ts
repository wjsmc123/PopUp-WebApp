'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/authStore';
import { mapProfile } from '@/lib/utils';
import type { DatabaseProfile } from '@/types';

export function useProfileRealtime(userId?: string) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`profile-updates-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            setUser(mapProfile(payload.new as DatabaseProfile));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, setUser]);
}
