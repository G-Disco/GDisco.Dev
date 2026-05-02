const CACHE_KEY = 'spotify_top_v4';
const CACHE_TTL = 60;

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=30',
};

async function getAccessToken(env) {
  const auth = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(env.SPOTIFY_REFRESH_TOKEN)}`,
  });
  if (!r.ok) throw new Error(`token ${r.status}`);
  const d = await r.json();
  return d.access_token;
}

async function spotifyGet(token, path) {
  const r = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (r.status === 204) return null;
  if (!r.ok) return { __error: r.status };
  return r.json();
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
  if (!env.SPOTIFY_REFRESH_TOKEN || !env.SPOTIFY_CLIENT_ID) {
    return new Response(JSON.stringify({ error: 'not configured' }), { status: 503, headers: HEADERS });
  }

  try {
    const cached = await env.VISITORS.get(CACHE_KEY);
    if (cached) return new Response(cached, { headers: HEADERS });

    const token = await getAccessToken(env);
    const [topT, topA, recent, current] = await Promise.all([
      spotifyGet(token, '/me/top/tracks?time_range=short_term&limit=5'),
      spotifyGet(token, '/me/top/artists?time_range=short_term&limit=5'),
      spotifyGet(token, '/me/player/recently-played?limit=10'),
      spotifyGet(token, '/me/player/currently-playing'),
    ]);

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
    };

    const body = JSON.stringify(payload);
    await env.VISITORS.put(CACHE_KEY, body, { expirationTtl: CACHE_TTL });
    return new Response(body, { headers: HEADERS });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 502, headers: HEADERS });
  }
}
