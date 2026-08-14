import RequireAuth from '@/components/RequireAuth'
import { useAuth } from '@/utils/AuthContext';
import { deleteTracker, subscribeTracker, unsubscribeTracker, fetchSubscriberCounts, supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import TrackerCard, { type Tracker } from '@/components/TrackerCard';
import TrendingList from '@/components/TrendingList';


const TRACKER_FIELDS = 'id,company,title,target_url,status,creator_id,is_public,created_at,target_selector,target_keyword';

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

  return (
    <RequireAuth>
      <div className='flex flex-col gap-10'>
        <h1 className='text-[#f1eefa]'>Trending</h1>
        <section className='flex flex-col gap-4'>
          <h3 className='text-[#f1eefa]'>Top 50 Public Bells</h3>
          <TrendingList />
        </section>
      </div>
    </RequireAuth>
  )
}
