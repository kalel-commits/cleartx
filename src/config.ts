// ClearTx Configuration
// Runtime flags for different features

// Helper function to safely check environment variables
function getEnvVar(key: string, defaultValue: string = ''): string {
  try {
    return import.meta.env[key] || defaultValue;
  } catch {
    return defaultValue;
  }
}

interface AppConfig {
  // Tor Network Integration
  TOR_ENABLED: boolean;
  TOR_PROXY: string;
  TOR_ONION_BACKUP: boolean;
  
  // FOSSASIA Integration
  FOSSASIA_ENABLED: boolean;
  SUSI_API_URL: string;
  SUSI_API_KEY: string;
  I18N_ENABLED: boolean;
  
  // Open Transit Integration
  TRANSIT_ENABLED: boolean;
  GTFS_OCR_ENABLED: boolean;
  
  // CCExtractor Integration
  CCEXTRACTOR_ENABLED: boolean;
  
  // Feature toggles
  FEATURES: {
    TOR_VAULT: boolean;
    MULTI_LANGUAGE: boolean;
    TRANSIT_FARES: boolean;
    VIDEO_OCR: boolean;
  };
  
  // Default settings
  DEFAULT_LANGUAGE: string;
  SUPPORTED_LANGUAGES: string[];
  
  // API endpoints
  ENDPOINTS: {
    SUSI: string;
    GTFS: string;
    CCEXTRACTOR: string;
  };
}

const config: AppConfig = {
  TOR_ENABLED: getEnvVar('VITE_TOR') === 'true',
  TOR_PROXY: getEnvVar('VITE_TOR_PROXY', 'socks5://127.0.0.1:9050'),
  TOR_ONION_BACKUP: getEnvVar('VITE_TOR_ONION_BACKUP') === 'true',
  
  FOSSASIA_ENABLED: getEnvVar('VITE_FOSSASIA') === 'true',
  SUSI_API_URL: getEnvVar('VITE_SUSI_API_URL', 'https://api.susi.ai'),
  SUSI_API_KEY: getEnvVar('VITE_SUSI_API_KEY'),
  I18N_ENABLED: getEnvVar('VITE_I18N') === 'true',
  
  TRANSIT_ENABLED: getEnvVar('VITE_TRANSIT') === 'true',
  GTFS_OCR_ENABLED: getEnvVar('VITE_GTFS_OCR') === 'true',
  
  CCEXTRACTOR_ENABLED: getEnvVar('VITE_CCEXTRACTOR') === 'true',
  
  FEATURES: {
    TOR_VAULT: getEnvVar('VITE_TOR_VAULT') === 'true',
    MULTI_LANGUAGE: getEnvVar('VITE_MULTI_LANGUAGE') === 'true',
    TRANSIT_FARES: getEnvVar('VITE_TRANSIT_FARES') === 'true',
    VIDEO_OCR: getEnvVar('VITE_VIDEO_OCR') === 'true',
  },
  
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_LANGUAGES: ['en', 'hi', 'zh'],
  
  ENDPOINTS: {
    SUSI: '/susi/chat.json',
    GTFS: '/api/gtfs',
    CCEXTRACTOR: '/api/extract',
  }
};

export default config;
