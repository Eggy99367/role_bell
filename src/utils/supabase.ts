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

  await supabase.from('subscriptions').insert({
    user_id: session.user.id,
    tracker_id: data.id
  })

  return { ok: error === null, error, id: data.id as string };
}