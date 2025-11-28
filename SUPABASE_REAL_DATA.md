# 🔧 Configuration Supabase - Prêt pour les données réelles

## ✅ Configuration complétée

Votre application a été mise à jour pour utiliser **uniquement** Supabase pour les contacts et agences.

### Fichiers modifiés:
- ✅ `app/page.tsx` - Utilise Supabase pour les statistiques
- ✅ `app/contacts/page.tsx` - Charge les contacts depuis Supabase
- ✅ `app/agencies/page.tsx` - Charge les agences depuis Supabase  
- ✅ `hooks/useDailyLimit.ts` - Utilise Supabase pour la limite quotidienne
- ✅ `context/AuthContext.tsx` - Authentification intégrée à Supabase
- ✅ `hooks/useDataService.ts` - Retourne directement supabaseService

## 🚀 Prochaines étapes

### 1. Vérifier les clés Supabase (`.env.local`)
```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://glkowehhxjvwzmjdliel.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
✅ Déjà configuré!

### 2. Créer les tables dans Supabase

Allez dans votre dashboard Supabase:
1. Cliquez sur **SQL Editor** dans la sidebar
2. Créez une nouvelle requête
3. Copiez le contenu ci-dessous et collez-le

```sql
-- Créer la table AGENCIES
CREATE TABLE IF NOT EXISTS public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT,
  state_code TEXT,
  type TEXT,
  population INTEGER,
  website TEXT,
  total_schools INTEGER,
  total_students INTEGER,
  mailing_address TEXT,
  physical_address TEXT,
  grade_span TEXT,
  locale TEXT,
  csa_cbsa TEXT,
  domain_name TEXT,
  phone TEXT,
  status TEXT DEFAULT 'Active',
  student_teacher_ratio DECIMAL,
  supervisory_union TEXT,
  county TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table CONTACTS
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  title TEXT,
  email_type TEXT,
  contact_form_url TEXT,
  department TEXT,
  firm_id TEXT,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table USERS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  daily_contact_views INTEGER DEFAULT 0,
  last_reset DATE DEFAULT CURRENT_DATE,
  cached_contacts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activer Row Level Security
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politiques pour AGENCIES (accessibles à tous les utilisateurs authentifiés)
CREATE POLICY "Agencies readable by authenticated" ON public.agencies
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politiques pour CONTACTS (accessibles à tous les utilisateurs authentifiés)
CREATE POLICY "Contacts readable by authenticated" ON public.contacts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politiques pour USERS (chaque utilisateur voit ses propres données)
CREATE POLICY "Users can read their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Créer des index pour les performances
CREATE INDEX idx_agencies_state ON public.agencies(state);
CREATE INDEX idx_contacts_agency_id ON public.contacts(agency_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);
```

Cliquez sur **Run** pour exécuter.

### 3. Importer vos données

Maintenant que les tables sont créées, vous pouvez importer vos données.

#### Option A: Importer via CSV (Recommandé)
1. Préparez vos fichiers CSV avec les colonnes exactes
2. Dans Supabase, allez à **Table Editor**
3. Cliquez sur la table (ex: `agencies`)
4. Cliquez sur **Insert** → **Insert from CSV**
5. Téléchargez votre fichier

#### Option B: Insérer manuellement (Pour tester)
```sql
-- Insérer une agence de test
INSERT INTO public.agencies (name, state, state_code, type, population, website, total_schools, total_students, phone, status)
VALUES (
  'New York Public Schools',
  'New York',
  'NY',
  'Public School District',
  50000,
  'www.nyps.edu',
  25,
  10000,
  '+1 555 123 4567',
  'Active'
);

-- Insérer un contact de test
INSERT INTO public.contacts (first_name, last_name, email, phone, title, department, agency_id)
VALUES (
  'John',
  'Doe',
  'john.doe@nyps.edu',
  '+1 555 123 4567',
  'Principal',
  'Administration',
  (SELECT id FROM agencies LIMIT 1)
);
```

### 4. Vérifier les données

Allez dans **Table Editor** dans Supabase:
1. Cliquez sur **agencies** → Vérifiez les données
2. Cliquez sur **contacts** → Vérifiez les données

### 5. Démarrer l'application

```bash
npm run dev
```

Ouvrez http://localhost:3000

Les pages doivent maintenant afficher les données réelles de Supabase!

## 📊 Architecture actuelle

```
Application Next.js
    ↓
    ├─ Page Dashboard → supabaseService.getAgencies() + supabaseService.getContacts()
    ├─ Page Agencies → supabaseService.getAgencies()
    ├─ Page Contacts → supabaseService.getContacts()
    └─ Hook useDailyLimit → supabaseService.getUser() + incrementViewCount()
    ↓
Supabase PostgreSQL Database
    ├─ agencies (données réelles)
    ├─ contacts (données réelles)
    └─ users (limites quotidiennes)
```

## 🔑 Services disponibles

### `supabaseService`

**Agencies:**
```typescript
supabaseService.getAgencies() // Récupère toutes les agences
supabaseService.createAgency(data) // Crée une nouvelle agence
```

**Contacts:**
```typescript
supabaseService.getContacts(page, limit) // Récupère les contacts avec pagination
supabaseService.createContact(data) // Crée un nouveau contact
supabaseService.searchContacts(query) // Recherche par nom/email
supabaseService.updateContact(id, data) // Met à jour un contact
supabaseService.deleteContact(id) // Supprime un contact
```

**Users:**
```typescript
supabaseService.getUser() // Récupère l'utilisateur actuel
supabaseService.incrementViewCount(amount, contacts) // Incrément les vues
supabaseService.canViewContacts() // Vérifie la limite
```

## 🧪 Tester la connexion

### Dans la console du navigateur (F12):
```javascript
// Tester la connexion
const agencies = await supabaseService.getAgencies();
console.log('Agences:', agencies);

// Tester les contacts
const contacts = await supabaseService.getContacts(1, 10);
console.log('Contacts:', contacts);
```

## ⚠️ Important

- ❌ Plus de données mock (localStorage)
- ✅ Uniquement les données réelles de Supabase
- ✅ Les limites quotidiennes sont stockées dans `users`
- ✅ L'authentification est intégrée via Supabase

## 🆘 Dépannage

### "getAgencies returned undefined"
❌ Les tables ne sont pas créées
✅ Exécutez le script SQL dans Supabase

### "Cannot read property 'data' of null"
❌ Les tables existent mais sont vides
✅ Insérez des données de test

### "Row Level Security violation"
❌ Les politiques RLS bloquent l'accès
✅ Vérifiez que vous êtes authentifié via Clerk

### La page montre "Chargement..." indéfiniment
❌ Erreur lors de la récupération des données
✅ Ouvrez la console (F12) et vérifiez les erreurs

## 📝 Notes importantes

1. **Suppression de storageService**: Les données mock ne sont plus utilisées
2. **Tous les appels API passent par supabaseService**
3. **Les données sont maintenant persistées dans PostgreSQL**
4. **La limite quotidienne (50 contacts) est stockée en base de données**

Vous êtes maintenant prêt à utiliser les données réelles! 🎉
