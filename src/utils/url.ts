// Cache for performance - avoid repeated hostname parsing
let cachedBackendUrl: string | null = null;
let cachedWebSocketUrl: string | null = null;

/**
 * Smart port detection patterns for various environments
 */
const PORT_PATTERNS = [
  // Webcontainer patterns
  /--(\d+)--/g,
  // Additional webcontainer patterns
  /--(\d+)--[a-z0-9-]+\.local-credentialless\.webcontainer-api\.io/,
  /--(\d+)--[a-z0-9-]+\.webcontainer\.io/,
  // Codespace patterns  
  /-(\d+)\.app\.github\.dev/,
  // Gitpod patterns
  /(\d+)-[a-z0-9-]+\.ws-[a-z0-9-]+\.gitpod\.io/,
  // Replit patterns
  /--(\d+)--[a-z0-9-]+\.repl\.co/,
  // Custom patterns
  /:(\d+)/,
  /port-(\d+)/,
  /p(\d+)/
];

/**
 * Fast hostname analysis with caching
 */
function analyzeHostname(): { 
  isContainer: boolean; 
  frontendPort: string; 
  backendPort: string; 
  baseHost: string; 
} {
  const hostname = window.location.hostname;
  const port = window.location.port || '80';
  
  // Quick checks first (most common cases)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return {
      isContainer: false,
      frontendPort: port,
      backendPort: '18082',
      baseHost: hostname
    };
  }

  // Container environment detection
  const containerIndicators = ['webcontainer', 'gitpod', 'codespace', 'repl'];
  const isContainer = containerIndicators.some(indicator => hostname.includes(indicator));
  
  if (!isContainer) {
    return {
      isContainer: false,
      frontendPort: port,
      backendPort: '18082',
      baseHost: hostname
    };
  }

  // Smart port extraction for container environments
  let frontendPort = port;
  let baseHost = hostname;
  
  // Try each pattern until we find a match
  for (const pattern of PORT_PATTERNS) {
    const matches = hostname.match(pattern);
    if (matches) {
      if (pattern.global) {
        // For patterns like --5173--
        const ports = [...hostname.matchAll(pattern)];
        if (ports.length > 0) {
          frontendPort = ports[0][1];
          break;
        }
      } else {
        // For single match patterns
        frontendPort = matches[1];
        break;
      }
    }
  }

  return {
    isContainer: true,
    frontendPort,
    backendPort: '18082',
    baseHost: hostname
  };
}

/**
 * Constructs backend URL with smart port mapping
 */
export function getBackendBaseUrl(): string {
  // Return cached result for performance
  if (cachedBackendUrl) {
    return cachedBackendUrl;
  }

  const { isContainer, frontendPort, backendPort, baseHost } = analyzeHostname();
  
  let backendUrl: string;
  
  if (!isContainer) {
    // Local development
    backendUrl = `http://${baseHost}:${backendPort}`;
  } else {
    // Container environment - smart port replacement
    if (baseHost.includes(`--${frontendPort}--`)) {
      // Webcontainer style: --5173-- -> --8080--
      const backendHost = baseHost.replace(`--${frontendPort}--`, `--${backendPort}--`);
      backendUrl = `http://${backendHost}`;
    } else if (baseHost.includes(`-${frontendPort}.`)) {
      // Codespace style: -5173.app -> -8080.app
      const backendHost = baseHost.replace(`-${frontendPort}.`, `-${backendPort}.`);
      backendUrl = `http://${backendHost}`;
    } else if (baseHost.includes(`:${frontendPort}`)) {
      // Standard port style
      const backendHost = baseHost.replace(`:${frontendPort}`, `:${backendPort}`);
      backendUrl = `http://${backendHost}`;
    } else {
      // Fallback: try to replace any occurrence of frontend port
      const backendHost = baseHost.replace(new RegExp(frontendPort, 'g'), backendPort);
      backendUrl = `http://${backendHost}`;
    }
  }

  // Cache the result
  cachedBackendUrl = backendUrl;
  return backendUrl;
}

/**
 * Gets WebSocket URL with smart port mapping
 */
export function getWebSocketUrl(): string {
  // Return cached result for performance
  if (cachedWebSocketUrl) {
    return cachedWebSocketUrl;
  }

  const backendUrl = getBackendBaseUrl();
  const wsUrl = backendUrl.replace(/^https?:\/\//, 'ws://') + '/ws';
  
  // Cache the result
  cachedWebSocketUrl = wsUrl;
  return wsUrl;
}

/**
 * Clears URL cache (useful for testing or environment changes)
 */
export function clearUrlCache(): void {
  cachedBackendUrl = null;
  cachedWebSocketUrl = null;
}

/**
 * Gets current environment info for debugging
 */
export function getEnvironmentInfo(): {
  hostname: string;
  port: string;
  isContainer: boolean;
  frontendPort: string;
  backendPort: string;
  backendUrl: string;
  wsUrl: string;
} {
  const analysis = analyzeHostname();
  return {
    hostname: window.location.hostname,
    port: window.location.port,
    ...analysis,
    backendUrl: getBackendBaseUrl(),
    wsUrl: getWebSocketUrl()
  };
}