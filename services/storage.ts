import { Agency, Contact, User } from '../types';

// --- Generators ---

const STATES = ['New York', 'California', 'Texas', 'Florida', 'Illinois'];
const STATE_CODES = ['NY', 'CA', 'TX', 'FL', 'IL'];
const TITLES = ['Principal', 'Superintendent', 'Director', 'Manager', 'Teacher'];
const DEPARTMENTS = ['Administration', 'IT', 'HR', 'Operations', 'Finance'];

const generateAgencies = (count: number): Agency[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `ag_${i + 1}`,
    name: `School District ${i + 1} of ${STATES[i % STATES.length]}`,
    state: STATES[i % STATES.length],
    state_code: STATE_CODES[i % STATE_CODES.length],
    type: 'Public School District',
    population: Math.floor(Math.random() * 50000) + 1000,
    website: `www.district${i + 1}.edu`,
    total_schools: Math.floor(Math.random() * 20) + 1,
    total_students: Math.floor(Math.random() * 10000) + 500,
    mailing_address: `${100 + i} Education Blvd`,
    physical_address: `${100 + i} Education Blvd, Building B`,
    grade_span: 'K-12',
    locale: 'Suburban',
    csa_cbsa: 'Metro Area A',
    domain_name: `district${i + 1}.edu`,
    phone: `+1 555 010 ${i.toString().padStart(3, '0')}`,
    status: 'Active',
    student_teacher_ratio: 18.5,
    supervisory_union: 'Union A',
    county: 'County Name',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
};

const generateContacts = (count: number, agencies: Agency[]): Contact[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `ct_${i + 1}`,
    first_name: ['James', 'Mary', 'John', 'Patricia', 'Robert'][i % 5],
    last_name: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][i % 5],
    email: `contact${i + 1}@example.com`,
    phone: `+1 555 999 ${i.toString().padStart(3, '0')}`,
    title: TITLES[i % TITLES.length],
    email_type: 'Professional',
    contact_form_url: `www.school.edu/contact/${i}`,
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    firm_id: `firm_${Math.floor(Math.random() * 100)}`,
    agency_id: agencies[i % agencies.length].id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
};

// Initial Data
const MOCK_AGENCIES = generateAgencies(15);
const MOCK_CONTACTS = generateContacts(60, MOCK_AGENCIES); // 60 contacts to test pagination

const INITIAL_USER: User = {
  id: 'usr_001',
  email: 'admin@example.com',
  name: 'Demo User',
  dailyContactViews: 0,
  lastReset: new Date().toISOString().split('T')[0],
  cachedContacts: [],
};

const STORAGE_KEYS = {
  AGENCIES: 'saas_agencies_v2',
  CONTACTS: 'saas_contacts_v2',
  USER: 'saas_user_v2',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if localStorage is available (client-side only)
const isClient = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

class StorageService {
  constructor() {
    this.init();
  }

  private init() {
    // Check if we're in a browser environment (client-side)
    if (!isClient()) {
      return; // Skip initialization on server-side
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.AGENCIES)) {
      localStorage.setItem(STORAGE_KEYS.AGENCIES, JSON.stringify(MOCK_AGENCIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONTACTS)) {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(MOCK_CONTACTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
    }
    this.checkDailyReset();
  }

  private checkDailyReset() {
    if (!isClient()) {
      return; // Skip on server-side
    }
    
    const user = this.getUserSync();
    const today = new Date().toISOString().split('T')[0];
    if (user.lastReset !== today) {
      user.dailyContactViews = 0;
      user.lastReset = today;
      user.cachedContacts = []; // Reset cache on new day
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  // --- Users & Limits ---
  getUserSync(): User {
    if (!isClient()) {
      return INITIAL_USER; // Return default on server-side
    }
    
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    // Backward compatibility merge
    const parsed = data ? JSON.parse(data) : INITIAL_USER;
    return { ...INITIAL_USER, ...parsed };
  }

  async getUser(): Promise<User> {
    await delay(200);
    return this.getUserSync();
  }

  /**
   * Increments the user's daily view count.
   * Also updates the cached contacts list with unique entries.
   */
  async incrementViewCount(amount: number, newContacts: Contact[] = []): Promise<{ allowed: boolean; count: number; remaining: number }> {
    await delay(100);
    this.checkDailyReset();
    const user = this.getUserSync();
    const LIMIT = 50;
    
    // Check if limit is ALREADY reached - block any new views
    if (user.dailyContactViews >= LIMIT) {
      return { allowed: false, count: user.dailyContactViews, remaining: 0 };
    }

    // Calculate projected total
    const projectedTotal = user.dailyContactViews + amount;
    
    // If adding these views would exceed the limit, only allow up to the limit
    if (projectedTotal > LIMIT) {
        // Cap at the limit - don't allow views beyond 50
        user.dailyContactViews = LIMIT;
    } else {
        user.dailyContactViews = projectedTotal;
    }

    // Update Cache (Deduplicate)
    const currentCacheIds = new Set(user.cachedContacts.map(c => c.id));
    const uniqueNew = newContacts.filter(c => !currentCacheIds.has(c.id));
    if (uniqueNew.length > 0) {
        user.cachedContacts = [...user.cachedContacts, ...uniqueNew];
    }

    if (isClient()) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    
    return { 
      allowed: projectedTotal <= LIMIT, 
      count: user.dailyContactViews, 
      remaining: Math.max(0, LIMIT - user.dailyContactViews) 
    };
  }

  async canViewContacts(): Promise<boolean> {
    const user = await this.getUser();
    return user.dailyContactViews < 50;
  }

  // --- Read Only Data Access ---

  async getAgencies(): Promise<Agency[]> {
    await delay(300);
    if (!isClient()) {
      return MOCK_AGENCIES; // Return mock data on server-side
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AGENCIES) || '[]');
  }

  async getContacts(page = 1, limit = 10): Promise<{ data: Contact[], total: number }> {
    await delay(300);
    if (!isClient()) {
      // Return paginated mock data on server-side
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        data: MOCK_CONTACTS.slice(start, end),
        total: MOCK_CONTACTS.length
      };
    }
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACTS) || '[]');
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      data: all.slice(start, end),
      total: all.length
    };
  }
}

export const storageService = new StorageService();