export interface User {
  id: string;
  email: string;
  name: string;
  dailyContactViews: number;
  lastReset: string; // YYYY-MM-DD
  cachedContacts: Contact[]; // Cache of contacts viewed today
}

export interface Agency {
  id: string;
  name: string;
  state: string;
  state_code: string;
  type: string;
  population: number;
  website: string;
  total_schools: number;
  total_students: number;
  mailing_address: string;
  physical_address: string;
  grade_span: string;
  locale: string;
  csa_cbsa: string;
  domain_name: string;
  phone: string;
  status: string;
  student_teacher_ratio: number;
  supervisory_union: string;
  county: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  title: string;
  email_type: string;
  contact_form_url: string;
  department: string;
  firm_id: string;
  agency_id: string;
  created_at: string;
  updated_at: string;
}

export interface KPI {
  totalContacts: number;
  totalAgencies: number;
  dailyViews: number;
  maxDailyViews: number;
}