import { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';

// Hook pour utiliser toujours Supabase
export const useDataService = () => {
  return supabaseService;
};
