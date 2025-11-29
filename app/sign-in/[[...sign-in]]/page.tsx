'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SignInPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4 relative overflow-hidden">
      
      {/* Theme Toggle Button - Fixed top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-float [animation-delay:1s]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float [animation-delay:0.5s]"></div>
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-md animate-scale-in">

        {/* Card with glassmorphism effect */}
        <div className="relative backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden hover-lift group">

          {/* Animated border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

          {/* Header */}
          <div className="relative p-6 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50 animate-float">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-1">
              Welcome
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Sign in to continue
            </p>
          </div>

          {/* Composant Clerk */}
          <div className="relative px-6 pb-6 max-h-[60vh] overflow-y-auto">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200",
                  socialButtonsBlockButtonText: "text-slate-900 dark:text-slate-100 font-medium",
                  dividerLine: "bg-slate-300 dark:bg-slate-600",
                  dividerText: "text-slate-500 dark:text-slate-400",
                  formFieldInput: "bg-white/90 dark:bg-slate-700/90 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-xl transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500",
                  formFieldLabel: "text-slate-800 dark:text-slate-200 font-medium",
                  formButtonPrimary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all duration-200 rounded-xl font-semibold",
                  footerActionLink: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium",
                  identityPreviewText: "text-slate-800 dark:text-slate-200",
                  formResendCodeLink: "text-blue-600 dark:text-blue-400 hover:text-blue-700",
                  footer: "hidden",
                },
              }}
            />

            {/* Custom Sign up link */}
            <div className="mt-4 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Don't have an account?{' '}
                <Link
                  href="/sign-up"
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/40 shadow-lg">
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-xs font-medium bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
            Secured with end-to-end encryption
          </p>
        </div>
      </div>

      {/* Decorative particles */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
      <div className="absolute top-20 right-20 w-2 h-2 bg-indigo-500 rounded-full animate-ping [animation-delay:0.3s]"></div>
      <div className="absolute bottom-20 left-20 w-2 h-2 bg-purple-500 rounded-full animate-ping [animation-delay:0.7s]"></div>
      <div className="absolute bottom-10 right-10 w-2 h-2 bg-blue-500 rounded-full animate-ping [animation-delay:1s]"></div>

    </div>
  );
}
