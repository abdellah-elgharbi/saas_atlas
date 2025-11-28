-- Supabase SQL Setup Guide
-- Exécutez ces commandes dans l'éditeur SQL de Supabase (SQL Editor)

-- 1. Créer la table USERS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE,
  name TEXT,
  daily_contact_views INTEGER DEFAULT 0,
  last_reset DATE DEFAULT CURRENT_DATE,
  cached_contacts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Créer la table AGENCIES
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

-- 3. Créer la table CONTACTS
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

-- 4. Activer Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 5. Créer des politiques RLS pour USERS
CREATE POLICY "Users can read their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- 6. Créer des politiques RLS pour AGENCIES (lecture publique)
CREATE POLICY "Agencies are readable by authenticated users"
  ON public.agencies
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 7. Créer des politiques RLS pour CONTACTS (lecture publique)
CREATE POLICY "Contacts are readable by authenticated users"
  ON public.contacts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 8. Créer des index pour les performances
CREATE INDEX idx_agencies_state ON public.agencies(state);
CREATE INDEX idx_contacts_agency_id ON public.contacts(agency_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_name ON public.contacts(first_name, last_name);

-- 9. Créer une fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Ajouter des triggers pour les timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON public.agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
