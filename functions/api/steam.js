const CACHE_KEY = 'steam_stats_v1';
const CACHE_TTL = 21600;

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=1800',
};

const ERR_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store',
};

function iconUrl(appid, hash) {
  if (!appid || !hash) return null;
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${hash}.jpg`;
}

export async function onRequest(context) {
  const { env } = context;
  const missing = [];
  if (!env.STEAM_API_KEY) missing.push('STEAM_API_KEY');
  if (!env.STEAM_ID)      missing.push('STEAM_ID');
  if (!env.VISITORS)      missing.push('VISITORS (KV binding)');
  if (missing.length) {
    return new Response(JSON.stringify({
      error: 'not configured',
      missing,
      env_keys: Object.keys(env || {}).sort(),
    }), { status: 503, headers: ERR_HEADERS });
  }

  try {
    const cached = await env.VISITORS.get(CACHE_KEY);
    if (cached) return new Response(cached, { headers: HEADERS });

    const base = 'https://api.steampowered.com';
    const [recentRes, ownedRes, summaryRes] = await Promise.all([
      fetch(`${base}/IPlayerService/GetRecentlyPlayedGames/v1/?key=${env.STEAM_API_KEY}&steamid=${env.STEAM_ID}&count=5`),
      fetch(`${base}/IPlayerService/GetOwnedGames/v1/?key=${env.STEAM_API_KEY}&steamid=${env.STEAM_ID}&include_appinfo=1&include_played_free_games=1`),
      fetch(`${base}/ISteamUser/GetPlayerSummaries/v0002/?key=${env.STEAM_API_KEY}&steamids=${env.STEAM_ID}`),
    ]);

    if (!recentRes.ok) throw new Error(`recent ${recentRes.status}`);
    if (!ownedRes.ok) throw new Error(`owned ${ownedRes.status}`);

    const recent = await recentRes.json();
    const owned = await ownedRes.json();
    const summary = summaryRes.ok ? await summaryRes.json() : null;

    const recentGames = (recent.response?.games || []).map(g => ({
      name: g.name,
      appid: g.appid,
      hours_2w: Math.round((g.playtime_2weeks || 0) / 60 * 10) / 10,
      hours_total: Math.round((g.playtime_forever || 0) / 60),
      icon: iconUrl(g.appid, g.img_icon_url),
    }));

    const top = (owned.response?.games || [])
      .filter(g => g.playtime_forever > 0)
      .sort((a, b) => b.playtime_forever - a.playtime_forever)
      .slice(0, 5)
      .map(g => ({
        name: g.name,
        appid: g.appid,
        hours_total: Math.round(g.playtime_forever / 60),
        icon: iconUrl(g.appid, g.img_icon_url),
      }));

    const player = summary?.response?.players?.[0];
    const profile = player ? {
      name: player.personaname,
      avatar: player.avatarfull,
      url: player.profileurl,
      state: player.personastate,
      currently_playing: player.gameextrainfo || null,
    } : null;

    const totalHours = (owned.response?.games || []).reduce((s, g) => s + (g.playtime_forever || 0), 0);

    const payload = {
      profile,
      recent: recentGames,
      top,
      totalGames: owned.response?.game_count || 0,
      totalHours: Math.round(totalHours / 60),
      cached_at: Date.now(),
    };

    const body = JSON.stringify(payload);
    await env.VISITORS.put(CACHE_KEY, body, { expirationTtl: CACHE_TTL });
    return new Response(body, { headers: HEADERS });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 502, headers: ERR_HEADERS });
  }
}
