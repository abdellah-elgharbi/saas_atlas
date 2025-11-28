# 🎯 Guide de démarrage Supabase - SaaS CRM

## ✅ Étapes complétées

- ✅ Installation des packages Supabase
- ✅ Création du client Supabase (`lib/supabaseClient.ts`)
- ✅ Création du service Supabase (`services/supabaseService.ts`)
- ✅ Création du hook `useDataService` pour basculer entre services
- ✅ Configuration des variables d'environnement (`.env.local`)
- ✅ Script SQL pour créer les tables (`SUPABASE_SETUP.sql`)
- ✅ Composant exemple (`components/AgenciesExample.tsx`)

## 🚀 Prochaines étapes (À faire maintenant)

### 1. **Créer un compte Supabase**
   - Visitez https://supabase.com
   - Inscrivez-vous et créez un nouveau projet
   - Choisissez PostgreSQL comme base de données

### 2. **Récupérer les clés d'accès**
   1. Dans le dashboard Supabase, allez à **Settings** → **API**
   2. Copiez la **Project URL**
   3. Copiez la clé **anon public**
   4. Mettez à jour le fichier `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

### 3. **Créer les tables dans Supabase**
   1. Allez dans Supabase SQL Editor
   2. Créez une nouvelle requête vierge
   3. Copiez **tout** le contenu du fichier `SUPABASE_SETUP.sql`
   4. Collez-le dans l'éditeur SQL
   5. Cliquez sur **RUN** (bouton bleu)

> **Remarque:** Ce script crée automatiquement :
> - Tables `users`, `agencies`, `contacts`
> - Politiques de sécurité (Row Level Security)
> - Index pour améliorer les performances
> - Triggers pour les timestamps

### 4. **Démarrer l'application**

```bash
npm run dev
```

Ouvrez http://localhost:3000

### 5. **Vérifier la connexion**
   - Ouvrez la console (F12)
   - Vérifiez qu'il n'y a pas d'erreurs
   - Vérifiez que les données se chargent

## 📦 Architecture

```
Application Next.js
    ↓
useDataService() [Hook]
    ↓
├─ Supabase activé → supabaseService
│   ├─ Appel API REST Supabase
│   └─ PostgreSQL
│
└─ Supabase désactivé → storageService
    └─ localStorage (données mock)
```

## 🔧 Comment utiliser dans vos composants

### Option 1: Avec le hook personnalisé
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useDataService } from '@/hooks/useDataService';

export default function MyComponent() {
  const dataService = useDataService();
  const [agencies, setAgencies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await dataService.getAgencies();
      setAgencies(data);
    };
    fetchData();
  }, [dataService]);

  return <div>{/* rendu */}</div>;
}
```

### Option 2: Directement avec Supabase
```tsx
'use client';

import { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';

export default function MyComponent() {
  const [agencies, setAgencies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await supabaseService.getAgencies();
      setAgencies(data);
    };
    fetchData();
  }, []);

  return <div>{/* rendu */}</div>;
}
```

## 📊 Services disponibles

### **supabaseService** - Tous les appels vers Supabase

**Users:**
- `getUser()` → User
- `incrementViewCount(amount, contacts)` → {allowed, count, remaining}
- `canViewContacts()` → boolean

**Agencies:**
- `getAgencies()` → Agency[]
- `createAgency(data)` → Agency | null

**Contacts:**
- `getContacts(page, limit)` → {data: Contact[], total: number}
- `createContact(data)` → Contact | null
- `searchContacts(query)` → Contact[]
- `updateContact(id, data)` → Contact | null
- `deleteContact(id)` → boolean

### **storageService** - Service de fallback (localStorage)
- Même interface que supabaseService
- Utilisé quand Supabase n'est pas configuré
- Stocke les données en localStorage

## 🔒 Sécurité (Row Level Security)

Les tables ont des politiques RLS configurées:

- **Users**: Chaque utilisateur ne peut voir que ses propres données
- **Agencies**: Accessibles à tous les utilisateurs authentifiés (lecture seule)
- **Contacts**: Accessibles à tous les utilisateurs authentifiés (lecture seule)

## 🗄️ Migrer les données mock vers Supabase

Deux options:

### Option 1: Importer manuellement via SQL
```sql
-- Dans Supabase SQL Editor, exécutez le contenu du fichier de migration
INSERT INTO agencies (...) VALUES (...);
INSERT INTO contacts (...) VALUES (...);
```

### Option 2: Via script (À faire depuis la page)
```tsx
import { migrateDataToSupabase } from '@/lib/migrationScript';

// Dans un composant admin
const handleMigrate = async () => {
  const result = await migrateDataToSupabase();
  console.log('Migration result:', result);
};
```

## 🆘 Dépannage

### Erreur: "Cannot read property 'url' of undefined"
❌ Les clés Supabase ne sont pas configurées
✅ Vérifiez `.env.local` et redémarrez l'app

### Erreur: "Row Level Security violation"
❌ Vous n'êtes pas authentifié
✅ Connectez-vous d'abord via Clerk

### Aucune donnée n'apparaît
1. Ouvrez la console (F12)
2. Vérifiez les erreurs
3. Vérifiez que les tables ont des données dans Supabase

### La connexion Supabase ne marche pas
1. Vérifiez les clés dans `.env.local`
2. Assurez-vous que l'URL Supabase est correcte (sans `/`)
3. Testez dans Supabase Dashboard → **SQL Editor** → `SELECT * FROM agencies;`

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase JavaScript SDK](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Next.js Guide](https://nextjs.org/docs)

## 💡 Astuces

1. **Testez d'abord avec Supabase désactivé**: Utilisez `storageService` pour développer
2. **Activez Supabase progressivement**: Testez les endpoints un par un
3. **Utilisez le Supabase Dashboard**: Excellent pour déboguer et voir les données
4. **Activez les logs**: Consultez la console du navigateur (F12) pour les erreurs

---

**Vous êtes prêt! 🎉** Commencez par créer votre compte Supabase et les tables.
