'use client';

import { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { useUser } from '@clerk/nextjs';
import { useDailyLimit } from '@/hooks/useDailyLimit';
import { Card } from '@/components/ui/Components';
import { Users, Building2, Activity } from 'lucide-react';

export default function Dashboard() {
  const { user: clerkUser, isLoaded } = useUser();
  const { viewsToday, limitReached } = useDailyLimit();
  const [stats, setStats] = useState({
    contacts: 0,
    agencies: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const agencies = await supabaseService.getAgencies();
      const contactsRes = await supabaseService.getContacts(1, 1000);
      setStats({
        contacts: contactsRes.total,
        agencies: agencies.length,
      });
    };
    if (isLoaded) {
      loadStats();
    }
  }, [isLoaded]);

  // Maintenant le return conditionnel peut être ici
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const LIMIT = 50;
  const currentViews = viewsToday || 0;
  const remaining = Math.max(0, LIMIT - currentViews);
  const usagePercent = Math.min(100, Math.round((currentViews / LIMIT) * 100));

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h2>
        <p className="text-slate-600 dark:text-slate-400">Welcome to your read-only data access portal.</p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Daily Data Allowance</h3>
            <p className="opacity-90 max-w-xl text-blue-100">
              Every contact record displayed counts towards your daily limit. 
              {limitReached
                ? " You have reached your limit for today."
                : ` You can view ${remaining} more contacts today.`
              }
            </p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-bold">{remaining}</span>
            <span className="block text-sm opacity-80">Credits Remaining</span>
          </div>
        </div>
        <div className="mt-6 relative z-10">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
            <span>Usage: {currentViews} / {LIMIT}</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-2">
            <div 
              style={{ width: `${usagePercent}%` }} 
              className={`h-2 rounded-full transition-all duration-500 ${limitReached ? 'bg-red-400' : 'bg-white'}`}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Total Agencies"
          value={stats.agencies}
          icon={Building2}
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <StatCard
          title="Total Contacts"
          value={stats.contacts}
          icon={Users}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
      </div>

      <Card className="p-8 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-white">
          <Activity size={24} />
          <h3 className="text-lg font-bold">System Status</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
             <span className="block text-slate-500 mb-1">Architecture</span>
             <span className="font-semibold text-slate-900 dark:text-white">Next.js 16</span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
             <span className="block text-slate-500 mb-1">Authentication</span>
             <span className="font-semibold text-slate-900 dark:text-white">Clerk</span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
             <span className="block text-slate-500 mb-1">Database</span>
             <span className="font-semibold text-slate-900 dark:text-white">Supabase PostgreSQL</span>
          </div>
        </div>
      </Card>
    </div>
  );
}