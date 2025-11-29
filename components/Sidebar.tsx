'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useSidebar } from '@/context/SidebarContext';
import { LayoutDashboard, Users, Building2, LogOut } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useUser();
  const { isOpen } = useSidebar();
  const pathname = usePathname();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/contacts', label: 'Contacts', icon: Users },
    { path: '/agencies', label: 'Agencies', icon: Building2 },
  ];

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 w-64 
        bg-gradient-to-b from-white via-white to-slate-50/50 
        dark:from-slate-900 dark:via-slate-900 dark:to-slate-950/50
        backdrop-blur-2xl 
        border-r border-slate-200/80 dark:border-slate-800/80 
        transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] 
        shadow-2xl shadow-slate-900/10 dark:shadow-slate-950/50
        ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
      `}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none"></div>
      
      <div className="flex flex-col h-full p-6 relative z-10">
        {/* Logo Area */}
        <div className="flex items-center gap-3 mb-10 px-2 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              S
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
            SaaS CRM
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl 
                  transition-all duration-300 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 font-semibold shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 scale-105 ring-2 ring-blue-200/50 dark:ring-blue-800/50' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 hover:scale-[1.02] hover:shadow-md'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full"></div>
                )}
                
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <Icon 
                  size={20} 
                  className={`
                    relative z-10 transition-all duration-300
                    ${isActive 
                      ? 'scale-110 text-blue-600 dark:text-blue-400' 
                      : 'group-hover:scale-110 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }
                  `} 
                />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Footer */}
        <div className="mt-auto pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-all duration-300 group cursor-default">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110">
                {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">
                {user?.fullName || user?.firstName || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.primaryEmailAddress?.emailAddress || ''}
              </p>
            </div>
          </div>
          <SignOutButton>
            <button className="flex w-full items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-600 rounded-xl transition-all duration-300 text-sm font-medium group shadow-sm hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02]">
              <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>Sign Out</span>
            </button>
          </SignOutButton>
        </div>
      </div>
    </aside>
  );
};