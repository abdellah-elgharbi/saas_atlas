'use client';

import React from 'react';
import { X, Crown, Check, Sparkles } from 'lucide-react';
import { Button } from './Components';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    'Unlimited daily contact views',
    'Priority support',
    'Advanced search filters',
    'Export data to CSV',
    'API access',
  ];

  const handleUpgrade = () => {
    // Here you would integrate with your payment provider (Stripe, etc.)
    // For now, we'll just show an alert
    alert('Upgrade functionality will be integrated with your payment provider. Redirecting to checkout...');
    // In production: window.location.href = '/checkout' or similar
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all scale-100 animate-scale-in">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all hover:rotate-90 hover:scale-110"
          >
            <X size={20} className="text-white" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Crown className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Upgrade to Pro</h2>
              <p className="text-blue-100">Unlock unlimited access to all features</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Pricing */}
          <div className="text-center mb-8">
            <div className="inline-flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold text-slate-900 dark:text-white">$29</span>
              <span className="text-slate-600 dark:text-slate-400">/month</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">or $290/year (save 17%)</p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
              What's included:
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="p-1 bg-green-500 rounded-full">
                    <Check size={16} className="text-white" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-blue-500/30"
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade Now
            </Button>
            
            <Button
              variant="secondary"
              className="w-full py-3"
              onClick={onClose}
            >
              Maybe Later
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span>✓ Secure payment</span>
            <span>✓ Cancel anytime</span>
            <span>✓ 30-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};

