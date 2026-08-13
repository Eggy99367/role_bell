import RequireAuth from '@/components/RequireAuth'
import TrackerCard, { type Tracker } from '@/components/TrackerCard';
import { useAuth } from '@/utils/AuthContext'
import { supabase, unsubscribeTracker, deleteTracker, fetchSubscriberCounts } from '@/utils/supabase';
import { useEffect, useState } from 'react'

const TRACKER_FIELDS = 'id,company,title,target_url,status,creator_id,is_public,created_at';

type RawTracker = Omit<Tracker, 'subscriber_count'>;

export default function MyTracker() {
  const [ownTrackers, setOwnTrackers] = useState<Tracker[]>([]);
  const [subscribedTrackers, setSubscribedTrackers] = useState<Tracker[]>([]);
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;

    supabase
      .from('trackers')
      .select(TRACKER_FIELDS)
      .eq('creator_id', session.user.id)
      .then(async ({ data, error }) => {
        if (error) return console.error('Failed to fetch own bells: ', error);
        const counts = await fetchSubscriberCounts(data.map((t) => t.id));
        setOwnTrackers(data.map((t) => ({ ...t, subscriber_count: counts.get(t.id) ?? 0 })) as unknown as Tracker[]);
      });

    supabase
      .from('subscriptions')
      .select(`trackers(${TRACKER_FIELDS})`)
      .eq('user_id', session.user.id)
      .then(async ({ data, error }) => {
        if (error) return console.error('Failed to fetch subscribed bells: ', error);
        const trackers = data
          .map((row) => row.trackers as unknown as RawTracker)
          .filter(Boolean)
          .filter((t) => t.creator_id !== session.user.id);
        const counts = await fetchSubscriberCounts(trackers.map((t) => t.id));
        setSubscribedTrackers(trackers.map((t) => ({ ...t, subscriber_count: counts.get(t.id) ?? 0 })) as unknown as Tracker[]);
      });
  }, [session])

  const handleUnsubscribe = async (trackerId: string): Promise<boolean> => {
    if (!session) return false;
    const { ok } = await unsubscribeTracker(session, trackerId);
    if (ok) setSubscribedTrackers((prev) => prev.filter((t) => t.id !== trackerId));
    return ok;
  };

  const handleDelete = async (trackerId: string) => {
    if (!session) return;
    const { ok } = await deleteTracker(session, trackerId);
    if (ok) setOwnTrackers((prev) => prev.filter((t) => t.id !== trackerId));
  };

  return (
    <RequireAuth>
      <div className='flex flex-col gap-10'>
        <h1 className='text-[#f1eefa]'>My Bells</h1>

        <section className='flex flex-col gap-4'>
          <h3 className='text-[#f1eefa]'>Created by me</h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {ownTrackers.map(t => (
              <TrackerCard
                key={t.id}
                tracker={t}
                isOwner
                isSubscribed
                onToggleSubscribe={async () => true}
                onDelete={() => handleDelete(t.id)}
              />
            ))}
          </div>
        </section>

        <section className='flex flex-col gap-4'>
          <h3 className='text-[#f1eefa]'>Subscribed by me</h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {subscribedTrackers.map(t => (
              <TrackerCard
                key={t.id}
                tracker={t}
                isOwner={false}
                isSubscribed
                onToggleSubscribe={() => handleUnsubscribe(t.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </RequireAuth>
  )
}
