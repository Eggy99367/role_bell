import RequireAuth from '@/components/RequireAuth'
import { useAuth } from '@/utils/AuthContext';
import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import { type Tracker } from '@/components/TrackerCard';


const TRACKER_FIELDS = 'id,company,title,target_url,status,creator_id,is_public';

export default function Trending() {
  const [trending, setTrending] = useState<Tracker[]>([]);
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;

    supabase
      .from('trackers')
      .select(`${TRACKER_FIELDS}, subscriptions(count)`)
      .eq('is_public', true)
      .then(({ data, error }) => {
        if (error) return console.error('Failed to fetch trending bells: ', error);
        const sorted = [...data].sort(
          (a, b) => (b.subscriptions[0]?.count ?? 0) - (a.subscriptions[0]?.count ?? 0)
        );
        setTrending(sorted as unknown as Tracker[]);
      });
  }, [session])


  return (
    <RequireAuth>
      <div>
        <h1>Trending</h1>
      </div>
    </RequireAuth>
  )
}
