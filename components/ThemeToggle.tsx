'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  variant = 'default' 
}) => {
  const { theme, toggleTheme, isMounted } = useTheme();

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <button 
        className={`p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
        aria-label="Toggle theme"
      >
        <Sun size={20} className="opacity-0" />
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 hover:scale-110 active:scale-95 ${className}`}
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative group flex items-center justify-center p-2.5 rounded-full 
        transition-all duration-300 ease-out
        border border-slate-200/60 dark:border-slate-700/60
        shadow-sm hover:shadow-lg hover:shadow-blue-500/20
        backdrop-blur-md
        bg-white/50 dark:bg-slate-800/50
        text-slate-600 dark:text-slate-300
        hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:scale-105 active:scale-95
        ${className}
      `}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon size={20} className="transition-transform duration-300" />
      ) : (
        <Sun size={20} className="transition-transform duration-300" />
      )}
    </button>
  );
};

