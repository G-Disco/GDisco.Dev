export async function onRequest(context) {
  const { request, env } = context;
  const isHit = new URL(request.url).searchParams.get('hit') === '1';

  if (isHit) {
    const referer = request.headers.get('Referer') ?? '';
    const origin  = request.headers.get('Origin')  ?? '';
    const fromSite = referer.includes('gdisco.dev') || origin.includes('gdisco.dev');

    if (!fromSite) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ip = request.headers.get('CF-Connecting-IP')
            || request.headers.get('X-Forwarded-For')
            || 'unknown';
    const ipKey = `ratelimit:${ip}`;
    const alreadyCounted = await env.VISITORS.get(ipKey);

    if (!alreadyCounted) {
      await env.VISITORS.put(ipKey, '1', { expirationTtl: 86400 });
      const current = await env.VISITORS.get('count');
      const count = parseInt(current ?? '0', 10) + 1;
      await env.VISITORS.put('count', String(count));
      return new Response(JSON.stringify({ count }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gdisco.dev',
          'Cache-Control': 'no-store',
        },
      });
    }
  }

  const current = await env.VISITORS.get('count');
  const count = parseInt(current ?? '0', 10);

  return new Response(JSON.stringify({ count }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://gdisco.dev',
      'Cache-Control': 'no-store',
    },
  });
}
