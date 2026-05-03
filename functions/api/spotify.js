const CACHE_KEY = 'spotify_top_v5';
const CACHE_TTL = 60;

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=30',
};

const ERR_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store',
};

async function getAccessToken(env) {
  const id     = String(env.SPOTIFY_CLIENT_ID).trim();
  const secret = String(env.SPOTIFY_CLIENT_SECRET).trim();
  const refresh = String(env.SPOTIFY_REFRESH_TOKEN).trim();
  const auth = btoa(`${id}:${secret}`);
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refresh)}`,
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`token ${r.status}: ${body.slice(0, 200)}`);
  }
  const d = await r.json();
  if (!d.access_token) throw new Error('token: no access_token in response');
  return d.access_token;
}

async function spotifyGet(token, path, timeoutMs = 5000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`https://api.spotify.com/v1${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
    });
    if (r.status === 204) return null;
    if (!r.ok) return { __error: r.status };
    return await r.json();
  } catch (e) {
    return { __error: e.name === 'AbortError' ? 'timeout' : e.message };
  } finally {
    clearTimeout(timer);
  }
}

function pickImg(images) {
  if (!images || !images.length) return null;
  return images[Math.min(images.length - 1, 1)]?.url || images[0]?.url;
}

function mapTrack(t) {
  if (!t) return null;
  return {
    name: t.name,
    artists: (t.artists || []).map(a => a.name).join(', '),
    url: t.external_urls?.spotify || null,
    cover: pickImg(t.album?.images),
  };
}

export async function onRequest(context) {
  const { env } = context;
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN || !env.VISITORS) {
    return new Response(JSON.stringify({ error: 'not configured' }), { status: 503, headers: ERR_HEADERS });
  }

  try {
    let cached = null;
    try { cached = await env.VISITORS.get(CACHE_KEY); } catch (e) { /* fall through */ }
    if (cached) return new Response(cached, { headers: HEADERS });

    const token = await getAccessToken(env);
    const settled = await Promise.allSettled([
      spotifyGet(token, '/me/top/tracks?time_range=short_term&limit=5'),
      spotifyGet(token, '/me/top/artists?time_range=short_term&limit=5'),
      spotifyGet(token, '/me/player/recently-played?limit=10'),
      spotifyGet(token, '/me/player/currently-playing'),
    ]);
    const pick = i => settled[i].status === 'fulfilled' ? settled[i].value : { __error: settled[i].reason?.message || 'rejected' };
    const topT = pick(0), topA = pick(1), recent = pick(2), current = pick(3);

    const tracks = (topT && !topT.__error)
      ? (topT.items || []).map(mapTrack).filter(Boolean)
      : [];

    const artists = (topA && !topA.__error)
      ? (topA.items || []).map(a => ({
        name: a.name,
        url: a.external_urls?.spotify || null,
        cover: pickImg(a.images),
        genres: (a.genres || []).slice(0, 2),
      }))
      : [];

    const recentTracks = [];
    if (recent && !recent.__error && recent.items) {
      const seen = new Set();
      for (const it of recent.items) {
        const t = mapTrack(it.track);
        if (!t) continue;
        const key = (t.name + '|' + t.artists).toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        recentTracks.push({ ...t, played_at: it.played_at });
        if (recentTracks.length >= 5) break;
      }
    }

    const playing = (current && !current.__error && current.is_playing && current.item)
      ? mapTrack(current.item)
      : null;

    const payload = {
      tracks,
      artists,
      recent: recentTracks,
      now_playing: playing,
      cached_at: Date.now(),
      _meta: {
        top_tracks:  topT?.__error ?? 'ok',
        top_artists: topA?.__error ?? 'ok',
        recent:      recent?.__error ?? 'ok',
        currently:   current?.__error ?? (current === null ? 'no_content' : 'ok'),
      },
    };

    const body = JSON.stringify(payload);
    try { await env.VISITORS.put(CACHE_KEY, body, { expirationTtl: CACHE_TTL }); } catch (e) { /* serve anyway */ }
    return new Response(body, { headers: HEADERS });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 502, headers: ERR_HEADERS });
  }
}
