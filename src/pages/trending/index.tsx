import RequireAuth from '@/components/RequireAuth'
import { useAuth } from '@/utils/AuthContext';
import { deleteTracker, subscribeTracker, unsubscribeTracker, fetchSubscriberCounts, supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import TrackerCard, { type Tracker } from '@/components/TrackerCard';


const TRACKER_FIELDS = 'id,company,title,target_url,status,creator_id,is_public';

export default function Trending() {
  const [trending, setTrending] = useState<Tracker[]>([]);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;

    supabase
      .from('trackers')
      .select(TRACKER_FIELDS)
      .eq('is_public', true)
      .limit(50)
      .then(async ({ data, error }) => {
        if (error) return console.error('Failed to fetch trending bells: ', error);
        const counts = await fetchSubscriberCounts(data.map((t) => t.id));
        const withCounts = data.map((t) => ({ ...t, subscriber_count: counts.get(t.id) ?? 0 }));
        withCounts.sort((a, b) => b.subscriber_count - a.subscriber_count);
        setTrending(withCounts as unknown as Tracker[]);
      });

    supabase
      .from('subscriptions')
      .select('tracker_id')
      .eq('user_id', session.user.id)
      .then(({ data, error }) => {
        if (error) return console.error('Failed to fetch subscribed ids: ', error);
        setSubscribedIds(new Set(data.map((row) => row.tracker_id)));
      });
  }, [session])

  const handleDelete = async (trackerId: string) => {
    if (!session) return;
    const { ok } = await deleteTracker(session, trackerId);
    if (ok) setTrending((prev) => prev.filter((t) => t.id !== trackerId));
  };

  const handleToggleSubscribe = async (trackerId: string): Promise<boolean> => {
    if (!session) return false;
    if (subscribedIds.has(trackerId)) {
      const { ok } = await unsubscribeTracker(session, trackerId);
      if (ok) setSubscribedIds((prev) => {
        const next = new Set(prev);
        next.delete(trackerId);
        return next;
      });
      return ok;
    } else {
      const { ok } = await subscribeTracker(session, trackerId);
      if (ok) setSubscribedIds((prev) => new Set(prev).add(trackerId));
      return ok;
    }
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
                isOwner={t.creator_id === session?.user.id}
                isSubscribed={subscribedIds.has(t.id)}
                onToggleSubscribe={() => handleToggleSubscribe(t.id)}
                onDelete={() => handleDelete(t.id)}
                showPublicBadge={false}
              />
            ))}
          </div>
        </section>
      </div>
    </RequireAuth>
  )
}
