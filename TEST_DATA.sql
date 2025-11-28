-- ============================================
-- 🧪 DONNÉES DE TEST SUPABASE
-- ============================================
-- Exécutez ce script dans Supabase SQL Editor
-- (Après avoir exécuté SCHEMA_SQL.sql)

-- Insérer des agents de test
INSERT INTO public.agents (name, state, state_code, type, population, website, total_schools, total_students, phone, status)
VALUES 
  ('District Académique Nord', 'Île-de-France', 'IDF', 'Académie', 50000, 'www.dan.fr', 25, 10000, '+33 1 23 45 67 89', 'Active'),
  ('Université Technologique Paris', 'Hauts-de-Seine', 'HDS', 'Université', 15000, 'www.utp.fr', 1, 15000, '+33 1 34 56 78 90', 'Active'),
  ('Lycée Jules Verne', 'Île-de-France', 'IDF', 'Lycée', 2000, 'www.ljv.fr', 1, 1500, '+33 1 45 67 89 01', 'Active'),
  ('École Centrale de Paris', 'Île-de-France', 'IDF', 'Grande École', 3500, 'www.ecp.fr', 1, 3500, '+33 1 55 33 55 33', 'Active'),
  ('Institut Polytechnique', 'Paris', 'IDF', 'Université', 12000, 'www.iptech.fr', 1, 12000, '+33 1 66 44 77 88', 'Active');

-- Insérer des contacts de test
INSERT INTO public.contacts (first_name, last_name, email, phone, title, department, agent_id)
VALUES 
  ('Marie', 'Dubois', 'marie.dubois@dan.fr', '+33 6 12 34 56 78', 'Directrice', 'Administration', 
    (SELECT id FROM agents WHERE name = 'District Académique Nord' LIMIT 1)),
  ('Jean', 'Martin', 'jean.martin@utp.fr', '+33 6 23 45 67 89', 'Responsable IT', 'Informatique',
    (SELECT id FROM agents WHERE name = 'Université Technologique Paris' LIMIT 1)),
  ('Sophie', 'Bernard', 'sophie.bernard@ljv.fr', '+33 6 34 56 78 90', 'Proviseur', 'Direction',
    (SELECT id FROM agents WHERE name = 'Lycée Jules Verne' LIMIT 1)),
  ('Pierre', 'Leclerc', 'pierre.leclerc@dan.fr', '+33 6 45 67 89 01', 'Conseiller', 'Ressources Humaines',
    (SELECT id FROM agents WHERE name = 'District Académique Nord' LIMIT 1)),
  ('Émilie', 'Fontaine', 'emilie.fontaine@utp.fr', '+33 6 56 78 90 12', 'Coordinatrice', 'Finances',
    (SELECT id FROM agents WHERE name = 'Université Technologique Paris' LIMIT 1)),
  ('Luc', 'Moreau', 'luc.moreau@ecp.fr', '+33 6 67 89 01 23', 'Directeur', 'Administration',
    (SELECT id FROM agents WHERE name = 'École Centrale de Paris' LIMIT 1)),
  ('Isabelle', 'Richard', 'isabelle.richard@iptech.fr', '+33 6 78 90 12 34', 'Vice-Rectrice', 'Académique',
    (SELECT id FROM agents WHERE name = 'Institut Polytechnique' LIMIT 1)),
  ('Claude', 'Lefevre', 'claude.lefevre@ljv.fr', '+33 6 89 01 23 45', 'Secrétaire', 'Administration',
    (SELECT id FROM agents WHERE name = 'Lycée Jules Verne' LIMIT 1));

-- Vérifier les données insérées
SELECT COUNT(*) as total_agents FROM public.agents;
SELECT COUNT(*) as total_contacts FROM public.contacts;
