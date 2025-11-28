# Configuration Supabase pour SaaS CRM

## 🚀 Étapes d'intégration Supabase

### 1. Créer un compte Supabase
- Allez sur https://supabase.com
- Cliquez sur "Start your project" 
- Créez un nouveau projet avec PostgreSQL

### 2. Récupérer les clés d'accès
Une fois votre projet créé :
1. Allez dans **Settings** → **API**
2. Copiez **Project URL** et collez-le dans `.env.local` comme `NEXT_PUBLIC_SUPABASE_URL`
3. Copiez **anon public key** et collez-le comme `NEXT_PUBLIC_SUPABASE_ANON_KEY`

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Créer les tables dans Supabase
1. Dans le dashboard Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Copiez et collez le contenu du fichier `SUPABASE_SETUP.sql`
4. Exécutez la requête

### 4. Importer des données (optionnel)
Vous pouvez importer des données existantes :
1. Allez dans la table (ex: `agencies`)
2. Cliquez sur **Insert** 
3. Copiez les données en format JSON

### 5. Configurer l'authentification (optionnel)
Si vous voulez utiliser Supabase Auth :
1. Allez dans **Authentication** → **Providers**
2. Activez les providers que vous voulez (Email, Google, GitHub, etc.)

### 6. Installer les dépendances
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 7. Tester la connexion
Lancez votre application :
```bash
npm run dev
```

## 📋 Structure des données

### Table `users`
```typescript
{
  id: UUID (clé primaire, sync avec auth)
  email: string
  name: string
  daily_contact_views: number (défaut: 0)
  last_reset: date
  cached_contacts: JSONB array
  created_at: timestamp
  updated_at: timestamp
}
```

### Table `agencies`
```typescript
{
  id: UUID (clé primaire)
  name: string
  state: string
  state_code: string
  type: string
  population: number
  website: string
  total_schools: number
  total_students: number
  mailing_address: string
  physical_address: string
  grade_span: string
  locale: string
  domain_name: string
  phone: string
  status: string
  created_at: timestamp
  updated_at: timestamp
}
```

### Table `contacts`
```typescript
{
  id: UUID (clé primaire)
  first_name: string
  last_name: string
  email: string
  phone: string
  title: string
  email_type: string
  contact_form_url: string
  department: string
  firm_id: string
  agency_id: UUID (clé étrangère → agencies)
  created_at: timestamp
  updated_at: timestamp
}
```

## 🔒 Sécurité (Row Level Security)

Les politiques RLS sont déjà configurées :
- Les utilisateurs ne peuvent voir que leurs propres données
- Les agences et contacts sont accessibles aux utilisateurs authentifiés

## 📦 Service disponible

### `supabaseService` 
Un service complet pour gérer les données Supabase avec les méthodes :

**Users:**
- `getUser()` - Récupérer l'utilisateur actuel
- `incrementViewCount()` - Incrémenter les vues quotidiennes
- `canViewContacts()` - Vérifier la limite

**Agencies:**
- `getAgencies()` - Récupérer toutes les agences
- `createAgency()` - Créer une nouvelle agence

**Contacts:**
- `getContacts(page, limit)` - Récupérer les contacts avec pagination
- `createContact()` - Créer un nouveau contact
- `searchContacts(query)` - Rechercher des contacts
- `updateContact()` - Mettre à jour un contact
- `deleteContact()` - Supprimer un contact

## ✅ Checklist d'intégration

- [ ] Créer un compte Supabase
- [ ] Copier les clés d'accès dans `.env.local`
- [ ] Exécuter le script SQL pour créer les tables
- [ ] Importer les données initiales (optionnel)
- [ ] Installer les packages npm
- [ ] Tester la connexion avec votre application
- [ ] Vérifier les données dans le dashboard Supabase

## 🆘 Dépannage

### "Cannot read properties of undefined"
Vérifiez que vos variables d'environnement sont correctes et l'application a redémarré.

### "Row Level Security violation"
Assurez-vous que vous êtes authentifié et que vos politiques RLS sont correctement configurées.

### Aucune donnée ne s'affiche
1. Vérifiez que les tables ont des données
2. Vérifiez les politiques RLS
3. Ouvrez la console (F12) pour voir les erreurs

## 📚 Documentation

- [Docs Supabase](https://supabase.com/docs)
- [Supabase JS SDK](https://supabase.com/docs/reference/javascript/start)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
