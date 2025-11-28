-- ============================================
-- 📊 CRÉATION DES TABLES SUPABASE
-- ============================================
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Créer la table AGENTS (remplace AGENCIES)
CREATE TABLE IF NOT EXISTS public.agents (
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
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Activer Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS pour AGENTS
CREATE POLICY "Agents readable by authenticated" ON public.agents
  FOR SELECT USING (auth.role() = 'authenticated');

-- 5. Créer les politiques RLS pour CONTACTS
CREATE POLICY "Contacts readable by authenticated" ON public.contacts
  FOR SELECT USING (auth.role() = 'authenticated');

-- 6. Créer des index pour les performances
CREATE INDEX idx_agents_state ON public.agents(state);
CREATE INDEX idx_contacts_agent_id ON public.contacts(agent_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_name ON public.contacts(first_name, last_name);
