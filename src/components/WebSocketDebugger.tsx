import React, { useState, useEffect } from 'react';
import { getWebSocketUrl, getEnvironmentInfo } from '../utils/url';
import { apiService } from '../services/api';
import { WifiOff, AlertCircle, CheckCircle, Info } from 'lucide-react';

export const WebSocketDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<ReturnType<typeof getEnvironmentInfo> | null>(null);
  const [backendHealth, setBackendHealth] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setDebugInfo(getEnvironmentInfo());
    apiService.healthCheck().then(setBackendHealth);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-sx-elevated border border-sx-border text-sx-muted p-2 transition-colors hover:bg-sx-hover z-50"
        title="Connection debug"
      >
        <Info size={14} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-sx-surface border border-sx-border p-4 max-w-sm z-50 text-xs">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sx-text font-medium">Connection debug</p>
        <button onClick={() => setIsVisible(false)} className="text-sx-faint hover:text-sx-text px-1">
          ×
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {backendHealth === true
            ? <CheckCircle size={12} className="text-sx-success" />
            : backendHealth === false
            ? <AlertCircle size={12} className="text-sx-error" />
            : <WifiOff size={12} className="text-sx-warning" />}
          <span className="text-sx-muted">
            Backend: {backendHealth === true ? 'Healthy' : backendHealth === false ? 'Unreachable' : 'Checking...'}
          </span>
        </div>

        {debugInfo && (
          <>
            <div className="border-t border-sx-border pt-2 mt-2 space-y-2">
              <div>
                <p className="text-sx-faint">Environment</p>
                <p className="text-sx-muted font-mono break-all">{debugInfo.hostname}</p>
              </div>
              <div>
                <p className="text-sx-faint">Backend URL</p>
                <p className="text-sx-muted font-mono break-all">{debugInfo.backendUrl}</p>
              </div>
              <div>
                <p className="text-sx-faint">WebSocket URL</p>
                <p className="text-sx-muted font-mono break-all">{debugInfo.wsUrl}</p>
              </div>
              <div>
                <p className="text-sx-faint">Port mapping</p>
                <p className="text-sx-muted">{debugInfo.frontendPort} → {debugInfo.backendPort}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
