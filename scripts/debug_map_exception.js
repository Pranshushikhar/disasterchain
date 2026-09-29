const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9227;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function debugAffectedAreas() {
  const edgeProc = spawn(
    EDGE_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      '--user-data-dir=C:\\Users\\shikh\\.gemini\\antigravity-ide\\brain\\863b411c-7f74-47fb-a2fd-ddbab2b8a6d5\\edge_debug_map',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  await sleep(1500);
  const targets = await getJson(`http://127.0.0.1:${PORT}/json`);
  const pageTarget = targets.find((t) => t.type === 'page');

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((res) => (ws.onopen = res));

  ws.onmessage = (msg) => {
    const d = JSON.parse(msg.data);
    if (d.method === 'Runtime.exceptionThrown') {
      console.error('EXCEPTION:', JSON.stringify(d.params.exceptionDetails));
    }
    if (d.method === 'Console.messageAdded') {
      console.log('CONSOLE:', d.params.message.text);
    }
  };

  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
  ws.send(JSON.stringify({ id: 2, method: 'Console.enable' }));
  ws.send(JSON.stringify({ id: 3, method: 'Page.navigate', params: { url: 'http://localhost:3000/affected-areas' } }));

  await sleep(4000);
  ws.close();
  edgeProc.kill();
}

debugAffectedAreas().catch(console.error);
