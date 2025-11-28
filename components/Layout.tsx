'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const isPublicPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      
      <Sidebar />
      <Navbar />

      {/* Main Content Wrapper */}
      <div 
        className={`
          flex flex-col min-h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? 'md:pl-64' : 'md:pl-0'}
        `}
      >
        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pt-[80px] md:pt-24">
           {children}
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm animate-in fade-in" 
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};