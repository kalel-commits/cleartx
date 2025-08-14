import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import config from './config'
import torPlugin from './plugins/tor/tor.js'
import susiPlugin from './plugins/fossasia/susi.js'
import transitPlugin from './plugins/transit/transit.js'
import pluginManager from './plugins/plugin-manager.js'

// Global plugin instances
declare global {
  interface Window {
    torPlugin: typeof torPlugin;
    susiPlugin: typeof susiPlugin;
    transitPlugin: typeof transitPlugin;
    ccextractorPlugin: any;
    pluginManager: typeof pluginManager;
    appConfig: typeof config;
  }
}

export default function App() {
  useEffect(() => {
    const initializePlugins = async () => {
      try {
        // Initialize plugin manager
        await pluginManager.initialize();
        window.pluginManager = pluginManager;
        window.appConfig = config;

        // Initialize Tor plugin if enabled
        if (config.TOR_ENABLED) {
          await torPlugin.initialize();
          window.torPlugin = torPlugin;
          
          // Migrate data from localStorage if Tor vault is enabled
          if (config.FEATURES.TOR_VAULT) {
            await torPlugin.migrateFromLocalStorage();
          }
        }

        // Initialize FOSSASIA plugin if enabled
        if (config.FOSSASIA_ENABLED) {
          await susiPlugin.initialize();
          window.susiPlugin = susiPlugin;
        }

        // Initialize Transit plugin if enabled
        if (config.TRANSIT_ENABLED) {
          await transitPlugin.initialize();
          window.transitPlugin = transitPlugin;
        }

        // Initialize CCExtractor plugin if enabled
        if (config.CCEXTRACTOR_ENABLED) {
          window.ccextractorPlugin = {
            status: 'enabled',
            capabilities: ['video_ocr', 'receipt_extraction'],
            extractReceipt: async (videoFile: File) => {
              return { status: 'simulated', message: 'Video processing simulated' };
            }
          };
        }

      } catch (error) {
        console.error('Error initializing plugins:', error);
      }
    };

    initializePlugins();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}


