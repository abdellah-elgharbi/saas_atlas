'use client';

import { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { useUser } from '@clerk/nextjs';
import { useDailyLimit } from '@/hooks/useDailyLimit';
import { Card } from '@/components/ui/Components';
import { Users, Building2, ArrowRight, Eye, TrendingUp, Clock, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { Button } from '@/components/ui/Components';

export default function Dashboard() {
  const { user: clerkUser, isLoaded } = useUser();
  const { viewsToday, limitReached } = useDailyLimit();
  const [stats, setStats] = useState({
    contacts: 0,
    agencies: 0,
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
    <Card className="p-6 hover-lift group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white transition-transform group-hover:scale-105">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg transition-transform group-hover:scale-110 group-hover:rotate-3 ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      
      <div className="animate-slide-in">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Welcome to your read-only data access portal.</p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden hover-lift animate-scale-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none animate-float"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Daily Data Allowance</h3>
            <p className="opacity-90 max-w-xl text-blue-100">
              Every contact record displayed counts towards your daily limit. 
              {limitReached
                ? " You have reached your limit for today."
                : ` You can view ${remaining} more contacts today.`
              }
            </p>
          </div>
          <div className="text-right ml-4">
            <span className="text-4xl font-bold">{remaining}</span>
            <span className="block text-sm opacity-80">Credits Remaining</span>
          </div>
        </div>
        <div className="mt-6 relative z-10">
          <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
            <span>Usage: {currentViews} / {LIMIT}</span>
            {limitReached && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-all hover:scale-105 flex items-center gap-1.5"
              >
                <Crown size={14} />
                Upgrade
              </button>
            )}
          </div>
          <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
            <div 
              style={{ width: `${usagePercent}%` }} 
              className={`h-2.5 rounded-full transition-all duration-700 ease-out ${limitReached ? 'bg-red-400 animate-pulse-glow' : 'bg-white'}`}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="animate-fade-in">
          <StatCard
            title="Total Agencies"
            value={stats.agencies}
            icon={Building2}
            colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          />
        </div>
        <div className="animate-fade-in">
          <StatCard
            title="Total Contacts"
            value={stats.contacts}
            icon={Users}
            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="p-6 border-slate-200 dark:border-slate-800 hover-lift animate-fade-in">
          <div className="flex items-center gap-3 mb-6 text-slate-900 dark:text-white">
            <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <Link 
              href="/contacts"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Browse Contacts</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">View and search contacts</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/agencies"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 dark:bg-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                  <Building2 size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Explore Agencies</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Browse educational agencies</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Card>

        {/* Usage Insights */}
        <Card className="p-6 border-slate-200 dark:border-slate-800 hover-lift animate-fade-in">
          <div className="flex items-center gap-3 mb-6 text-slate-900 dark:text-white">
            <Eye size={24} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold">Usage Insights</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Today's Views</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{currentViews}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    limitReached 
                      ? 'bg-red-500' 
                      : currentViews > LIMIT * 0.8 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {limitReached 
                  ? 'Limit reached for today' 
                  : `${remaining} views remaining`
                }
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Daily Reset</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Your limit resets at midnight
                  </p>
                </div>
              </div>
            </div>

            {/* Upgrade CTA */}
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-lg text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <Crown size={20} className="group-hover:rotate-12 transition-transform" />
              <span>Upgrade to Unlimited</span>
              <Sparkles size={16} className="group-hover:animate-pulse" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}