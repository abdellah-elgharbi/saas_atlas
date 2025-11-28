# SaaS CRM Dashboard (Read Only)

A modern, read-only dashboard for viewing educational agencies and contacts. This project is designed to demonstrate a high-quality data presentation interface with authentication, pagination, and usage limit logic.

## 🏗️ Architecture (Proposed for Production)

For a production deployment using **Next.js 16** and **Clerk**, the architecture would be as follows:

```mermaid
graph TD
    User[User] -->|Auth Request| Clerk[Clerk Auth]
    Clerk -->|Token| Middleware[Next.js Middleware]
    Middleware -->|Protected Route| App[Next.js App Router]
    
    subgraph Dashboard
        App --> Overview[Dashboard Page]
        App --> Agencies[Agencies Table (Server Component)]
        App --> Contacts[Contacts Table (Client Component)]
    end

    Contacts -->|Fetch Data| API[API Route /api/contacts]
    API -->|Check Limit| DB[Database / KV Store]
    
    Contacts --(Limit: 50/day)--> UpgradePrompt[Upgrade Modal]
```

## 🛠️ Current Tech Stack (Demo Version)

This specific demo instance runs as a Single Page Application (SPA) to function within the browser sandbox environment.

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Routing**: React Router DOM (Simulating Next.js App Router structure)
- **Auth**: Simulated Context (Mimics Clerk behavior)
- **Storage**: Browser LocalStorage (Simulating Database)
- **UI Components**: Custom components inspired by Shadcn/UI

## 🚀 Features

1.  **Authentication**: Secure access simulation.
2.  **Agencies Directory**: Detailed table with horizontal scroll for rich data viewing.
3.  **Contacts Directory**:
    -   Paginated view (10 items per page).
    -   Data masking (Email/Phone hidden by default).
    -   "Reveal" functionality to unmask data.
4.  **Usage Limits**:
    -   Users are limited to 50 contact reveals per day.
    -   Visual progress bar in Dashboard.
    -   Upgrade prompt when limit is reached.

## 📦 Deployment

This project is ready to be ported to Vercel.

1.  Initialize a Next.js project: `npx create-next-app@latest`
2.  Install dependencies: `npm install @clerk/nextjs lucide-react`
3.  Copy the component logic from `pages/` into Next.js `app/` directory.
4.  Replace `storageService` with server-side Prisma/SQL calls.
