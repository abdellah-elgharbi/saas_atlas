import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { NextMiddleware } from 'next/server';

// Check if Clerk key is valid
function isValidClerkKey(key: string | undefined): boolean {
  if (!key) return false;
  if (key === 'pk_test_placeholder' || key === 'pk_test_') return false;
  if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) return false;
  return key.length > 20; // Valid keys are much longer
}

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Only import and use Clerk middleware if key is valid
let clerkAuthHandler: NextMiddleware | null = null;
let clerkInitialized = false;

// Export middleware that checks key validity first
export default async function middleware(request: NextRequest, event: any) {
  // If Clerk key is not valid, just pass through
  // The layout will show the configuration error message
  if (!isValidClerkKey(clerkKey)) {
    return NextResponse.next();
  }
  
  // Lazy initialize Clerk middleware only when needed and key is valid
  if (!clerkInitialized) {
    try {
      const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');
      
      const isPublicRoute = createRouteMatcher([
        '/sign-in(.*)',
        '/sign-up(.*)',
        '/api/webhooks(.*)',
      ]);

      clerkAuthHandler = clerkMiddleware(async (auth: any, req: NextRequest) => {
        if (!isPublicRoute(req)) {
          await auth.protect();
        }
      });
      
      clerkInitialized = true;
    } catch (error) {
      console.error('Failed to load Clerk middleware:', error);
      return NextResponse.next();
    }
  }
  
  // Clerk is configured, delegate to Clerk middleware
  if (clerkAuthHandler) {
    return clerkAuthHandler(request, event);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

