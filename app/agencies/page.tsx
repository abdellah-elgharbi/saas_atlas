'use client';

import { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Agency } from '@/types';
import { Card } from '@/components/ui/Components';
import { useUser } from '@clerk/nextjs';

export default function Agencies() {
  const { isLoaded } = useUser();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Agencies Directory</h2>
          <p className="text-slate-600 dark:text-slate-400">Browse all registered educational agencies.</p>
        </div>
        <div className="text-sm text-slate-500">
           Total: {agencies.length}
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Name</th>
                <th className="px-6 py-4 font-semibold">State</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Students</th>
                <th className="px-6 py-4 font-semibold">Schools</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">Website</th>
                <th className="px-6 py-4 font-semibold">City/Locale</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Updated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {agencies.map((agency) => (
                <tr key={agency.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-card-dark z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    {agency.name}
                    <div className="text-xs text-slate-500 font-normal">{agency.id}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {agency.state_code || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{agency.type || '-'}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{agency.total_students ? agency.total_students.toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{agency.total_schools || '-'}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{agency.phone || '-'}</td>
                  <td className="px-6 py-4 text-blue-600 hover:underline cursor-pointer">{agency.website || '-'}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{agency.locale || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      {agency.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{agency.updated_at ? new Date(agency.updated_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

