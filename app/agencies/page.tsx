'use client';

import { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Agency } from '@/types';
import { Card } from '@/components/ui/Components';
import { useUser } from '@clerk/nextjs';
import { X, Eye, Building2, MapPin, Phone, Globe, Users, School } from 'lucide-react';

export default function Agencies() {
  const { isLoaded } = useUser();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadAgencies = async () => {
      const data = await supabaseService.getAgencies();
      setAgencies(data);
      setLoading(false);
    };
    if (isLoaded) {
      loadAgencies();
    }
  }, [isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calcul de la pagination
  const totalPages = Math.ceil(agencies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAgencies = agencies.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end animate-slide-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Agencies Directory</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Browse all registered educational agencies.</p>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Total: {agencies.length} | Page {currentPage} of {totalPages}
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover-lift animate-fade-in">
        <div className="overflow-x-auto max-h-[calc(100vh-280px)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">State</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Website</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {currentAgencies.map((agency) => (
                <tr 
                  key={agency.id} 
                  onClick={() => setSelectedAgency(agency)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer hover:shadow-md transform hover:scale-[1.01]"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{agency.name}</div>
                    <div className="text-xs text-slate-500">{agency.locale || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {agency.state_code || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{agency.type || '-'}</td>
                  <td className="px-6 py-4">
                    {agency.website ? (
                      <a
                        href={agency.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:underline truncate block max-w-[200px]"
                        title={agency.website}
                      >
                        {agency.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {agency.phone || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
        >
          ← Previous
        </button>

        <div className="flex items-center gap-1">
          {currentPage > 2 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="w-10 h-10 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95"
              >
                1
              </button>
              {currentPage > 3 && (
                <span className="px-2 text-slate-500">...</span>
              )}
            </>
          )}

          {currentPage > 1 && (
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              className="w-10 h-10 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {currentPage - 1}
            </button>
          )}

          <button
              className="w-10 h-10 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg scale-105 shadow-md"
          >
            {currentPage}
          </button>

          {currentPage < totalPages && (
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="w-10 h-10 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {currentPage + 1}
            </button>
          )}

          {currentPage < totalPages - 1 && (
            <>
              {currentPage < totalPages - 2 && (
                <span className="px-2 text-slate-500">...</span>
              )}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="w-10 h-10 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
        >
          Next →
        </button>
      </div>

      {/* Modal */}
      {selectedAgency && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedAgency(null)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedAgency.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">ID: {selectedAgency.id}</p>
              </div>
              <button
                onClick={() => setSelectedAgency(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all hover:rotate-90 hover:scale-110 flex-shrink-0"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-4 h-4" />
                    <span className="font-semibold">Location</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    <p className="text-slate-600 dark:text-slate-400">
                      <span className="font-medium">State:</span> {selectedAgency.state_code || '-'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Locale:</span> {selectedAgency.locale || '-'}
                    </p>
                  </div>
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Building2 className="w-4 h-4" />
                    <span className="font-semibold">Type</span>
                  </div>
                  <div className="ml-6">
                    <p className="text-slate-600 dark:text-slate-400">{selectedAgency.type || '-'}</p>
                  </div>
                </div>

                {/* Students */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">Students</span>
                  </div>
                  <div className="ml-6">
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedAgency.total_students ? selectedAgency.total_students.toLocaleString() : '-'}
                    </p>
                  </div>
                </div>

                {/* Schools */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <School className="w-4 h-4" />
                    <span className="font-semibold">Schools</span>
                  </div>
                  <div className="ml-6">
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedAgency.total_schools || '-'}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Phone className="w-4 h-4" />
                    <span className="font-semibold">Phone</span>
                  </div>
                  <div className="ml-6">
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedAgency.phone || '-'}
                    </p>
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Globe className="w-4 h-4" />
                    <span className="font-semibold">Website</span>
                  </div>
                  <div className="ml-6">
                    {selectedAgency.website ? (
                      <a
                        href={selectedAgency.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {selectedAgency.website}
                      </a>
                    ) : (
                      <p className="text-slate-600 dark:text-slate-400">-</p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2 md:col-span-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Status</span>
                  <div className="ml-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      {selectedAgency.status || 'Active'}
                    </span>
                  </div>
                </div>

                {/* Updated At */}
                <div className="space-y-2 md:col-span-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Last Updated</span>
                  <div className="ml-6">
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedAgency.updated_at
                        ? new Date(selectedAgency.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}