'use client';

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
        bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl 
        border-r border-slate-200 dark:border-slate-800 
        transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex flex-col h-full p-6">
        {/* Logo Area */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SaaS CRM</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-primary-light dark:text-primary-dark font-medium shadow-sm ring-1 ring-blue-200 dark:ring-blue-800' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Footer */}
        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-300">
              {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-slate-900 dark:text-white">
                {user?.fullName || user?.firstName || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.primaryEmailAddress?.emailAddress || ''}
              </p>
            </div>
          </div>
          <SignOutButton>
            <button className="flex w-full items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-sm font-medium">
              <LogOut size={18} />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>
    </aside>
  );
};