'use client';

import { useEffect, useState, useRef } from 'react';
import { storageService } from '@/services/storage';
import { Contact, Agency } from '@/types';
import { Button, Card } from '@/components/ui/Components';
import { LimitModal } from '@/components/ui/LimitModal';
import { useDailyLimit } from '@/hooks/useDailyLimit';
import { ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function Contacts() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { viewsToday, limitReached, cachedContacts, addViews, isLoading: isLimitLoading } = useDailyLimit();
  
  const [displayContacts, setDisplayContacts] = useState<Contact[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isCachedMode, setIsCachedMode] = useState(false);
  
  // ✅ Track if we've shown the modal and initial load
  const hasShownModal = useRef(false);
  const isInitialLoad = useRef(true);
  const previousViewsToday = useRef(0);

  // DEBUG: Log state changes
  useEffect(() => {
    console.log('🔍 DEBUG STATE:', { 
      viewsToday, 
      limitReached, 
      isCachedMode,
      hasShownModal: hasShownModal.current,
      isInitialLoad: isInitialLoad.current,
      cachedContactsLength: cachedContacts.length 
    });
  }, [viewsToday, limitReached, isCachedMode, cachedContacts]);

  // Load Agencies once
  useEffect(() => {
    storageService.getAgencies().then(setAgencies);
  }, []);

  // ✅ FIXED: Only show modal when limit is FRESHLY reached (not on initial load)
  useEffect(() => {
    // Skip initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      previousViewsToday.current = viewsToday;
      return;
    }

    // Only show modal if:
    // 1. Limit is reached
    // 2. We haven't shown the modal yet
    // 3. Views actually increased (wasn't already at 50)
    if (limitReached && !hasShownModal.current && previousViewsToday.current < 50 && viewsToday >= 50) {
      console.log('🚨 SHOWING MODAL - Limit just reached!');
      setShowModal(true);
      setIsCachedMode(true);
      hasShownModal.current = true;
    }

    previousViewsToday.current = viewsToday;
  }, [limitReached, viewsToday]);

  // Main Data Loading Logic
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);

      // If we are already in cached mode (limit reached), just show cache
      if (isCachedMode || (limitReached && viewsToday >= 50)) {
        console.log('📦 Using cached contacts');
        setDisplayContacts(cachedContacts);
        setTotal(cachedContacts.length);
        setLoadingData(false);
        return;
      }

      // Fetch 'Real' Data
      console.log('🔄 Fetching fresh data for page:', page);
      const res = await storageService.getContacts(page, 10);
      
      // Attempt to add views
      if (res.data.length > 0) {
        const currentViews = viewsToday;
        console.log(`📊 Current views: ${currentViews}, Adding: ${res.data.length}`);
        
        const success = await addViews(res.data);

        if (!success) {
          // ✅ Limit Hit during this fetch! Show modal immediately
          console.log('🛑 Limit reached during fetch, switching to cache');
          const user = await storageService.getUser();
          setDisplayContacts(user.cachedContacts); 
          setTotal(user.cachedContacts.length);
          
          // ✅ Trigger modal immediately when limit is hit
          if (!hasShownModal.current) {
            console.log('🚨 SHOWING MODAL NOW - Limit just hit!');
            setShowModal(true);
            hasShownModal.current = true;
          }
          setIsCachedMode(true);
        } else {
          // Limit OK
          console.log('✅ Views added successfully');
          setDisplayContacts(res.data);
          setTotal(res.total);
        }
      } else {
        setDisplayContacts([]);
      }
      
      setLoadingData(false);
    };

    if (!isLimitLoading && !isInitialLoad.current) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isLimitLoading, isCachedMode]);

  // Clerk middleware handles authentication
  if (!isClerkLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-primary-dark"></div>
        <p className="mt-4 text-slate-500">Loading...</p>
      </div>
    );
  }

  const totalPages = isCachedMode 
    ? 1 
    : Math.ceil(total / 10);

  if (isLimitLoading || loadingData) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[400px]">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-primary-dark"></div>
         <p className="mt-4 text-slate-500">Loading contacts...</p>
       </div>
     );
  }

  return (
    <div className="space-y-6">
      <LimitModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        viewsToday={viewsToday}
      />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Contacts Directory
            {isCachedMode && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full border border-amber-200">Offline / Cached Mode</span>}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isCachedMode 
              ? "Viewing only previously unlocked contacts." 
              : "Search and connect with educational leaders."}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg text-sm font-medium border ${
          limitReached 
            ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' 
            : 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
        }`}>
          Daily Limit: <span className="font-bold">{viewsToday}</span> / 50
        </div>
      </div>

      {isCachedMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">You are viewing cached data</h4>
            <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
              You have reached your daily limit. Only contacts you have already viewed today are visible below.
              Upgrade your plan to unlock unlimited access.
            </p>
          </div>
        </div>
      )}

      <Card className="overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Agency</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {displayContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No contacts available to display.
                  </td>
                </tr>
              ) : (
                displayContacts.map((contact) => {
                  const agencyName = agencies.find(a => a.id === contact.agency_id)?.name || 'Unknown Agency';
                  return (
                    <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{contact.first_name} {contact.last_name}</div>
                        <div className="text-xs text-slate-500">{contact.department}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{contact.title}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={agencyName}>
                         {agencyName}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                         {contact.email}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {contact.phone}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {!isCachedMode && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-500">
              Viewing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, total)}</span> of <span className="font-medium">{total}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} /> Previous
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
        {isCachedMode && (
           <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
             Showing all cached contacts ({displayContacts.length})
           </div>
        )}
      </Card>
    </div>
  );
}