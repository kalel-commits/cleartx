// Open Transit GTFS Integration Plugin
// Provides GTFS fare parsing and transit data analysis

import config from '../../config';

class TransitPlugin {
  constructor() {
    this.isEnabled = config.TRANSIT_ENABLED;
    this.gtfsOcrEnabled = config.GTFS_OCR_ENABLED;
    this.gtfsData = new Map();
    this.fareData = new Map();
    this.routes = new Map();
    this.stops = new Map();
    this.agencies = new Map();
  }

  async initialize() {
    if (!this.isEnabled) {
      console.log('Transit plugin disabled');
      return false;
    }

    try {
      // Initialize GTFS data structures
      await this.initializeGTFSData();
      
      // Load fare information if available
      if (this.gtfsOcrEnabled) {
        await this.loadFareData();
      }
      
      console.log('Transit plugin initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Transit plugin:', error);
      return false;
    }
  }

  // Initialize GTFS data structures
  async initializeGTFSData() {
    // In real implementation, load from GTFS files or API
    this.gtfsData.set('agencies', new Map());
    this.gtfsData.set('routes', new Map());
    this.gtfsData.set('stops', new Map());
    this.gtfsData.set('trips', new Map());
    this.gtfsData.set('fare_attributes', new Map());
    this.gtfsData.set('fare_rules', new Map());
  }

  // Load fare data using GTFS-OCR
  async loadFareData() {
    if (!this.gtfsOcrEnabled) {
      return false;
    }

    try {
      // Simulate loading fare data from GTFS files
      // In real implementation, use gtfs-ocr library
      const fareData = await this.parseGTFSFares();
      this.fareData = new Map(Object.entries(fareData));
      
      console.log('Fare data loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load fare data:', error);
      return false;
    }
  }

  // Parse GTFS fare information
  async parseGTFSFares() {
    // Simulate GTFS fare parsing
    // In real implementation, use gtfs-ocr library
    
    const sampleFares = {
      'local_bus': {
        fare_id: 'local_bus',
        price: 2.50,
        currency_type: 'USD',
        payment_method: 1,
        transfers: 2,
        transfer_duration: 7200,
        agency_id: 'local_transit'
      },
      'express_bus': {
        fare_id: 'express_bus',
        price: 4.00,
        currency_type: 'USD',
        payment_method: 1,
        transfers: 1,
        transfer_duration: 3600,
        agency_id: 'local_transit'
      },
      'rail': {
        fare_id: 'rail',
        price: 3.50,
        currency_type: 'USD',
        payment_method: 1,
        transfers: 2,
        transfer_duration: 7200,
        agency_id: 'rail_transit'
      },
      'subway': {
        fare_id: 'subway',
        price: 2.75,
        currency_type: 'USD',
        payment_method: 1,
        transfers: 2,
        transfer_duration: 7200,
        agency_id: 'metro_transit'
      }
    };

    return sampleFares;
  }

  // Calculate fare for a trip
  async calculateFare(origin, destination, routeType = 'local_bus', options = {}) {
    if (!this.isEnabled) {
      return { success: false, error: 'Plugin disabled' };
    }

    try {
      const fareInfo = this.fareData.get(routeType);
      if (!fareInfo) {
        throw new Error(`Fare information not found for route type: ${routeType}`);
      }

      // Calculate base fare
      let totalFare = fareInfo.price;

      // Apply distance-based pricing if available
      if (options.distance && options.distance > 0) {
        totalFare = this.calculateDistanceBasedFare(fareInfo, options.distance);
      }

      // Apply zone-based pricing if available
      if (options.zones && options.zones.length > 0) {
        totalFare = this.calculateZoneBasedFare(fareInfo, options.zones);
      }

      // Apply time-based pricing if available
      if (options.timeOfDay) {
        totalFare = this.applyTimeBasedPricing(fareInfo, options.timeOfDay);
      }

      // Apply transfer pricing if applicable
      if (options.transfers && options.transfers > 0) {
        totalFare = this.calculateTransferFare(fareInfo, options.transfers);
      }

      // Apply discounts if available
      if (options.discounts && options.discounts.length > 0) {
        totalFare = this.applyDiscounts(totalFare, options.discounts);
      }

      return {
        success: true,
        fare: {
          baseFare: fareInfo.price,
          totalFare: Math.round(totalFare * 100) / 100,
          currency: fareInfo.currency_type,
          routeType,
          origin,
          destination,
          transfers: options.transfers || 0,
          transferDuration: fareInfo.transfer_duration,
          paymentMethod: fareInfo.payment_method,
          breakdown: {
            base: fareInfo.price,
            distance: options.distance ? this.calculateDistanceBasedFare(fareInfo, options.distance) - fareInfo.price : 0,
            zones: options.zones ? this.calculateZoneBasedFare(fareInfo, options.zones) - fareInfo.price : 0,
            time: options.timeOfDay ? this.applyTimeBasedPricing(fareInfo, options.timeOfDay) - fareInfo.price : 0,
            transfers: options.transfers ? this.calculateTransferFare(fareInfo, options.transfers) - fareInfo.price : 0,
            discounts: options.discounts ? this.applyDiscounts(totalFare, options.discounts) - totalFare : 0
          }
        }
      };
    } catch (error) {
      console.error('Fare calculation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Calculate distance-based fare
  calculateDistanceBasedFare(fareInfo, distance) {
    // Simple distance-based pricing model
    // In real implementation, use actual GTFS fare rules
    const baseFare = fareInfo.price;
    const distanceRate = 0.15; // per mile
    
    if (distance <= 5) {
      return baseFare;
    } else if (distance <= 10) {
      return baseFare + (distance - 5) * distanceRate;
    } else {
      return baseFare + 5 * distanceRate + (distance - 10) * distanceRate * 1.5;
    }
  }

  // Calculate zone-based fare
  calculateZoneBasedFare(fareInfo, zones) {
    // Zone-based pricing model
    const baseFare = fareInfo.price;
    const zoneRate = 0.50; // per zone
    
    if (zones.length <= 1) {
      return baseFare;
    } else {
      return baseFare + (zones.length - 1) * zoneRate;
    }
  }

  // Apply time-based pricing
  applyTimeBasedPricing(fareInfo, timeOfDay) {
    const baseFare = fareInfo.price;
    const hour = new Date(timeOfDay).getHours();
    
    // Peak hour pricing (7-9 AM, 5-7 PM)
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return baseFare * 1.25;
    }
    
    // Off-peak discount (10 PM - 6 AM)
    if (hour >= 22 || hour <= 6) {
      return baseFare * 0.75;
    }
    
    return baseFare;
  }

  // Calculate transfer fare
  calculateTransferFare(fareInfo, transfers) {
    if (transfers <= fareInfo.transfers) {
      return 0; // Free transfers within limit
    } else {
      const extraTransfers = transfers - fareInfo.transfers;
      return extraTransfers * (fareInfo.price * 0.5); // Half fare for extra transfers
    }
  }

  // Apply discounts
  applyDiscounts(totalFare, discounts) {
    let discountedFare = totalFare;
    
    discounts.forEach(discount => {
      switch (discount.type) {
        case 'senior':
          discountedFare *= 0.75;
          break;
        case 'student':
          discountedFare *= 0.80;
          break;
        case 'child':
          discountedFare *= 0.50;
          break;
        case 'monthly_pass':
          discountedFare *= 0.60;
          break;
        case 'weekly_pass':
          discountedFare *= 0.70;
          break;
        case 'bulk_purchase':
          discountedFare *= 0.90;
          break;
        default:
          // No discount applied
          break;
      }
    });
    
    return Math.round(discountedFare * 100) / 100;
  }

  // Get route information
  async getRouteInfo(routeId) {
    if (!this.isEnabled) {
      return { success: false, error: 'Plugin disabled' };
    }

    try {
      const route = this.routes.get(routeId);
      if (!route) {
        throw new Error(`Route not found: ${routeId}`);
      }

      return {
        success: true,
        route: {
          id: route.route_id,
          name: route.route_long_name || route.route_short_name,
          type: route.route_type,
          agency: route.agency_id,
          description: route.route_desc,
          url: route.route_url,
          color: route.route_color,
          textColor: route.route_text_color
        }
      };
    } catch (error) {
      console.error('Failed to get route info:', error);
      return {
        success: false,
        error: error.message
      };
      }
  }

  // Get stop information
  async getStopInfo(stopId) {
    if (!this.isEnabled) {
      return { success: false, error: 'Plugin disabled' };
    }

    try {
      const stop = this.stops.get(stopId);
      if (!stop) {
        throw new Error(`Stop not found: ${stopId}`);
      }

      return {
        success: true,
        stop: {
          id: stop.stop_id,
          name: stop.stop_name,
          description: stop.stop_desc,
          latitude: stop.stop_lat,
          longitude: stop.stop_lon,
          zone: stop.zone_id,
          url: stop.stop_url,
          wheelchair: stop.wheelchair_boarding
        }
      };
    } catch (error) {
      console.error('Failed to get stop info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get agency information
  async getAgencyInfo(agencyId) {
    if (!this.isEnabled) {
      return { success: false, error: 'Plugin disabled' };
    }

    try {
      const agency = this.agencies.get(agencyId);
      if (!agency) {
        throw new Error(`Agency not found: ${agencyId}`);
      }

      return {
        success: true,
        agency: {
          id: agency.agency_id,
          name: agency.agency_name,
          url: agency.agency_url,
          timezone: agency.agency_timezone,
          phone: agency.agency_phone,
          language: agency.agency_lang
        }
      };
    } catch (error) {
      console.error('Failed to get agency info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get fare rules for a route
  async getFareRules(routeId) {
    if (!this.isEnabled || !this.gtfsOcrEnabled) {
      return { success: false, error: 'Plugin or GTFS-OCR disabled' };
    }

    try {
      // In real implementation, query GTFS fare_rules table
      const fareRules = Array.from(this.fareData.values()).filter(fare => 
        fare.route_id === routeId || !fare.route_id
      );

      return {
        success: true,
        fareRules: fareRules.map(rule => ({
          fareId: rule.fare_id,
          routeId: rule.route_id,
          originId: rule.origin_id,
          destinationId: rule.destination_id,
          containsId: rule.contains_id,
          price: rule.price,
          currency: rule.currency_type
        }))
      };
    } catch (error) {
      console.error('Failed to get fare rules:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all available fare types
  async getAvailableFares() {
    if (!this.isEnabled || !this.gtfsOcrEnabled) {
      return { success: false, error: 'Plugin or GTFS-OCR disabled' };
    }

    try {
      const fares = Array.from(this.fareData.values()).map(fare => ({
        id: fare.fare_id,
        price: fare.price,
        currency: fare.currency_type,
        paymentMethod: fare.payment_method,
        transfers: fare.transfers,
        transferDuration: fare.transfer_duration,
        agencyId: fare.agency_id
      }));

      return {
        success: true,
        fares
      };
    } catch (error) {
      console.error('Failed to get available fares:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get plugin status
  getStatus() {
    return {
      enabled: this.isEnabled,
      gtfsOcrEnabled: this.gtfsOcrEnabled,
      fareDataLoaded: this.fareData.size > 0,
      routesCount: this.routes.size,
      stopsCount: this.stops.size,
      agenciesCount: this.agencies.size,
      fareTypesCount: this.fareData.size
    };
  }
}

// Export singleton instance
const transitPlugin = new TransitPlugin();
export default transitPlugin;

// Export individual methods for direct use
export const {
  initialize,
  calculateFare,
  getRouteInfo,
  getStopInfo,
  getAgencyInfo,
  getFareRules,
  getAvailableFares,
  getStatus
} = transitPlugin;
