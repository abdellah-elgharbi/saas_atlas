'use client';

import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Contact } from '@/types';
import { useUser } from '@clerk/nextjs';

interface UseDailyLimitReturn {
  viewsToday: number;
  limitReached: boolean;
  cachedContacts: Contact[];
  addViews: (contacts: Contact[]) => Promise<boolean>;
  isLoading: boolean;
}

export const useDailyLimit = (): UseDailyLimitReturn => {
  const [viewsToday, setViewsToday] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [cachedContacts, setCachedContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded } = useUser();

  const LIMIT = 50;
  const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

  useEffect(() => {
    if (!isLoaded) return;
    loadState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id]);

  // Polling: vérifier toutes les 5 secondes si le limit a été réinitialisé
  // Polling: vérifier toutes les 5 secondes si le limit a été réinitialisé
  useEffect(() => {
    if (!isLoaded || !limitReached || !user?.id) return;

    const interval = setInterval(async () => {
      try {
        // Appel DIRECT à Clerk via /api/limits (pas Supabase)
        const resp = await fetch(`/api/limits?userId=${encodeURIComponent(user.id)}`);
        if (!resp.ok) throw new Error(`API error: ${resp.status}`);
        
        const json = await resp.json();
        const meta = json?.meta || null;
        const viewedIds: string[] = meta?.viewedContactIds || [];
        const views = viewedIds.length;
        
        console.log(`📊 Polling: views=${views}, LIMIT=50, firstViewAt=${meta?.firstViewAt}`);
        
        // ✅ Si views < LIMIT, c'est que la fenêtre s'est réinitialisée
        if (views < LIMIT) {
          console.log('✅ FENÊTRE RÉINITIALISÉE! Compteur passé de 50 à ' + views);
          setViewsToday(views);
          setCachedContacts([]);
          setLimitReached(false);
        }
      } catch (error) {
        console.error('Erreur lors du polling du limit:', error);
      }
    }, 5000); // Vérifier toutes les 5 secondes

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, limitReached, user?.id]);

  const loadState = async () => {
    try {
      const usr = await supabaseService.getUser(user?.id);
      const views = usr.dailyContactViews || 0;
      setViewsToday(views);
      setCachedContacts(usr.cachedContacts || []);
      setLimitReached(views >= LIMIT);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'état:', error);
    }
    setIsLoading(false);
  };

  const addViews = async (newContacts: Contact[]): Promise<boolean> => {
    // Optimistic check
    if (viewsToday >= LIMIT) {
      setLimitReached(true);
      return false;
    }

    const count = newContacts.length;

    // Call storage / Clerk API to persist and get updated status
    let result;
    if (user?.id) {
      result = await supabaseService.incrementViewCount(user.id, count, newContacts);
    } else {
      result = await supabaseService.incrementViewCount(count, newContacts);
    }

    // Update local state
    setViewsToday(result.count);

    // Refresh cache from storage (to get the deduplicated list)
    const updatedUser = await supabaseService.getUser(user?.id);
    setCachedContacts(updatedUser.cachedContacts);

    // If the result says we are now over the limit (or equal), we trigger the state
    if (result.count >= LIMIT) {
      setLimitReached(true);
      return false; // Indicating that we have crossed the threshold
    }

    return true; // Still within limits
  };

  return {
    viewsToday,
    limitReached,
    cachedContacts,
    addViews,
    isLoading
  };
};