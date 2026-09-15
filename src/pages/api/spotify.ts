import type { APIContext } from 'astro';
import { env } from 'cloudflare:workers';

const CACHE_KEY = 'spotify_top_v9';
const STALE_KEY = 'spotify_top_v9_stale';
const COOLDOWN_KEY = 'spotify_top_v9_cooldown';
const CACHE_TTL = 300;
const STALE_TTL = 86400;
const COOLDOWN_TTL = 180;
const DISCORD_ID = '857777819324121098';

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

async function getAccessToken(env: any) {
  const id = String(env.SPOTIFY_CLIENT_ID).trim();
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

async function spotifyGet(token: string, path: string, timeoutMs = 5000) {
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
  } catch (e: any) {
    return { __error: e.name === 'AbortError' ? 'timeout' : e.message };
  } finally {
    clearTimeout(timer);
  }
}

function pickImg(images: any[]) {
  if (!images || !images.length) return null;
  return images[Math.min(images.length - 1, 1)]?.url || images[0]?.url;
}

function mapTrack(t: any) {
  if (!t) return null;
  return {
    name: t.name,
    artists: (t.artists || []).map((a: any) => a.name).join(', '),
    url: t.external_urls?.spotify || null,
    cover: pickImg(t.album?.images),
  };
}

async function getNowPlayingFromLanyard() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const r = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!r.ok) return null;
    const { data } = await r.json();
    const sp = data?.spotify;
    if (!sp) return null;
    return {
      name: sp.song,
      artists: String(sp.artist || '').replace(/\s*;\s*/g, ', '),
      url: sp.track_id ? `https://open.spotify.com/track/${sp.track_id}` : null,
      cover: sp.album_art_url || null,
    };
  } catch {
    return null;
  }
}

async function getTopAndRecent(env: any) {
  const token = await getAccessToken(env);
  const settled = await Promise.allSettled([
    spotifyGet(token, '/me/top/tracks?time_range=short_term&limit=5'),
    spotifyGet(token, '/me/player/recently-played?limit=10'),
  ]);
  const pick = (i: number) => settled[i].status === 'fulfilled' ? settled[i].value : { __error: (settled[i] as any).reason?.message || 'rejected' };
  const topT = pick(0), recent = pick(1);

  const tracks = (topT && !topT.__error)
    ? (topT.items || []).map(mapTrack).filter(Boolean)
    : [];

  const recentTracks: any[] = [];
  if (recent && !recent.__error && recent.items) {
    const seen = new Set();
    for (const it of recent.items) {
      const t = mapTrack(it.track);
      if (!t) continue;
      const key = (t.name + '|' + t.artists).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      recentTracks.push(t);
      if (recentTracks.length >= 5) break;
    }
  }

  return {
    tracks,
    recent: recentTracks,
    failed: !!(topT?.__error && recent?.__error),
  };
}

export async function GET() {
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN || !env.VISITORS) {
    return new Response(JSON.stringify({ error: 'not configured' }), { status: 503, headers: ERR_HEADERS });
  }

  const now_playing = await getNowPlayingFromLanyard();

  try {
    const cached = await env.VISITORS.get(CACHE_KEY).catch(() => null);
    if (cached) {
      const parsed = JSON.parse(cached);
      parsed.now_playing = now_playing;
      return new Response(JSON.stringify(parsed), { headers: HEADERS });
    }

    const cooling = await env.VISITORS.get(COOLDOWN_KEY).catch(() => null);
    if (cooling) {
      const stale = await env.VISITORS.get(STALE_KEY).catch(() => null);
      const base = stale ? JSON.parse(stale) : { tracks: [], recent: [] };
      base.now_playing = now_playing;
      return new Response(JSON.stringify(base), { headers: HEADERS });
    }

    const fresh = await getTopAndRecent(env);

    if (fresh.failed) {
      await env.VISITORS.put(COOLDOWN_KEY, '1', { expirationTtl: COOLDOWN_TTL }).catch(() => {});
      const stale = await env.VISITORS.get(STALE_KEY).catch(() => null);
      if (stale) {
        const base = JSON.parse(stale);
        base.now_playing = now_playing;
        return new Response(JSON.stringify(base), { headers: HEADERS });
      }
      return new Response(JSON.stringify({ tracks: [], recent: [], now_playing }), { headers: ERR_HEADERS });
    }

    const cacheBody = JSON.stringify({ tracks: fresh.tracks, recent: fresh.recent });
    await env.VISITORS.put(CACHE_KEY, cacheBody, { expirationTtl: CACHE_TTL }).catch(() => {});
    await env.VISITORS.put(STALE_KEY, cacheBody, { expirationTtl: STALE_TTL }).catch(() => {});
    return new Response(JSON.stringify({ tracks: fresh.tracks, recent: fresh.recent, now_playing }), { headers: HEADERS });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message, now_playing }), { status: 502, headers: ERR_HEADERS });
  }
}
