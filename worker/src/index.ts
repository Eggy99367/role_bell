/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };

type Tracker = {
	id: string;
	company: string;
	title: string;
	target_url: string;
	target_selector: string[] | null;
	target_keyword: string[] | null;
};

type Receiver = {
	user_id: string;
	email: string;
}

function supabaseHeaders(env: Env) {
	return {
		apikey: env.SUPABASE_SERVICE_ROLE_KEY,
		Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
	};
}

async function fetchWaitingTrackers(env: Env): Promise<Tracker[]> {
	const res = await fetch(
		`${env.SUPABASE_URL}/rest/v1/trackers?status=eq.WAITING&select=id,company,title,target_url,target_selector,target_keyword`,
		{ headers: supabaseHeaders(env) }
	);
	if (!res.ok) throw new Error(`failed to fetch trackers: ${res.status}`);
	return res.json();
}

async function fetchTrackerById(id: string, env: Env): Promise<Tracker | null> {
	const res = await fetch(
		`${env.SUPABASE_URL}/rest/v1/trackers?id=eq.${id}&select=id,company,title,target_url,target_selector,target_keyword`,
		{ headers: supabaseHeaders(env) }
	);
	if (!res.ok) throw new Error(`failed to fetch tracker ${id}: ${res.status}`);
	const rows: Tracker[] = await res.json();
	return rows[0] ?? null;
}

async function fetchSubscriptionsByTrackerId(id: string, env: Env): Promise<Receiver[]> {
	const res = await fetch(
		`${env.SUPABASE_URL}/rest/v1/subscriptions?tracker_id=eq.${id}&select=user_id,email`,
		{ headers: supabaseHeaders(env) }
	);
	if (!res.ok) throw new Error(`failed to fetch subscriptions ${id}: ${res.status}`);
	const rows: Receiver[] = await res.json();
	return rows;
}

function notificationMailHtml(tracker: Tracker): string {
	return `<div style="font-family: 'Barlow', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 32px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px;">
  <h2 style="font-family: 'Barlow Condensed', Arial, sans-serif; font-weight: 600; font-size: 24px; color: #1a1a1a; margin: 0 0 16px;">Your tracked job has an update</h2>
  <p style="font-size: 15px; line-height: 1.6; color: #444444; margin: 0 0 28px;">
    A condition you're tracking for <strong>${tracker.company} - ${tracker.title}</strong> was just met on RoleBell.
  </p>
  <a href="${tracker.target_url}" style="display: inline-block; background-color: #6b52a6; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; padding: 12px 28px; border-radius: 8px;">
    View the job posting
  </a>
  <p style="font-size: 13px; line-height: 1.6; color: #999999; margin: 28px 0 0;">
    You're receiving this because you subscribed to this tracker on RoleBell.
  </p>
</div>`;
}

async function sendNotificationMails(tracker: Tracker, env: Env) {
	const receivers = await fetchSubscriptionsByTrackerId(tracker.id, env);
	if (receivers.length === 0) return;

	const html = notificationMailHtml(tracker);
	const res = await fetch('https://api.resend.com/emails/batch', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(
			receivers.map((receiver) => ({
				from: `Rolebell <${env.RESEND_FROM_EMAIL}>`,
				to: receiver.email,
				subject: `${tracker.company} - ${tracker.title} has an update`,
				html,
			}))
		),
	});
	if (!res.ok) console.error(`failed to send notification mails for tracker ${tracker.id}: ${res.status}`);
	else await markNotified(tracker.id, env);
}

async function markMatched(id: string, env: Env) {
	await fetch(`${env.SUPABASE_URL}/rest/v1/trackers?id=eq.${id}`, {
		method: 'PATCH',
		headers: { ...supabaseHeaders(env), 'Content-Type': 'application/json' },
		body: JSON.stringify({ status: 'MATCHED' }),
	});
}

async function markNotified(id: string, env: Env) {
	await fetch(`${env.SUPABASE_URL}/rest/v1/subscriptions?tracker_id=eq.${id}`, {
		method: 'PATCH',
		headers: { ...supabaseHeaders(env), 'Content-Type': 'application/json' },
		body: JSON.stringify({ notified: true }),
	});
}

async function logCheck(trackerId: string, httpStatus: number, matched: boolean, env: Env) {
	await fetch(`${env.SUPABASE_URL}/rest/v1/check_logs`, {
		method: 'POST',
		headers: { ...supabaseHeaders(env), 'Content-Type': 'application/json' },
		body: JSON.stringify({ tracker_id: trackerId, http_status: httpStatus, match: matched }),
	});
}

export async function conditionsMet(html: string, keywords: string[], selectors: string[]): Promise<boolean> {
	if (keywords.some((keyword) => html.includes(keyword))) return true;
	if (selectors.length === 0) return false;

	let matched = false;
	let rewriter = new HTMLRewriter();
	for (const selector of selectors) {
		rewriter = rewriter.on(selector, {
			element() {
				matched = true;
			},
		});
	}

	await rewriter.transform(new Response(html)).text();
	return matched;
}

async function checkTracker(tracker: Tracker, env: Env) {
	try {
		const res = await fetch(tracker.target_url);
		const html = await res.text();
		const matched = await conditionsMet(html, tracker.target_keyword ?? [], tracker.target_selector ?? []);
		await logCheck(tracker.id, res.status, matched, env);
		if (matched) {
			await markMatched(tracker.id, env);
			await sendNotificationMails(tracker, env);
		}
	} catch (err) {
		console.error(`tracker ${tracker.id} check failed`, err);
	}
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/check') {
			const id = url.searchParams.get('id');
			if (!id) {
				return Response.json({ ok: false, error: 'missing id param' }, { status: 400, headers: CORS_HEADERS });
			}
			ctx.waitUntil(fetchTrackerById(id, env).then((tracker) => tracker && checkTracker(tracker, env)));
			return Response.json({ ok: true }, { headers: CORS_HEADERS });
		}

		const targetUrl = url.searchParams.get('url');
		if (!targetUrl) {
			return Response.json({ ok: false, error: 'missing url param' }, { status: 400, headers: CORS_HEADERS });
		}

		try {
			const res = await fetch(targetUrl);
			const content = await res.text();
			return Response.json({ ok: res.ok, status: res.status, content }, { headers: CORS_HEADERS });
		} catch (err) {
			return Response.json({ ok: false, error: String(err) }, { status: 500, headers: CORS_HEADERS });
		}
	},

	async scheduled(_event, env, ctx) {
		ctx.waitUntil(
			fetchWaitingTrackers(env).then((trackers) => Promise.allSettled(trackers.map((tracker) => checkTracker(tracker, env))))
		);
	},
} satisfies ExportedHandler<Env>;
