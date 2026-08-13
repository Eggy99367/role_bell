import { createClient } from '@supabase/supabase-js'
import type { Session } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export async function createTracker (
    session: Session,
    conditions: { id: string, type: 'text' | 'css', value: string }[],
    formData: {targetURL: string, company: string, jobTitle: string, isPublic: boolean}
  ) {
  const { data, error } = await supabase.from('trackers').insert({
    company: formData.company,
    title: formData.jobTitle,
    target_url: formData.targetURL,
    target_selector: conditions.filter((element) => element.type === "css" && element.value.trim() !== "").map((element) => element.value),
    target_keyword: conditions.filter((element) => element.type === "text" && element.value.trim() !== "").map((element) => element.value),
    status: "WAITING",
    is_public: formData.isPublic,
    creator_id: session.user.id
  }).select('id').single();

  if (!data || error) return {ok: false, error}

  const { error: subscribeError } = await subscribeTracker(session, data.id);

  return { ok: subscribeError === null, error: subscribeError, id: data.id as string };
}

export async function subscribeTracker (
  session: Session,
  tracker_id: string
) {

  const { error } = await supabase.from('subscriptions').insert({
    user_id: session.user.id,
    email: session.user.email,
    tracker_id
  })

  return { ok: error === null, error};
}

export async function deleteTracker (
  session: Session,
  tracker_id: string
) {
  const { error } = await supabase.from('trackers')
    .delete()
    .eq('id', tracker_id)
    .eq('creator_id', session.user.id)

  return { ok: error === null, error};
}

export async function fetchSubscriberCounts(trackerIds: string[]): Promise<Map<string, number>> {
  if (trackerIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('tracker_subscriber_counts')
    .select('tracker_id, subscriber_count')
    .in('tracker_id', trackerIds);

  if (error) {
    console.error('Failed to fetch subscriber counts: ', error);
    return new Map();
  }

  return new Map(data.map((row) => [row.tracker_id, row.subscriber_count]));
}

export async function unsubscribeTracker (
  session: Session,
  tracker_id: string
) {
  const { error } = await supabase.from('subscriptions')
    .delete()
    .eq('user_id', session.user.id)
    .eq('tracker_id', tracker_id)

  return { ok: error === null, error};
}