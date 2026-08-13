import RequireAuth from '@/components/RequireAuth'
import TrackerCard, { type Tracker } from '@/components/TrackerCard';
import { useAuth } from '@/utils/AuthContext'
import { supabase, unsubscribeTracker } from '@/utils/supabase';
import { useEffect, useState } from 'react'

const TRACKER_FIELDS = 'id,company,title,target_url,status,creator_id';

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
      .then(({ data, error }) => {
        if (error) return console.error('Failed to fetch own trackers: ', error);
        setOwnTrackers(data as unknown as Tracker[]);
      });

    supabase
      .from('subscriptions')
      .select(`trackers(${TRACKER_FIELDS})`)
      .eq('user_id', session.user.id)
      .then(({ data, error }) => {
        if (error) return console.error('Failed to fetch subscribed trackers: ', error);
        setSubscribedTrackers(data.map((row) => row.trackers).filter(Boolean) as unknown as Tracker[]);
      });
  }, [session])

  const handleUnsubscribe = async (trackerId: string) => {
    if (!session) return;
    const { ok } = await unsubscribeTracker(session, trackerId);
    if (ok) setSubscribedTrackers((prev) => prev.filter((t) => t.id !== trackerId));
  };

  return (
    <RequireAuth>
      <div className='flex flex-col gap-10'>
        <h1>My Trackers</h1>

        <section className='flex flex-col gap-4'>
          <h3>Created by me</h3>
          <div className='grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5'>
            {ownTrackers.map(t => (
              <TrackerCard key={t.id} tracker={t} isOwner isSubscribed onToggleSubscribe={async () => {}} />
            ))}
          </div>
        </section>

        <section className='flex flex-col gap-4'>
          <h3>Subscribed by me</h3>
          <div className='grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5'>
            {subscribedTrackers.map(t => (
              <TrackerCard
                key={t.id}
                tracker={t}
                isOwner={t.creator_id === session?.user.id}
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
