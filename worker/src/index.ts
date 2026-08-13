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

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const targetUrl = new URL(request.url).searchParams.get('url');
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
} satisfies ExportedHandler<Env>;
