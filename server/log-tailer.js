import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

const LOG_FILES = [
  'heartbeat.log',
  'orb.log',
  'task_trace.log',
  'gateway.log',
  'harness.log',
  'headless.log',
];

const TAIL_LINES = 100;

export class LogTailer extends EventEmitter {
  constructor(forgePath) {
    super();
    this.forgePath = forgePath;
    this.watchers = new Map();
    this.positions = new Map();
  }

  getAvailableLogs() {
    return LOG_FILES.filter(f => fs.existsSync(path.join(this.forgePath, f)));
  }

  readTail(filename, lines = TAIL_LINES) {
    const filePath = path.join(this.forgePath, filename);
    if (!fs.existsSync(filePath)) return [];
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const allLines = content.split('\n').filter(Boolean);
      return allLines.slice(-lines).map(raw => parseLogLine(raw));
    } catch (_) {
      return [];
    }
  }

  watchLog(filename) {
    if (this.watchers.has(filename)) return;
    const filePath = path.join(this.forgePath, filename);
    if (!fs.existsSync(filePath)) return;

    try {
      const stat = fs.statSync(filePath);
      this.positions.set(filename, stat.size);

      const watcher = fs.watch(filePath, { persistent: false }, () => {
        this._readNewLines(filename, filePath);
      });
      this.watchers.set(filename, watcher);
    } catch (_) {}
  }

  watchAll() {
    for (const f of this.getAvailableLogs()) {
      this.watchLog(f);
    }
  }

  stop() {
    for (const [, w] of this.watchers) {
      try { w.close(); } catch (_) {}
    }
    this.watchers.clear();
  }

  _readNewLines(filename, filePath) {
    try {
      const stat = fs.statSync(filePath);
      const pos = this.positions.get(filename) || 0;
      if (stat.size <= pos) return;

      const fd = fs.openSync(filePath, 'r');
      const buffer = Buffer.alloc(stat.size - pos);
      fs.readSync(fd, buffer, 0, buffer.length, pos);
      fs.closeSync(fd);
      this.positions.set(filename, stat.size);

      const newLines = buffer.toString('utf8').split('\n').filter(Boolean);
      for (const raw of newLines) {
        this.emit('line', { filename, line: parseLogLine(raw) });
      }
    } catch (_) {}
  }
}

function parseLogLine(raw) {
  const tsMatch = raw.match(/^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)/);
  const timestamp = tsMatch ? tsMatch[1] : new Date().toISOString();
  const levelMatch = raw.match(/\b(INFO|WARN|WARNING|ERROR|DEBUG|TRACE|FATAL)\b/i);
  const level = levelMatch ? levelMatch[1].toUpperCase().replace('WARNING', 'WARN') : 'INFO';
  const sourceMatch = raw.match(/\[([^\]]+)\]/);
  const source = sourceMatch ? sourceMatch[1] : 'system';
  return { timestamp, level, source, message: raw, raw };
}
