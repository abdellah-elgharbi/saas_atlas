'use client';

import React from 'react';
import { Lock, Crown, ArrowLeft } from 'lucide-react';
import { Button } from './Components';

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewsToday: number;
}

export const LimitModal: React.FC<LimitModalProps> = ({ isOpen, onClose, viewsToday }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all scale-100 p-8 text-center relative animate-scale-in">
        
        {/* Decorative background blob */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-50 to-transparent dark:from-red-900/20 pointer-events-none" />

        <div className="relative z-10">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white dark:ring-slate-900 animate-pulse-glow">
            <Lock className="w-8 h-8 text-red-600 dark:text-red-400 animate-bounce" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Daily Limit Reached
          </h2>
          
          <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            You have reached your <strong>50 contacts</strong> limit for today. 
            You cannot view new contacts, but you can review the contacts you have already unlocked.
          </p>

          <div className="space-y-3">
            <Button 
              className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-blue-500/30"
            >
              <Crown className="w-5 h-5 mr-2" /> Upgrade to Unlimited
            </Button>
            
            <Button 
              variant="secondary" 
              className="w-full py-3"
              onClick={onClose}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Cached Contacts
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center items-center gap-2 text-xs text-slate-400">
            <span>Views used: <strong>{viewsToday}</strong>/50</span>
            <span>•</span>
            <span>Resets at midnight</span>
          </div>
        </div>
      </div>
    </div>
  );
};