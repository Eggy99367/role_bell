import RequireAuth from '@/components/RequireAuth'

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
      <div>
        <h1>My Tracker</h1>
      </div>
    </RequireAuth>
  )
}
