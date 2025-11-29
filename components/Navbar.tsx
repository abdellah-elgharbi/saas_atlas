'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, PanelLeftClose } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const ToggleButton = ({ mobile = false }) => (
    <button 
      onClick={toggleSidebar} 
      className={`
        relative group flex items-center justify-center p-2.5 rounded-xl 
        transition-all duration-300 ease-out
        border border-slate-200/60 dark:border-slate-700/60
        shadow-md hover:shadow-xl hover:shadow-blue-500/30
        backdrop-blur-md overflow-hidden
        ${mobile 
          ? 'bg-white/90 dark:bg-slate-900/90' 
          : 'bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-800/90'
        }
        text-slate-700 dark:text-slate-300
        hover:border-blue-400 dark:hover:border-blue-500 
        hover:scale-105 active:scale-95
        animate-fade-in
      `}
      title={isOpen ? "Close Sidebar" : "Open Sidebar"}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-indigo-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:via-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
      
      {/* Icon with enhanced animation */}
      <div className="relative z-10">
        {isOpen ? (
          <PanelLeftClose 
            size={20} 
            className="transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:rotate-[-12deg] group-hover:scale-110" 
          />
        ) : (
          <Menu 
            size={20} 
            className="transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:rotate-90 group-hover:scale-110" 
          />
        )}
      </div>
      
      {/* Ripple effect on click */}
      <span className="absolute inset-0 rounded-xl bg-blue-500/20 opacity-0 group-active:opacity-100 group-active:animate-ping"></span>
    </button>
  );

  return (
    <>
      {/* Mobile Header (Always fixed at top) */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shadow-sm transition-all duration-300">
        <ToggleButton mobile />
        <span className="font-bold text-slate-900 dark:text-white">ATLAS</span>
        <ThemeToggle variant="minimal" />
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
          <ThemeToggle />
        </div>
      </header>
    </>
  );
};