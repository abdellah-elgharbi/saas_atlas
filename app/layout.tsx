import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/context/ThemeContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { Layout } from '@/components/Layout';
import './globals.css';

export const metadata: Metadata = {
  title: 'ATLAS',
  description: 'ATLAS Application',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // Check if Clerk key is valid (not empty, not placeholder, and has proper format)
  function isValidClerkKey(key: string | undefined): boolean {
    if (!key) return false;
    if (key === 'pk_test_placeholder' || key === 'pk_test_') return false;
    if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) return false;
    return key.length > 20; // Valid keys are much longer
  }
  
  const isValidKey = isValidClerkKey(clerkKey);
  
  // If Clerk key is not configured, show error message
  if (!isValidKey) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="bg-background-light text-text-light dark:bg-background-dark dark:text-text-dark antialiased">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 border border-red-200 dark:border-red-800">
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                Configuration requise
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Vous devez configurer Clerk pour utiliser cette application.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
                <li>Créez un compte sur <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Clerk Dashboard</a></li>
                <li>Créez une nouvelle application</li>
                <li>Copiez votre clé publishable</li>
                <li>Créez un fichier <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">.env.local</code> à la racine du projet</li>
                <li>Ajoutez : <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...</code></li>
                <li>Redémarrez le serveur de développement</li>
              </ol>
              <a 
                href="https://dashboard.clerk.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aller au Dashboard Clerk
              </a>
            </div>
          </div>
        </body>
      </html>
    );
  }
  
  return (
    <ClerkProvider
      publishableKey={clerkKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      <html lang="en" suppressHydrationWarning>
        <body className="bg-background-light text-text-light dark:bg-background-dark dark:text-text-dark antialiased">
          <ThemeProvider>
            <SidebarProvider>
              <Layout>{children}</Layout>
            </SidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

