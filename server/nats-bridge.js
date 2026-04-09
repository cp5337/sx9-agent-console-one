import { EventEmitter } from 'events';

export class NatsBridge extends EventEmitter {
  constructor(wsUrl, subjects) {
    super();
    this.wsUrl = wsUrl;
    this.subjects = subjects || [];
    this.ws = null;
    this.connected = false;
    this.reconnectTimer = null;
    this.stats = new Map();
  }

  connect() {
    try {
      const { WebSocket } = await import('ws').catch(() => ({ WebSocket: global.WebSocket }));
      this._connect(WebSocket);
    } catch (_) {
      this.emit('unavailable');
    }
  }

  _connect(WS) {
    try {
      this.ws = new WS(this.wsUrl);
      this.ws.on('open', () => {
        this.connected = true;
        this.emit('connected');
        for (const subject of this.subjects) {
          this._subscribe(subject);
        }
      });
      this.ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          const count = (this.stats.get(msg.subject) || 0) + 1;
          this.stats.set(msg.subject, count);
          this.emit('message', {
            subject: msg.subject || 'unknown',
            data: msg.data || msg,
            timestamp: new Date().toISOString(),
          });
        } catch (_) {}
      });
      this.ws.on('close', () => {
        this.connected = false;
        this.emit('disconnected');
        this.reconnectTimer = setTimeout(() => this._connect(WS), 5000);
      });
      this.ws.on('error', () => {
        this.connected = false;
        this.emit('unavailable');
      });
    } catch (_) {
      this.emit('unavailable');
    }
  }

  _subscribe(subject) {
    if (this.ws && this.connected) {
      try {
        this.ws.send(JSON.stringify({ op: 'sub', subject }));
      } catch (_) {}
    }
  }

  getStats() {
    return Object.fromEntries(this.stats);
  }

  stop() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      try { this.ws.close(); } catch (_) {}
    }
  }
}
