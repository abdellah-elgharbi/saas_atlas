'use client';

import { useState, useEffect } from 'react';
import { storageService } from '@/services/storage';
import { Contact } from '@/types';

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

  const LIMIT = 50;

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    const user = await storageService.getUser();
    const views = user.dailyContactViews || 0;
    setViewsToday(views);
    setCachedContacts(user.cachedContacts || []);
    // Only set limitReached if views are actually >= LIMIT (not just initialized)
    setLimitReached(views >= LIMIT);
    setIsLoading(false);
  };

  const addViews = async (newContacts: Contact[]): Promise<boolean> => {
    // Optimistic check
    if (viewsToday >= LIMIT) {
      setLimitReached(true);
      return false;
    }

    const count = newContacts.length;
    // Call storage to persist and get updated status
    const result = await storageService.incrementViewCount(count, newContacts);
    
    // Update local state
    setViewsToday(result.count);
    
    // Refresh cache from storage (to get the deduplicated list)
    const updatedUser = await storageService.getUser();
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