import { supabaseService } from '@/services/supabaseService';
import { Agency } from '@/types';
import { useEffect, useState } from 'react';

/**
 * Composant exemple pour afficher les agences depuis Supabase
 * Utilisez ce pattern dans vos autres composants
 */
export default function AgenciesExample() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true);
        const data = await supabaseService.getAgencies();
        setAgencies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Agences depuis Supabase</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agencies.map((agency) => (
          <div key={agency.id} className="p-4 border rounded-lg">
            <h3 className="font-bold">{agency.name}</h3>
            <p className="text-sm text-gray-600">{agency.state}</p>
            <p className="text-sm">Type: {agency.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
