const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const REDIRECT_URI = 'http://127.0.0.1:8888/callback';
const PORT = 8888;
const SCOPES = [
  'user-read-recently-played',
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-top-read',
].join(' ');

function loadDevVars() {
  const file = path.join(__dirname, '..', '.dev.vars');
  if (!fs.existsSync(file)) die('.dev.vars not found at ' + file);
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

function die(msg) { console.error('\n[ERROR] ' + msg + '\n'); process.exit(1); }

const env = loadDevVars();
if (!env.SPOTIFY_CLIENT_ID) die('Missing SPOTIFY_CLIENT_ID in .dev.vars');
if (!env.SPOTIFY_CLIENT_SECRET) die('Missing SPOTIFY_CLIENT_SECRET in .dev.vars');

const state = Math.random().toString(36).slice(2);
const authUrl = new URL('https://accounts.spotify.com/authorize');
authUrl.searchParams.set('client_id', env.SPOTIFY_CLIENT_ID);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('scope', SCOPES);
authUrl.searchParams.set('state', state);
authUrl.searchParams.set('show_dialog', 'true');

console.log('\n┌──────────────────────────────────────────────────────────────────────┐');
console.log('│  SPOTIFY TOKEN GENERATOR                                             │');
console.log('└──────────────────────────────────────────────────────────────────────┘\n');
console.log('Scopes:  ' + SCOPES);
console.log('Listening on: ' + REDIRECT_URI);
console.log('\nOpen this URL in your browser (or it might open automatically):\n');
console.log('  ' + authUrl.toString() + '\n');
console.log('Waiting for Spotify to redirect back...\n');

// Try to open in default browser (best effort, ignored if it fails)
try {
  const cmd = process.platform === 'darwin' ? 'open'
    : process.platform === 'win32' ? 'start ""'
      : 'xdg-open';
  require('child_process').exec(`${cmd} "${authUrl.toString()}"`, () => { });
} catch { }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname !== '/callback') {
    res.writeHead(404).end('not found');
    return;
  }

  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');
  const err = url.searchParams.get('error');

  if (err) {
    fail(res, 'Spotify returned error: ' + err);
    return;
  }
  if (!code) {
    fail(res, 'Missing ?code in callback');
    return;
  }
  if (returnedState !== state) {
    fail(res, 'State mismatch (possible CSRF)');
    return;
  }

  try {
    const auth = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }).toString();

    const r = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    const d = await r.json();
    if (!r.ok || !d.refresh_token) {
      fail(res, 'Token exchange failed: ' + JSON.stringify(d));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><html><head><meta charset="utf-8"><title>Done</title>
<style>body{background:#080608;color:#f0b8d0;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}h1{color:#f5eff2}p{color:#5a4858}</style>
</head><body><div><h1>✓ refresh_token obtenido</h1><p>Vuelve a la terminal — ya puedes cerrar esta pestaña.</p></div></body></html>`);

    console.log('┌──────────────────────────────────────────────────────────────────────┐');
    console.log('│  SUCCESS                                                             │');
    console.log('└──────────────────────────────────────────────────────────────────────┘\n');
    console.log('Granted scopes:   ' + (d.scope || '(none returned)'));
    console.log('access_token len: ' + (d.access_token ? d.access_token.length : 0));
    console.log('refresh_token:\n');
    console.log('  ' + d.refresh_token + '\n');
    console.log('Next steps:');
    console.log('  1. Edit .dev.vars and replace the SPOTIFY_REFRESH_TOKEN line with:\n');
    console.log(`     SPOTIFY_REFRESH_TOKEN=${d.refresh_token}\n`);
    console.log('  2. For production: cloudflare dashboard → your Pages project →');
    console.log('     Settings → Environment variables → update SPOTIFY_REFRESH_TOKEN.');
    console.log('  3. Restart wrangler dev (Ctrl+C → npm run dev) so it picks up the new value.');
    console.log('  4. Bump the cache key in functions/api/spotify.js (e.g. v3 → v4) to flush KV.\n');

    setTimeout(() => { server.close(); process.exit(0); }, 250);
  } catch (e) {
    fail(res, 'Exchange exception: ' + e.message);
  }
});

function fail(res, msg) {
  console.error('\n[ERROR] ' + msg + '\n');
  res.writeHead(500, { 'Content-Type': 'text/plain' }).end('error: ' + msg);
  setTimeout(() => process.exit(1), 250);
}

server.listen(PORT, '127.0.0.1', () => {
  // listening message already printed above
});
