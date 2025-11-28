'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useSidebar } from '@/context/SidebarContext';
import { Sun, Moon, Menu, PanelLeftClose } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const ToggleButton = ({ mobile = false }) => (
    <button 
      onClick={toggleSidebar} 
      className={`
        relative group flex items-center justify-center p-2.5 rounded-full 
        transition-all duration-300 ease-out
        border border-slate-200/60 dark:border-slate-700/60
        shadow-sm hover:shadow-lg hover:shadow-blue-500/20
        backdrop-blur-md
        ${mobile ? 'bg-white/80 dark:bg-slate-900/80' : 'bg-white/50 dark:bg-slate-800/50'}
        text-slate-600 dark:text-slate-300
        hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:scale-105 active:scale-95
      `}
      title={isOpen ? "Close Sidebar" : "Open Sidebar"}
    >
      {isOpen ? (
        <PanelLeftClose size={20} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
      ) : (
        <Menu size={20} className="transition-transform duration-300" />
      )}
    </button>
  );

  return (
    <>
      {/* Mobile Header (Always fixed at top) */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shadow-sm transition-all duration-300">
        <ToggleButton mobile />
        <span className="font-bold text-slate-900 dark:text-white">SaaS CRM</span>
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      {/* Desktop Header */}
      <header 
        className={`
          hidden md:flex fixed top-0 right-0 z-40 h-16 items-center justify-between px-6 
          bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 
          shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? 'left-64' : 'left-0'}
        `}
      >
        <div className="flex items-center gap-4">
          <ToggleButton />
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

          <h1 className="text-lg font-semibold capitalize text-slate-900 dark:text-white tracking-tight">
            {pathname === '/' ? 'Dashboard' : pathname?.substring(1) || 'Dashboard'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover:text-slate-900 dark:hover:text-white"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>
    </>
  );
};