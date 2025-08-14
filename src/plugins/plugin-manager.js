// Plugin Manager for ClearTx
// Manages initialization and coordination of all plugins

import config from '../config';
import torPlugin from './tor/tor.js';
import susiPlugin from './fossasia/susi.js';
import transitPlugin from './transit/transit.js';

class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.initialized = false;
    this.initializationPromise = null;
  }

  async initialize() {
    if (this.initialized) {
      return true;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initializePlugins();
    return this.initializationPromise;
  }

  async _initializePlugins() {
    try {
      console.log('Initializing ClearTx plugins...');

      // Initialize Tor plugin
      if (config.TOR_ENABLED) {
        console.log('Initializing Tor plugin...');
        const torSuccess = await torPlugin.initialize();
        if (torSuccess) {
          this.plugins.set('tor', torPlugin);
          console.log('Tor plugin initialized successfully');
        } else {
          console.warn('Tor plugin initialization failed');
        }
      }

      // Initialize FOSSASIA plugin
      if (config.FOSSASIA_ENABLED) {
        console.log('Initializing FOSSASIA plugin...');
        const susiSuccess = await susiPlugin.initialize();
        if (susiSuccess) {
          this.plugins.set('fossasia', susiPlugin);
          console.log('FOSSASIA plugin initialized successfully');
        } else {
          console.warn('FOSSASIA plugin initialization failed');
        }
      }

      // Initialize Transit plugin
      if (config.TRANSIT_ENABLED) {
        console.log('Initializing Transit plugin...');
        const transitSuccess = await transitPlugin.initialize();
        if (transitSuccess) {
          this.plugins.set('transit', transitPlugin);
          console.log('Transit plugin initialized successfully');
        } else {
          console.warn('Transit plugin initialization failed');
        }
      }

      this.initialized = true;
      console.log('Plugin initialization completed');
      return true;

    } catch (error) {
      console.error('Plugin initialization failed:', error);
      return false;
    }
  }

  // Get plugin by name
  getPlugin(name) {
    return this.plugins.get(name);
  }

  // Check if plugin is available
  isPluginAvailable(name) {
    return this.plugins.has(name);
  }

  // Get all available plugins
  getAvailablePlugins() {
    return Array.from(this.plugins.keys());
  }

  // Get plugin status
  getPluginStatus(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      return { available: false, error: 'Plugin not found' };
    }

    try {
      return {
        available: true,
        status: plugin.getStatus ? plugin.getStatus() : { enabled: true }
      };
    } catch (error) {
      return { available: true, error: error.message };
    }
  }

  // Get overall system status
  getSystemStatus() {
    const status = {
      initialized: this.initialized,
      totalPlugins: this.plugins.size,
      availablePlugins: this.getAvailablePlugins(),
      pluginStatuses: {}
    };

    for (const [name, plugin] of this.plugins) {
      status.pluginStatuses[name] = this.getPluginStatus(name);
    }

    return status;
  }

  // Execute function on all plugins
  async executeOnAllPlugins(funcName, ...args) {
    const results = new Map();

    for (const [name, plugin] of this.plugins) {
      try {
        if (typeof plugin[funcName] === 'function') {
          const result = await plugin[funcName](...args);
          results.set(name, { success: true, result });
        } else {
          results.set(name, { success: false, error: `Method ${funcName} not found` });
        }
      } catch (error) {
        results.set(name, { success: false, error: error.message });
      }
    }

    return results;
  }

  // Get plugin capabilities
  getPluginCapabilities() {
    const capabilities = {};

    // Tor plugin capabilities
    if (this.isPluginAvailable('tor')) {
      capabilities.tor = {
        encryptedStorage: true,
        onionBackups: config.TOR_ONION_BACKUP,
        vaultStorage: config.FEATURES.TOR_VAULT,
        networkPrivacy: true
      };
    }

    // FOSSASIA plugin capabilities
    if (this.isPluginAvailable('fossasia')) {
      capabilities.fossasia = {
        aiAnalysis: true,
        multiLanguage: config.FEATURES.MULTI_LANGUAGE,
        susiIntegration: true,
        spendingInsights: true
      };
    }

    // Transit plugin capabilities
    if (this.isPluginAvailable('transit')) {
      capabilities.transit = {
        gtfsSupport: true,
        fareCalculation: config.FEATURES.TRANSIT_FARES,
        routeAnalysis: true,
        stopInformation: true
      };
    }

    return capabilities;
  }

  // Migrate data between plugins
  async migrateData(fromPlugin, toPlugin, dataType) {
    try {
      const sourcePlugin = this.plugins.get(fromPlugin);
      const targetPlugin = this.plugins.get(toPlugin);

      if (!sourcePlugin || !targetPlugin) {
        throw new Error('Source or target plugin not found');
      }

      // Handle specific migration scenarios
      if (fromPlugin === 'localStorage' && toPlugin === 'tor') {
        return await torPlugin.migrateFromLocalStorage();
      }

      // Add more migration scenarios as needed
      throw new Error(`Migration from ${fromPlugin} to ${toPlugin} not implemented`);

    } catch (error) {
      console.error('Data migration failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Backup all plugin data
  async backupAllPlugins() {
    const backups = new Map();

    for (const [name, plugin] of this.plugins) {
      try {
        if (name === 'tor' && config.TOR_ONION_BACKUP) {
          // Create onion backup for Tor plugin
          const data = await this._collectPluginData(plugin);
          const backup = await torPlugin.createOnionBackup(data, `backup_${name}_${Date.now()}`);
          backups.set(name, { success: true, backup });
        } else {
          // Regular backup for other plugins
          const data = await this._collectPluginData(plugin);
          backups.set(name, { success: true, data });
        }
      } catch (error) {
        backups.set(name, { success: false, error: error.message });
      }
    }

    return backups;
  }

  // Collect data from a plugin for backup
  async _collectPluginData(plugin) {
    const data = {};

    // Try to get plugin data using common methods
    if (typeof plugin.getData === 'function') {
      data.pluginData = await plugin.getData();
    }

    if (typeof plugin.getStatus === 'function') {
      data.status = plugin.getStatus();
    }

    if (typeof plugin.getConfig === 'function') {
      data.config = plugin.getConfig();
    }

    return data;
  }

  // Restore plugin data
  async restorePluginData(pluginName, backupData) {
    try {
      const plugin = this.plugins.get(pluginName);
      if (!plugin) {
        throw new Error(`Plugin ${pluginName} not found`);
      }

      if (pluginName === 'tor' && backupData.backup) {
        // Restore from onion backup
        const restored = await torPlugin.restoreFromOnionBackup(backupData.backup.id);
        return { success: true, restored };
      } else {
        // Regular restore
        if (typeof plugin.restoreData === 'function') {
          const restored = await plugin.restoreData(backupData);
          return { success: true, restored };
        } else {
          throw new Error(`Plugin ${pluginName} does not support data restoration`);
        }
      }

    } catch (error) {
      console.error('Plugin data restoration failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get plugin configuration
  getPluginConfig(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      return null;
    }

    // Return plugin-specific configuration
    switch (pluginName) {
      case 'tor':
        return {
          enabled: config.TOR_ENABLED,
          proxy: config.TOR_PROXY,
          onionBackup: config.TOR_ONION_BACKUP,
          vaultStorage: config.FEATURES.TOR_VAULT
        };
      
      case 'fossasia':
        return {
          enabled: config.FOSSASIA_ENABLED,
          susiApiUrl: config.SUSI_API_URL,
          multiLanguage: config.FEATURES.MULTI_LANGUAGE,
          supportedLanguages: config.SUPPORTED_LANGUAGES
        };
      
      case 'transit':
        return {
          enabled: config.TRANSIT_ENABLED,
          gtfsOcr: config.GTFS_OCR_ENABLED,
          transitFares: config.FEATURES.TRANSIT_FARES
        };
      
      default:
        return null;
    }
  }

  // Update plugin configuration
  async updatePluginConfig(pluginName, newConfig) {
    try {
      const plugin = this.plugins.get(pluginName);
      if (!plugin) {
        throw new Error(`Plugin ${pluginName} not found`);
      }

      if (typeof plugin.updateConfig === 'function') {
        const result = await plugin.updateConfig(newConfig);
        return { success: true, result };
      } else {
        throw new Error(`Plugin ${pluginName} does not support configuration updates`);
      }

    } catch (error) {
      console.error('Plugin configuration update failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get plugin metrics
  getPluginMetrics() {
    const metrics = {
      totalPlugins: this.plugins.size,
      enabledPlugins: 0,
      disabledPlugins: 0,
      pluginTypes: {
        privacy: 0,
        ai: 0,
        transit: 0,
        ocr: 0
      }
    };

    for (const [name, plugin] of this.plugins) {
      const status = this.getPluginStatus(name);
      if (status.available && status.status?.enabled) {
        metrics.enabledPlugins++;
      } else {
        metrics.disabledPlugins++;
      }

      // Categorize plugins
      if (name === 'tor') metrics.pluginTypes.privacy++;
      if (name === 'fossasia') metrics.pluginTypes.ai++;
      if (name === 'transit') metrics.pluginTypes.transit++;
      if (name === 'ccextractor') metrics.pluginTypes.ocr++;
    }

    return metrics;
  }
}

// Create and export singleton instance
const pluginManager = new PluginManager();
export default pluginManager;

// Export individual methods for direct use
export const {
  initialize,
  getPlugin,
  isPluginAvailable,
  getAvailablePlugins,
  getPluginStatus,
  getSystemStatus,
  executeOnAllPlugins,
  getPluginCapabilities,
  migrateData,
  backupAllPlugins,
  restorePluginData,
  getPluginConfig,
  updatePluginConfig,
  getPluginMetrics
} = pluginManager;
