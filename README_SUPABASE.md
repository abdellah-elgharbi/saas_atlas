# 🎯 SaaS CRM - Configuration Supabase complétée

## ✅ Status: PRÊT POUR DONNÉES RÉELLES

Votre application Next.js est maintenant entièrement configurée pour utiliser **Supabase PostgreSQL** avec vos données réelles.

---

## 📦 Qu'est-ce qui a changé?

### Avant ❌
- Données mock stockées en localStorage
- Limites de test
- Renouveau à chaque rechargement

### Maintenant ✅
- **Données réelles** stockées en PostgreSQL
- **Authentification** via Supabase/Clerk
- **Persistance** des données
- **Limite quotidienne** suivie en base de données

---

## 🚀 Démarrer en 5 étapes

### 1️⃣ Créer les tables (5 min)
```bash
# Dans Supabase Dashboard → SQL Editor
# Copiez/collez le fichier: SCHEMA_SQL.sql
# Cliquez RUN
```

### 2️⃣ Insérer des données (5 min)
```bash
# Option A: Données de test (rapide)
# Copiez/collez: TEST_DATA.sql dans SQL Editor

# Option B: Vos données (CSV ou SQL)
# Table Editor → Insert from CSV
```

### 3️⃣ Lancer l'application
```bash
npm run dev
```

### 4️⃣ Ouvrir le navigateur
```
http://localhost:3000
```

### 5️⃣ Vérifier les données
- ✅ Dashboard affiche les stats
- ✅ Agencies affiche votre liste
- ✅ Contacts affiche vos données

---

## 📁 Fichiers importants

| Fichier | Description |
|---------|-------------|
| `SCHEMA_SQL.sql` | 📋 Script pour créer les tables |
| `TEST_DATA.sql` | 🧪 Données de test |
| `SUPABASE_REAL_DATA.md` | 📖 Guide détaillé |
| `SETUP_COMPLETE.md` | ✅ Résumé complet |
| `.env.local` | 🔑 Clés Supabase (déjà configurées) |
| `services/supabaseService.ts` | 🔌 Client Supabase |
| `lib/supabaseClient.ts` | ⚙️ Initialisation |

---

## 🗄️ Structure des données

### Table `agencies` (Agences)
```javascript
{
  id: UUID,                    // Clé primaire
  name: string,                // Nom de l'agence
  state: string,               // État/Région
  state_code: string,          // Code (IDF, HDS...)
  type: string,                // Type (Académie, Lycée...)
  total_students: number,      // Nombre d'étudiants
  total_schools: number,       // Nombre d'écoles
  phone: string,               // Téléphone
  website: string,             // Site web
  status: 'Active' | 'Inactive',
  created_at: timestamp,
  updated_at: timestamp
}
```

### Table `contacts` (Contacts)
```javascript
{
  id: UUID,                    // Clé primaire
  first_name: string,          // Prénom
  last_name: string,           // Nom
  email: string,               // Email
  phone: string,               // Téléphone
  title: string,               // Titre (Directeur...)
  department: string,          // Département
  agency_id: UUID,             // Référence à agencies
  created_at: timestamp,
  updated_at: timestamp
}
```

### Table `users` (Utilisateurs)
```javascript
{
  id: UUID,                    // Clé primaire
  email: string,               // Email unique
  name: string,                // Nom
  daily_contact_views: number, // Vues d'aujourd'hui
  last_reset: date,            // Dernière réinitialisation
  cached_contacts: JSONB,      // Cache des contacts vus
  created_at: timestamp,
  updated_at: timestamp
}
```

---

## 🔌 Services disponibles

### `supabaseService`

```typescript
import { supabaseService } from '@/services/supabaseService';

// Agences
await supabaseService.getAgencies()                    // Toutes les agences
await supabaseService.createAgency(data)               // Créer une agence

// Contacts
await supabaseService.getContacts(page, limit)         // Contacts paginés
await supabaseService.createContact(data)              // Créer un contact
await supabaseService.searchContacts(query)            // Rechercher
await supabaseService.updateContact(id, data)          // Modifier
await supabaseService.deleteContact(id)                // Supprimer

// Utilisateurs
await supabaseService.getUser()                        // L'utilisateur actuel
await supabaseService.incrementViewCount(amount)       // +1 vue
await supabaseService.canViewContacts()                // Limite atteinte?
```

---

## 💻 Exemples d'utilisation

### Afficher toutes les agences
```tsx
'use client';

import { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';

export default function Agencies() {
  const [agencies, setAgencies] = useState([]);

  useEffect(() => {
    supabaseService.getAgencies().then(setAgencies);
  }, []);

  return (
    <ul>
      {agencies.map(agency => (
        <li key={agency.id}>{agency.name} - {agency.state}</li>
      ))}
    </ul>
  );
}
```

### Récupérer les contacts avec pagination
```typescript
const { data: contacts, total } = await supabaseService.getContacts(1, 50);
console.log(`Page 1: ${contacts.length} / ${total} contacts`);
```

### Créer un nouveau contact
```typescript
const newContact = await supabaseService.createContact({
  first_name: 'Marie',
  last_name: 'Dupont',
  email: 'marie@example.com',
  phone: '+33 6 12 34 56 78',
  title: 'Directrice',
  department: 'Administration',
  agency_id: 'uuid-agence'
});
```

---

## 🔒 Sécurité (Row Level Security)

Les données sont protégées:

| Table | Accès |
|-------|-------|
| `agencies` | Lecture: tous les utilisateurs authentifiés |
| `contacts` | Lecture: tous les utilisateurs authentifiés |
| `users` | Lecture/Écriture: l'utilisateur lui-même |

---

## 📊 Limites quotidiennes

- **Max 50 contacts** affichables par jour
- Réinitialisation à **minuit**
- Cache stocké en base de données
- Modal d'avertissement quand limite atteinte

---

## 🧪 Tester rapidement

### Dans la console (F12)
```javascript
// Voir les agences
await supabaseService.getAgencies().then(d => console.log(d))

// Voir les contacts
await supabaseService.getContacts(1, 10).then(d => console.log(d))

// Voir l'utilisateur
await supabaseService.getUser().then(d => console.log(d))
```

---

## 🐛 Dépannage

### ❌ "Cannot read properties of undefined"
**Cause:** Les tables ne sont pas créées  
**Solution:** Exécutez `SCHEMA_SQL.sql` dans Supabase

### ❌ "Row Level Security violation"
**Cause:** Vous n'êtes pas authentifié  
**Solution:** Connectez-vous via Clerk (`/sign-in`)

### ❌ Aucune donnée n'apparaît
**Cause:** Les tables sont vides  
**Solution:** Exécutez `TEST_DATA.sql` dans Supabase

### ❌ "TypeError: supabaseService is undefined"
**Cause:** Mauvais chemin d'import  
**Solution:** Utilisez `@/services/supabaseService`

---

## 📚 Ressources

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS SDK](https://supabase.com/docs/reference/javascript)
- [PostgreSQL](https://www.postgresql.org/docs)
- [Next.js](https://nextjs.org/docs)

---

## ✨ Prochaines étapes

- [ ] Créer les tables (SCHEMA_SQL.sql)
- [ ] Insérer des données (TEST_DATA.sql)
- [ ] Lancer l'app (`npm run dev`)
- [ ] Tester les pages
- [ ] Importer vos vraies données
- [ ] Configurer l'authentification Supabase
- [ ] Deployer en production

---

## 📞 Support

Pour plus d'aide, consultez:
- `SUPABASE_REAL_DATA.md` - Guide complet
- `SETUP_COMPLETE.md` - Checklist
- `SCHEMA_SQL.sql` - Schéma des tables
- `TEST_DATA.sql` - Données d'exemple

**C'est parti! 🚀**
