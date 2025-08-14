import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import config from './config'

import pluginManager from './plugins/plugin-manager.js'

// Global plugin instances
declare global {
  interface Window {
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

        // Plugin initialization will be implemented in future phases
        // For now, we're focusing on core functionality

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


