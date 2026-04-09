#!/usr/bin/env node
import { createServer } from '../server/index.js';
import { discoverForgePath } from '../server/forge-watcher.js';
import { parseArgs } from 'util';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let args;
try {
  const parsed = parseArgs({
    options: {
      forge: { type: 'string', short: 'f' },
      port:  { type: 'string', short: 'p' },
      help:  { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
  });
  args = parsed.values;
} catch (_) {
  args = {};
}

if (args.help) {
  console.log(`
SX9 Agent Console — Forge Observability Tool

  npx sx9-console                       # auto-discover .forge/ from cwd
  npx sx9-console --forge ~/project/.forge
  npx sx9-console --port 3333

Options:
  --forge, -f  Path to .forge directory
  --port,  -p  Port to listen on (default: 3001)
  --help,  -h  Show this help
`);
  process.exit(0);
}

const port = parseInt(args.port || process.env.SX9_PORT || '3001', 10);
const forgePath = args.forge
  ? args.forge.replace(/^~/, process.env.HOME || '')
  : discoverForgePath(process.cwd());

const { server } = createServer(forgePath, port);

async function tryOpenBrowser(url) {
  try {
    const open = (await import('open').catch(() => null));
    if (open && open.default) {
      await open.default(url);
    }
  } catch (_) {}
}

tryOpenBrowser(`http://localhost:${port}`);

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
