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
		`${env.SUPABASE_URL}/rest/v1/trackers?status=eq.WAITING&select=id,target_url,target_selector,target_keyword`,
		{ headers: supabaseHeaders(env) }
	);
	if (!res.ok) throw new Error(`failed to fetch trackers: ${res.status}`);
	return res.json();
}

async function fetchTrackerById(id: string, env: Env): Promise<Tracker | null> {
	const res = await fetch(
		`${env.SUPABASE_URL}/rest/v1/trackers?id=eq.${id}&select=id,target_url,target_selector,target_keyword`,
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

async function markMatched(id: string, env: Env) {
	await fetch(`${env.SUPABASE_URL}/rest/v1/trackers?id=eq.${id}`, {
		method: 'PATCH',
		headers: { ...supabaseHeaders(env), 'Content-Type': 'application/json' },
		body: JSON.stringify({ status: 'MATCHED' }),
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
		if (matched) await markMatched(tracker.id, env);
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
