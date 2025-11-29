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

  // Timer exact: calculer le temps restant et programmer la réinitialisation
  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const refreshLimit = async () => {
      try {
        const resp = await fetch(`/api/limits?userId=${encodeURIComponent(user.id)}`);
        if (!resp.ok) throw new Error(`API error: ${resp.status}`);
        
        const json = await resp.json();
        const meta = json?.meta || null;
        const timeLeft = json?.timeLeft || 0;
        const viewedIds: string[] = meta?.viewedContactIds || [];
        const views = viewedIds.length;
        
        console.log(`🔄 Refresh limit: views=${views}, timeLeft=${timeLeft}ms`);
        
        // Mettre à jour l'état
        setViewsToday(views);
        setLimitReached(views >= LIMIT);
        
        if (views < LIMIT) {
          setCachedContacts([]);
          setLimitReached(false);
        }
        
        // Si timeLeft > 0, programmer le prochain refresh exactement au moment de la réinitialisation
        if (timeLeft > 0) {
          console.log(`⏰ Timer programmé: réinitialisation dans ${timeLeft}ms (${Math.round(timeLeft / 1000 / 60)} minutes)`);
          timeoutId = setTimeout(() => {
            refreshLimit();
          }, timeLeft);
        }
      } catch (error) {
        console.error('Erreur lors du refresh du limit:', error);
      }
    };

    // Initialiser le timer
    refreshLimit();

    // Cleanup: annuler le timer si le composant se démonte ou les dépendances changent
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id]);

  const loadState = async () => {
    try {
      const usr = await supabaseService.getUser(user?.id);
      const views = usr.dailyContactViews || 0;
      setViewsToday(views);
      setCachedContacts(usr.cachedContacts || []);
      setLimitReached(views >= LIMIT);
      
      // Si limitReached, on va programmer le timer via le useEffect ci-dessus
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