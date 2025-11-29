'use client';

import { useEffect, useState, useRef } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Contact, Agency } from '@/types';
import { Button, Card } from '@/components/ui/Components';
import { LimitModal } from '@/components/ui/LimitModal';
import { useDailyLimit } from '@/hooks/useDailyLimit';
import { Database } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const ITEMS_PER_PAGE = 10;

export default function Contacts() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { viewsToday, limitReached, cachedContacts, addViews, isLoading: isLimitLoading } = useDailyLimit();
  
  const [displayContacts, setDisplayContacts] = useState<Contact[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isCachedMode, setIsCachedMode] = useState(false);
  
  const hasShownModal = useRef(false);
  const isInitialLoad = useRef(true);
  const previousViewsToday = useRef(0);

  useEffect(() => {
    supabaseService.getAgencies().then(setAgencies);
  }, []);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      previousViewsToday.current = viewsToday;
      return;
    }

    if (limitReached && !hasShownModal.current && previousViewsToday.current < 50 && viewsToday >= 50) {
      setShowModal(true);
      setIsCachedMode(true);
      hasShownModal.current = true;
    }

    previousViewsToday.current = viewsToday;
  }, [limitReached, viewsToday]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);

      if (!limitReached && isCachedMode) {
        setIsCachedMode(false);
        hasShownModal.current = false;
      }

      if (isCachedMode || (limitReached && viewsToday >= 50)) {
        setDisplayContacts(cachedContacts);
        setTotal(cachedContacts.length);
        setLoadingData(false);
        return;
      }

      const res = await supabaseService.getContacts(page, 10);

      if (res.data.length > 0) {
        const success = await addViews(res.data);

        if (!success) {
          const user = await supabaseService.getUser();
          setDisplayContacts(user.cachedContacts);
          setTotal(user.cachedContacts.length);

          if (!hasShownModal.current) {
            setShowModal(true);
            hasShownModal.current = true;
          }
          setIsCachedMode(true);
        } else {
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
  }, [page, isLimitLoading, isCachedMode, limitReached]);

  if (!isClerkLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary/70 dark:border-primary-light"></div>
        <p className="mt-4 text-slate-500 text-sm">Chargement…</p>
      </div>
    );
  }

  const totalPages = isCachedMode ? 1 : Math.ceil(total / ITEMS_PER_PAGE);

  if (isLimitLoading || loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary/70 dark:border-primary-light"></div>
        <p className="mt-4 text-slate-500 text-sm">Chargement des contacts…</p>
      </div>
    );
  }

  // Génère une liste compacte de pages à afficher (1, ..., n-2..n+2, ..., total)
  const generatePageNumbers = () => {
    const pages: (number | '...')[] = [];
    const total = totalPages;
    const current = page;

    if (total <= 7) {
      // Si peu de pages, afficher toutes
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    // Toujours afficher la première page
    pages.push(1);

    // Si l'écart entre début et current est important, ajouter '...'
    if (current > 4) {
      pages.push('...');
    }

    // Ajouter pages autour de la page courante (current-2 -> current+2)
    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Si l'écart entre current et la fin est important, ajouter '...'
    if (current < total - 3) {
      pages.push('...');
    }

    // Toujours afficher la dernière page
    pages.push(total);

    return pages;
  };

  return (
    <div className="space-y-6">
      <LimitModal isOpen={showModal} onClose={() => setShowModal(false)} viewsToday={viewsToday} />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Contacts Directory
            {isCachedMode && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                Cached Mode
              </span>
            )}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isCachedMode 
              ? "Affichage des contacts déjà consultés aujourd’hui." 
              : "Recherchez et connectez-vous avec les responsables éducatifs."}
          </p>
        </div>

        <div className={`px-4 py-2 rounded-xl shadow-sm text-sm font-medium border transition-all duration-200 ${
          limitReached 
            ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300' 
            : 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700'
        }`}>
          Daily Limit : <span className="font-bold">{viewsToday}</span> / 50
        </div>
      </div>

      {/* Cached mode info */}
      {isCachedMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-sm flex items-start gap-4">
          <Database className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Données en cache</h4>
            <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
              Vous avez atteint votre limite quotidienne. Seuls les contacts déjà consultés sont visibles.
            </p>
          </div>
        </div>
      )}

      {/* Card with table */}
      <Card className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {displayContacts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Aucun contact disponible.</td>
                </tr>
              ) : (
                displayContacts.map((contact) => {
                  return (
                    <tr
                      key={contact.id}
                      className="hover:bg-blue-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer"
                      onClick={() => { setSelectedContact(contact); setShowContactModal(true); }}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {contact.first_name} {contact.last_name}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{contact.title || '-'}</td>
                      <td className="px-6 py-4 text-blue-600 dark:text-blue-400 hover:underline">
                        <a href={`mailto:${contact.email}`} onClick={(e) => e.stopPropagation()}>
                          {contact.email || '-'}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {contact.phone ? (
                          <a href={`tel:${contact.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline" onClick={(e) => e.stopPropagation()}>
                            {contact.phone}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {isCachedMode && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
            Showing all cached contacts ({displayContacts.length})
          </div>
        )}
      </Card>

      {/* Pagination compacte */}
      {!isCachedMode && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            ← Previous
          </button>

          {generatePageNumbers().map((p, idx) => (
            <button
              key={`${String(p)}-${idx}`}
              onClick={() => typeof p === 'number' && setPage(p)}
              disabled={p === '...'}
              className={`px-3 py-2 rounded-lg border transition-all select-none ${
                p === page
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              } ${p === '...' ? 'opacity-60 cursor-default pointer-events-none' : ''}`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Next →
          </button>
        </div>
      )}

      {/* Contact modal */}
      {selectedContact && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedContact(null)}
        >
          <div
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedContact.first_name} {selectedContact.last_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Title</p>
                <p className="text-slate-900 dark:text-white font-medium mt-2">{selectedContact.title || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Department</p>
                <p className="text-slate-900 dark:text-white font-medium mt-2">{selectedContact.department || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Agency</p>
                <p className="text-slate-900 dark:text-white font-medium mt-2">
                  {agencies.find(a => a.id === selectedContact.agency_id)?.name || 'Unknown Agency'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Email</p>
                <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline mt-2 block">
                  {selectedContact.email || '-'}
                </a>
              </div>
            </div>

            {selectedContact.phone && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 uppercase font-semibold">Phone</p>
                <a href={`tel:${selectedContact.phone}`} className="text-blue-600 hover:underline mt-2 block">
                  {selectedContact.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
