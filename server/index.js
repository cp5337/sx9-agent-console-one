import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ForgeWatcher } from './forge-watcher.js';
import { LogTailer } from './log-tailer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createServer(forgePath, port = 3001) {
  const app = express();
  const sseClients = new Set();

  app.use(cors({ origin: '*' }));
  app.use(express.json());

  const watcher = forgePath ? new ForgeWatcher(forgePath) : null;
  const tailer = forgePath ? new LogTailer(forgePath) : null;

  if (watcher) {
    watcher.start();
    watcher.on('change', (event) => {
      broadcast(sseClients, event);
    });
  }

  if (tailer) {
    tailer.watchAll();
    tailer.on('line', ({ filename, line }) => {
      broadcast(sseClients, {
        type: 'log',
        file: filename,
        data: line,
        timestamp: new Date().toISOString(),
      });
    });
  }

  app.get('/api/forge/status', (_req, res) => {
    res.json({
      available: !!forgePath,
      forgePath: forgePath || null,
      logs: tailer ? tailer.getAvailableLogs() : [],
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/forge/all', (_req, res) => {
    if (!forgePath) return res.json({});
    res.json(watcher.readAll());
  });

  app.get('/api/forge/plugin', (_req, res) => {
    if (!forgePath) return res.status(404).json({ error: 'No forge path' });
    const fp = path.join(forgePath, 'plugin.json');
    if (!fs.existsSync(fp)) return res.status(404).json({ error: 'plugin.json not found' });
    try { res.json(JSON.parse(fs.readFileSync(fp, 'utf8'))); }
    catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/forge/state', (_req, res) => {
    if (!forgePath) return res.status(404).json({ error: 'No forge path' });
    const fp = path.join(forgePath, 'state.json');
    if (!fs.existsSync(fp)) return res.status(404).json({ error: 'state.json not found' });
    try { res.json(JSON.parse(fs.readFileSync(fp, 'utf8'))); }
    catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/forge/registry', (_req, res) => {
    if (!forgePath) return res.status(404).json({ error: 'No forge path' });
    const fp = path.join(forgePath, 'plugin-registry.json');
    if (!fs.existsSync(fp)) return res.status(404).json({ error: 'plugin-registry.json not found' });
    try { res.json(JSON.parse(fs.readFileSync(fp, 'utf8'))); }
    catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/forge/logs', (_req, res) => {
    if (!tailer) return res.json([]);
    res.json(tailer.getAvailableLogs());
  });

  app.get('/api/forge/logs/:filename', (req, res) => {
    if (!tailer) return res.json([]);
    const lines = parseInt(req.query.lines || '200', 10);
    res.json(tailer.readTail(req.params.filename, lines));
  });

  app.get('/sse/forge', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`data: ${JSON.stringify({ type: 'connected', data: { forgePath }, timestamp: new Date().toISOString() })}\n\n`);

    if (watcher) {
      const initial = watcher.readAll();
      for (const [key, data] of Object.entries(initial)) {
        const type = key === 'plugin_registry' ? 'registry' : key;
        res.write(`data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`);
      }
    }

    const keepAlive = setInterval(() => {
      res.write(': keep-alive\n\n');
    }, 15000);

    sseClients.add(res);
    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

  app.get('/sse/logs', (req, res) => {
    if (!tailer) {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'Access-Control-Allow-Origin': '*' });
      res.write(`data: ${JSON.stringify({ type: 'error', data: { message: 'No forge path' }, timestamp: new Date().toISOString() })}\n\n`);
      return res.end();
    }

    const { filename } = req.query;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const logFiles = filename ? [filename] : tailer.getAvailableLogs();
    for (const f of logFiles) {
      const tail = tailer.readTail(f, 50);
      for (const line of tail) {
        res.write(`data: ${JSON.stringify({ type: 'log', file: f, data: line, timestamp: new Date().toISOString() })}\n\n`);
      }
    }

    const keepAlive = setInterval(() => { res.write(': keep-alive\n\n'); }, 15000);
    sseClients.add(res);
    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

  const distDir = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const server = app.listen(port, () => {
    console.log(`\nSX9 Agent Console running at http://localhost:${port}`);
    if (forgePath) {
      console.log(`Watching .forge at ${forgePath}`);
    } else {
      console.log('No .forge directory found — using mock data mode');
    }
    console.log('');
  });

  return { app, server, watcher, tailer };
}

function broadcast(clients, event) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of clients) {
    try { client.write(data); } catch (_) { clients.delete(client); }
  }
}
