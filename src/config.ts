// ClearTx Configuration
// Runtime flags for different features

interface AppConfig {
  // Core features
  TOR_ENABLED: boolean;
  FOSSASIA_ENABLED: boolean;
  TRANSIT_ENABLED: boolean;
  
  // Feature toggles
  FEATURES: {
    TOR_VAULT: boolean;
    MULTI_LANGUAGE: boolean;
    TRANSIT_FARES: boolean;
  };
}

const config: AppConfig = {
  TOR_ENABLED: import.meta.env.VITE_TOR === 'true',
  FOSSASIA_ENABLED: import.meta.env.VITE_FOSSASIA === 'true',
  TRANSIT_ENABLED: import.meta.env.VITE_TRANSIT === 'true',
  
  FEATURES: {
    TOR_VAULT: import.meta.env.VITE_TOR_VAULT === 'true',
    MULTI_LANGUAGE: import.meta.env.VITE_MULTI_LANGUAGE === 'true',
    TRANSIT_FARES: import.meta.env.VITE_TRANSIT_FARES === 'true',
  }
};

export default config;
