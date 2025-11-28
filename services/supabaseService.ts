import { supabase } from '@/lib/supabaseClient';
import { Agency, Contact, User } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class SupabaseService {
  // --- Users & Limits (Stockés dans Clerk) ---
  async getUser(userId?: string): Promise<User> {
    try {
      // If a Clerk userId is provided, query our API for the Clerk-stored limits.
      if (userId && typeof window !== 'undefined') {
        const resp = await fetch(`/api/limits?userId=${encodeURIComponent(userId)}`);
        if (!resp.ok) {
          throw new Error(`API error: ${resp.status}`);
        }
        const json = await resp.json();
        const meta = json?.meta || null;

        const viewedIds: string[] = meta?.viewedContactIds || [];
        const count = viewedIds.length;

        // Fetch full contact objects for cachedContacts
        let cachedContacts: Contact[] = [];
        if (viewedIds.length > 0) {
          const { data } = await supabase
            .from('contacts')
            .select('*')
            .in('id', viewedIds as string[])
            .limit(100);

          const map = new Map<string, Contact>();
          (data || []).forEach((d: any) => map.set(d.id, d));
          cachedContacts = viewedIds.map(id => map.get(id)).filter(Boolean) as Contact[];
        }

        return {
          id: userId,
          email: '',
          name: 'Clerk User',
          dailyContactViews: count,
          lastReset: meta?.firstViewAt || new Date().toISOString(),
          cachedContacts,
        } as User;
      }

      // Sans userId: retourner un utilisateur par défaut
      return {
        id: 'guest',
        email: 'guest@example.com',
        name: 'Guest',
        dailyContactViews: 0,
        lastReset: new Date().toISOString(),
        cachedContacts: [],
      };
    } catch (error) {
      console.error('Error in getUser:', error);
      return {
        id: 'error',
        email: 'error@example.com',
        name: 'Error User',
        dailyContactViews: 0,
        lastReset: new Date().toISOString(),
        cachedContacts: [],
      };
    }
  }
  async incrementViewCount(
    userIdOrAmount: string | number | undefined,
    amountOrContacts?: number | Contact[],
    maybeContacts?: Contact[]
  ): Promise<{ allowed: boolean; count: number; remaining: number }> {
    try {
      const LIMIT = 50;

      // Signature overloading:
      // - called as incrementViewCount(count, contacts) -> no userId
      // - called as incrementViewCount(userId, count, contacts)
      let userId: string | undefined;
      let amount = 0;
      let newContacts: Contact[] = [];

      if (typeof userIdOrAmount === 'string') {
        userId = userIdOrAmount;
        amount = (amountOrContacts as number) || 0;
        newContacts = maybeContacts || [];
      } else {
        amount = (userIdOrAmount as number) || 0;
        newContacts = (amountOrContacts as Contact[]) || [];
      }

      // Si userId est présent, appeler l'API Clerk
      if (userId && typeof window !== 'undefined') {
        try {
          const body = { userId, contactIds: newContacts.map(c => c.id) };
          const resp = await fetch('/api/limits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const json = await resp.json();
          if (json?.error) {
            console.error('Error updating Clerk limits:', json.error);
            return { allowed: false, count: 0, remaining: 0 };
          }

          // Optionally refresh cachedContacts in local state by fetching contacts by id
          const viewedIds: string[] = json.viewedContactIds || [];
          if (viewedIds.length > 0) {
            const { data } = await supabase.from('contacts').select('*').in('id', viewedIds as string[]).limit(100);
            // We won't return cachedContacts here (service-level), but getUser will fetch them when needed
          }

          return { allowed: !!json.allowed, count: json.count || 0, remaining: json.remaining || 0 };
        } catch (err) {
          console.error('Error calling /api/limits:', err);
          throw err; // Propager l'erreur au lieu de fallback
        }
      }

      // Sans userId, on ne peut pas mettre à jour Clerk
      throw new Error('userId required for incrementViewCount');
    } catch (error) {
      console.error('Error in incrementViewCount:', error);
      return { allowed: false, count: 0, remaining: 0 };
    }
  }

  async canViewContacts(): Promise<boolean> {
    try {
      const user = await this.getUser();
      return user.dailyContactViews < 50;
    } catch (error) {
      console.error('Error in canViewContacts:', error);
      return false;
    }
  }

  // --- Agents (remplace Agencies) ---
  async getAgencies(): Promise<Agency[]> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .limit(100);

      if (error) {
        console.error('Error fetching agents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAgencies:', error);
      return [];
    }
  }

  async createAgency(agency: Omit<Agency, 'id' | 'created_at' | 'updated_at'>): Promise<Agency | null> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert([
          {
            ...agency,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating agent:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createAgency:', error);
      return null;
    }
  }

  // --- Contacts ---
  async getContacts(page = 1, limit = 10): Promise<{ data: Contact[]; total: number }> {
    try {
      const { count } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      const start = (page - 1) * limit;

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .range(start, start + limit - 1);

      if (error) {
        console.error('Error fetching contacts:', error);
        return { data: [], total: 0 };
      }

      return {
        data: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error in getContacts:', error);
      return { data: [], total: 0 };
    }
  }

  async createContact(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact | null> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([
          {
            ...contact,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createContact:', error);
      return null;
    }
  }

  async searchContacts(query: string): Promise<Contact[]> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(50);

      if (error) {
        console.error('Error searching contacts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchContacts:', error);
      return [];
    }
  }

  async deleteContact(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contact:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteContact:', error);
      return false;
    }
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact | null> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          ...contact,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating contact:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateContact:', error);
      return null;
    }
  }
}

export const supabaseService = new SupabaseService();
