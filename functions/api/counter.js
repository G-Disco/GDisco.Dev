export async function onRequest(context) {
  const { request, env } = context;
  const isHit = new URL(request.url).searchParams.get('hit') === '1';

  const current = await env.VISITORS.get('count');
  let count = parseInt(current ?? '0', 10);

  if (isHit) {
    count += 1;
    await env.VISITORS.put('count', String(count));
  }

  return new Response(JSON.stringify({ count }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  });
}
