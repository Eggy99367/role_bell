import { useAuth } from "@/utils/AuthContext";
import { fetchSubscriberCounts, supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import TrackerCard, { type Tracker } from '@/components/TrackerCard';

const TRACKER_FIELDS = 'id,company,title,target_url,status,creator_id,is_public,last_checked_at,created_at,target_selector,target_keyword';

export default function TrendingList() {
  const [trending, setTrending] = useState<Tracker[]>([]);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());
  const { session } = useAuth();

  useEffect(() => {
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

    if (!session) {
      setSubscribedIds(new Set());
      return
    }

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
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
      {trending.map(t => (
        <TrackerCard
          session={session}
          key={t.id}
          tracker={t}
          isOwner={t.creator_id === session?.user.id}
          isSubscribed={subscribedIds.has(t.id)}
          showPublicBadge={false}
        />
      ))}
    </div>
  )
}