import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

export class ForgeWatcher extends EventEmitter {
  constructor(forgePath) {
    super();
    this.forgePath = forgePath;
    this.watchers = new Map();
    this.watchedFiles = [
      'plugin.json',
      'state.json',
      'plugin-registry.json',
    ];
  }

  start() {
    for (const filename of this.watchedFiles) {
      const filePath = path.join(this.forgePath, filename);
      this._watchFile(filePath, filename);
    }
  }

  stop() {
    for (const [, watcher] of this.watchers) {
      try { watcher.close(); } catch (_) {}
    }
    this.watchers.clear();
  }

  _watchFile(filePath, filename) {
    if (!fs.existsSync(filePath)) return;
    try {
      const watcher = fs.watch(filePath, { persistent: false }, () => {
        this._emitFile(filePath, filename);
      });
      this.watchers.set(filePath, watcher);
    } catch (_) {}
  }

  _emitFile(filePath, filename) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      const key = filename.replace('.json', '').replace('-', '_');
      this.emit('change', {
        type: key === 'plugin_registry' ? 'registry' : key,
        file: filename,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (_) {}
  }

  readAll() {
    const result = {};
    for (const filename of this.watchedFiles) {
      const filePath = path.join(this.forgePath, filename);
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const key = filename.replace('.json', '').replace('-', '_');
          result[key] = JSON.parse(content);
        }
      } catch (_) {}
    }
    return result;
  }
}

export function discoverForgePath(startDir) {
  let current = startDir || process.cwd();
  const root = path.parse(current).root;
  while (current !== root) {
    const candidate = path.join(current, '.forge');
    if (fs.existsSync(path.join(candidate, 'plugin.json'))) {
      return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  const homeFallback = path.join(process.env.HOME || '~', '.forge');
  if (fs.existsSync(path.join(homeFallback, 'plugin.json'))) {
    return homeFallback;
  }
  return null;
}
