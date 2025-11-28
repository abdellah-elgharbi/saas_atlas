#!/usr/bin/env node

/**
 * 🚀 Script d'aide pour l'intégration Supabase
 * 
 * Usage:
 *   node scripts/supabase-setup.js  - Affiche les instructions
 *   npm run dev                       - Lance l'application
 */

const fs = require('fs');
const path = require('path');

const SQL_SCHEMA = `
-- ============================================
-- 📊 TABLES SUPABASE
-- ============================================

-- 1. Créer la table AGENCIES
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

-- 2. Créer la table CONTACTS
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

-- 3. Créer la table USERS
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

-- 4. Activer Row Level Security
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Politiques RLS
CREATE POLICY "Agencies readable" ON public.agencies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Contacts readable" ON public.contacts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 6. Créer des index
CREATE INDEX idx_agencies_state ON public.agencies(state);
CREATE INDEX idx_contacts_agency_id ON public.contacts(agency_id);
`;

const TEST_DATA = `
-- ============================================
-- 🧪 DONNÉES DE TEST
-- ============================================

-- Insérer des agences de test
INSERT INTO public.agencies (name, state, state_code, type, population, website, total_schools, total_students, phone, status)
VALUES 
  ('District Académique Nord', 'IDF', 'IDF', 'Académie', 50000, 'www.dan.fr', 25, 10000, '+33 1 23 45 67 89', 'Active'),
  ('Université Technologique', 'Hauts-de-Seine', 'HDS', 'Université', 15000, 'www.ut.fr', 1, 15000, '+33 1 34 56 78 90', 'Active'),
  ('Lycée Jules Verne', 'Île-de-France', 'IDF', 'Lycée', 2000, 'www.ljv.fr', 1, 1500, '+33 1 45 67 89 01', 'Active');

-- Insérer des contacts de test
INSERT INTO public.contacts (first_name, last_name, email, phone, title, department, agency_id)
VALUES 
  ('Marie', 'Dubois', 'marie.dubois@dan.fr', '+33 6 12 34 56 78', 'Directrice', 'Administration', 
    (SELECT id FROM agencies WHERE name = 'District Académique Nord' LIMIT 1)),
  ('Jean', 'Martin', 'jean.martin@ut.fr', '+33 6 23 45 67 89', 'Responsable IT', 'Informatique',
    (SELECT id FROM agencies WHERE name = 'Université Technologique' LIMIT 1)),
  ('Sophie', 'Bernard', 'sophie.bernard@ljv.fr', '+33 6 34 56 78 90', 'Proviseur', 'Direction',
    (SELECT id FROM agencies WHERE name = 'Lycée Jules Verne' LIMIT 1)),
  ('Pierre', 'Leclerc', 'pierre.leclerc@dan.fr', '+33 6 45 67 89 01', 'Conseiller', 'RH',
    (SELECT id FROM agencies WHERE name = 'District Académique Nord' LIMIT 1)),
  ('Émilie', 'Fontaine', 'emilie.fontaine@ut.fr', '+33 6 56 78 90 12', 'Coordinatrice', 'Finances',
    (SELECT id FROM agencies WHERE name = 'Université Technologique' LIMIT 1));
`;

const INSTRUCTIONS = `
╔════════════════════════════════════════════════════════════════╗
║         🚀 CONFIGURATION SUPABASE - MODE DONNÉES RÉELLES        ║
╚════════════════════════════════════════════════════════════════╝

✅ ÉTAPE 1: Créer les tables
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Allez sur: https://app.supabase.com
2. Ouvrez votre projet
3. Cliquez sur "SQL Editor"
4. Créez une nouvelle requête
5. Copiez le contenu du fichier: SCHEMA_SQL.sql
6. Exécutez (bouton RUN)

✅ ÉTAPE 2: Insérer des données
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option A: DONNÉES DE TEST (rapide)
  1. Ouvrez un nouvel onglet SQL
  2. Copiez le contenu de: TEST_DATA.sql
  3. Exécutez

Option B: VOS DONNÉES (CSV)
  1. Allez à "Table Editor"
  2. Cliquez sur "agencies"
  3. Cliquez sur "Insert" → "Insert from CSV"
  4. Téléchargez votre fichier CSV

✅ ÉTAPE 3: Vérifier les données
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Allez à "Table Editor"
2. Cliquez sur "agencies" → Vérifiez les données
3. Cliquez sur "contacts" → Vérifiez les données

✅ ÉTAPE 4: Lancer l'application
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  npm run dev

Puis ouvrez: http://localhost:3000

✅ ÉTAPE 5: Tester
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Dashboard affiche les statistiques
✓ Page "Agencies" affiche votre liste
✓ Page "Contacts" affiche vos contacts

═════════════════════════════════════════════════════════════════

📁 Fichiers d'aide:

  • SUPABASE_REAL_DATA.md      → Instructions détaillées
  • SETUP_COMPLETE.md           → Résumé complet
  • SCHEMA_SQL.sql              → Script SQL des tables
  • TEST_DATA.sql               → Données de test

🔧 Configuration:

  .env.local                    → Déjà configuré ✅

🚀 Commandes utiles:

  npm run dev       → Lancer l'appli
  npm run build     → Builder pour production
  npm run lint      → Vérifier la syntaxe

═════════════════════════════════════════════════════════════════

💡 Besoin d'aide?

  1. Vérifiez: SUPABASE_REAL_DATA.md
  2. Ouvrez la console: F12
  3. Vérifiez les erreurs rouges
  4. Assurez-vous que les tables existent dans Supabase

═════════════════════════════════════════════════════════════════
`;

// Écrire les fichiers SQL
const schemaPath = path.join(__dirname, '..', 'SCHEMA_SQL.sql');
const testDataPath = path.join(__dirname, '..', 'TEST_DATA.sql');

if (!fs.existsSync(schemaPath)) {
  fs.writeFileSync(schemaPath, SQL_SCHEMA);
  console.log('✅ Créé: SCHEMA_SQL.sql');
}

if (!fs.existsSync(testDataPath)) {
  fs.writeFileSync(testDataPath, TEST_DATA);
  console.log('✅ Créé: TEST_DATA.sql');
}

// Afficher les instructions
console.log(INSTRUCTIONS);
