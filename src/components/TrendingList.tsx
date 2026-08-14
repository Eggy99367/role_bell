import { useAuth } from "@/utils/AuthContext";
import { fetchSubscriberCounts, supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import TrackerCard, { type Tracker } from '@/components/TrackerCard';

const TRACKER_FIELDS = 'id,company,title,target_url,status,creator_id,is_public,last_checked_at,created_at,target_selector,target_keyword';

export default function TrendingList() {
  const [filterData, setFilterData] = useState({count: 50, status: "ALL"});

  const [trending, setTrending] = useState<Tracker[]>([]);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());
  const { session } = useAuth();

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterData((prev) => ({...prev, [event.target.name]: event.target.value}))
  }

  useEffect(() => {
    let query = supabase
      .from('trackers')
      .select(TRACKER_FIELDS)
      .eq('is_public', true);
    if (filterData.status !== 'ALL') query = query.eq('status', filterData.status);
    query
      .limit(filterData.count)
      .then(async ({ data, error }) => {
        if (error) return console.error('Failed to fetch trending bells: ', error);
        const counts = await fetchSubscriberCounts(data.map((t) => t.id));
        const withCounts = data.map((t) => ({ ...t, subscriber_count: counts.get(t.id) ?? 0 }));
        withCounts.sort((a, b) => (b.subscriber_count - a.subscriber_count) || (a.status === b.status ? 0 : a.status === "WAITING" ? -1 : 1));
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
  }, [session, filterData])

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-end items-center gap-3">
        <select name="count" id="trending-status-selector" onChange={handleFilterChange} value={filterData.count}>
          <option value={"10"}>Top 10</option>
          <option value={"50"}>Top 50</option>
          <option value={"100"}>Top 100</option>
        </select>
        <select name="status" id="trending-count-selector" onChange={handleFilterChange} value={filterData.status}>
          <option value={"ALL"}>All</option>
          <option value={"WAITING"}>Waiting</option>
          <option value={"MATCHED"}>Matched</option>
        </select>
      </div>
      {trending.length === 0 && (
        <p className="py-10 text-center text-lg text-[#6b6480]">No results</p>
      )}
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
    </div>
  )
}