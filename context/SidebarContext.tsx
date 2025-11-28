'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to true (visible) initially to avoid layout shift before useEffect runs, 
  // or simple true if that is the requirement. 
  // We will reconcile with localStorage in useEffect.
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar_state');
    if (saved !== null) {
      setIsOpen(saved === 'true');
    } else {
      // Default to true on first load as requested
      setIsOpen(true);
      localStorage.setItem('sidebar_state', 'true');
    }
  }, []);

  const toggleSidebar = () => {
    setIsOpen(prev => {
      const newState = !prev;
      localStorage.setItem('sidebar_state', String(newState));
      return newState;
    });
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
};