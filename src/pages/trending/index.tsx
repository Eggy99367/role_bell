import RequireAuth from '@/components/RequireAuth'
import { useAuth } from '@/utils/AuthContext';
import { deleteTracker, supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import TrackerCard, { type Tracker } from '@/components/TrackerCard';


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

  const handleDelete = async (trackerId: string) => {
    if (!session) return;
    const { ok } = await deleteTracker(session, trackerId);
    if (ok) setTrending((prev) => prev.filter((t) => t.id !== trackerId));
  };

  return (
    <RequireAuth>
      <div className='flex flex-col gap-10'>
        <h1>Trending</h1>
        <section className='flex flex-col gap-4'>
          <h3>top 50 public bells</h3>
          <div className='grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5'>
            {trending.map(t => (
              <TrackerCard
                key={t.id}
                tracker={t}
                isOwner
                isSubscribed
                onToggleSubscribe={async () => { }}
                onDelete={() => handleDelete(t.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </RequireAuth>
  )
}
