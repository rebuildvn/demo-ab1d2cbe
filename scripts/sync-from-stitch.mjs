#!/usr/bin/env node
/**
 * Pull latest HTML exports from Google Stitch MCP (gyusachi-vn project).
 * Requires STITCH_API_KEY in the environment.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const apiKey = process.env.STITCH_API_KEY;
const MCP_URL = 'https://stitch.googleapis.com/mcp';

if (!apiKey) {
  console.error('Set STITCH_API_KEY before running sync-from-stitch.mjs');
  process.exit(1);
}

async function mcpCall(tool, args) {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Goog-Api-Key': apiKey,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: tool, arguments: args },
    }),
  });
  const json = await res.json();
  if (json.error) {
    throw new Error(json.error.message || 'MCP error');
  }
  return JSON.parse(json.result.content[0].text);
}

const metaPath = path.join(root, 'stitch', 'project.json');
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const exportDir = path.join(root, 'stitch', 'export');
fs.mkdirSync(exportDir, { recursive: true });

for (const [label, info] of Object.entries(meta.screens)) {
  const screen = await mcpCall('get_screen', {
    name: `projects/${meta.projectId}/screens/${info.id}`,
  });
  const html = await (await fetch(screen.htmlCode.downloadUrl)).text();
  const out = path.join(exportDir, `${label}.html`);
  fs.writeFileSync(out, html);
  info.title = screen.title;
  info.path = `stitch/export/${label}.html`;
  console.log('Synced', label, screen.title, `(${html.length} bytes)`);
}

meta.syncedAt = new Date().toISOString();
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
