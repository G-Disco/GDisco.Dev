const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...CORS,
        'Access-Control-Allow-Methods': 'GET, POST, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method === 'GET') {
    const raw = await env.VISITORS.get('quejas');
    const quejas = raw ? JSON.parse(raw) : [];
    return json({ quejas });
  }

  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return json({ error: 'JSON inválido' }, 400); }

    if (body.key !== undefined) {
      if (!env.ADMIN_KEY || body.key !== env.ADMIN_KEY) return json({ error: 'No autorizado' }, 403);
      const reply = (body.reply ?? '').trim().slice(0, 280);
      if (!reply || !body.id) return json({ error: 'Faltan campos' }, 400);
      const raw = await env.VISITORS.get('quejas');
      const quejas = raw ? JSON.parse(raw) : [];
      const q = quejas.find(q => q.id === body.id || q.ts === body.id);
      if (!q) return json({ error: 'Queja no encontrada' }, 404);
      if (!q.replies) q.replies = [];
      q.replies.push({ text: reply, ts: Date.now() });
      await env.VISITORS.put('quejas', JSON.stringify(quejas));
      return json({ ok: true });
    }

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const rlKey = `rl:${ip}`;
    const throttled = await env.VISITORS.get(rlKey);
    if (throttled) return json({ error: 'Espera un momento antes de volver a quejar.' }, 429);

    const name = (body.name ?? '').trim().slice(0, 32);
    const text = (body.text ?? '').trim().slice(0, 280);
    if (!name || !text) return json({ error: 'Faltan campos' }, 400);

    const raw = await env.VISITORS.get('quejas');
    const quejas = raw ? JSON.parse(raw) : [];
    const id = Date.now();
    quejas.unshift({ id, name, text, ts: id, replies: [] });
    if (quejas.length > 50) quejas.length = 50;

    await Promise.all([
      env.VISITORS.put('quejas', JSON.stringify(quejas)),
      env.VISITORS.put(rlKey, '1', { expirationTtl: 300 }),
    ]);

    return json({ ok: true, id });
  }

  if (request.method === 'DELETE') {
    let body;
    try { body = await request.json(); } catch { return json({ error: 'JSON inválido' }, 400); }

    if (!env.ADMIN_KEY || body.key !== env.ADMIN_KEY) return json({ error: 'No autorizado' }, 403);

    const raw = await env.VISITORS.get('quejas');
    const quejas = raw ? JSON.parse(raw) : [];
    const filtered = quejas.filter(q => q.id !== body.id && q.ts !== body.id);

    await env.VISITORS.put('quejas', JSON.stringify(filtered));
    return json({ ok: true });
  }

  return json({ error: 'Método no permitido' }, 405);
}
