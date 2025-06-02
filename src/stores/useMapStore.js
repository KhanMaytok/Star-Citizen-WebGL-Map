import { defineStore } from 'pinia';
import Route from '../scmap/route'; // Assuming refactored Route class
// StarSystem may not be directly needed here if Route class handles system objects internally
// import StarSystem from '../scmap/star-system'; 

function formatDurationHMM(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || totalSeconds < 0) return 'N/A';
  if (totalSeconds === 0) return '0m';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  let str = '';
  if (hours > 0) {
    str += `${hours}h `;
  }
  str += `${minutes}m`;
  return str;
}

// Helper function to safely parse JSON from localStorage/sessionStorage
function getFromStorage(storage, key, defaultValue) {
  if (typeof storage === 'undefined') return defaultValue;
  const storedValue = storage.getItem(key);
  if (storedValue === null) return defaultValue;
  try {
    return JSON.parse(storedValue);
  } catch (e) {
    console.error(`Error parsing storage item ${key}:`, e);
    return defaultValue;
  }
}


export const useMapStore = defineStore('map', {
  state: () => ({
    // SCMAP instance (set by App.vue or similar)
    _scmapInstance: null,

    // Current Route related
    currentRoute: null, 
    routeWaypointsForDisplay: [], 
    routeStatusText: 'No route set.',
    routeStatusClass: 'no-route muted', 
    totalRouteDuration: 0,

    // Selected System related
    selectedSystemId: getFromStorage(typeof sessionStorage !== 'undefined' ? sessionStorage : undefined, 'selectedSystemId', null),
    selectedSystemDetails: null, // Populated by selectSystem action
    selectedSystemPrevNextInRoute: { prev: null, next: null },

    // User specific settings for each system (bookmarks, hangar, avoid, comments)
    userSystemSettings: getFromStorage(typeof localStorage !== 'undefined' ? localStorage : undefined, 'userSystemSettings', {}), // { systemId: { bookmarked, hangar, avoid, comments } }

    // Systems Listing related
    systemListGroups: [], // Populated by refreshSystemListGroups action

    // Debug Data
    rendererStats: { calls: 0, faces: 0, points: 0, vertices: 0 },
    memoryStats: { geometries: 0, textures: 0 },
    loadedSystemsCount: 0,
  }),

  actions: {
    // --- SCMAP Instance Management ---
    setScmapInstance(instance) {
      this._scmapInstance = instance;
    },

    // --- Route Management ---
    _recalculateRouteForDisplay() {
      if (!this.currentRoute || !this.currentRoute.isSet()) {
        this.routeWaypointsForDisplay = [];
        this.totalRouteDuration = 0;
        const lastError = this.currentRoute ? this.currentRoute.lastError() : null;
        if (lastError) {
          this.routeStatusText = `Error: ${lastError.message || 'Could not calculate route.'}`;
          this.routeStatusClass = 'route-error error';
        } else {
          this.routeStatusText = 'No route set.';
          this.routeStatusClass = 'no-route muted';
        }
        this._updatePrevNextInRouteForSelectedSystem(); // Update nav even if route is cleared
        return;
      }

      const routePath = this.currentRoute.currentRoute();
      const displayWaypoints = [];
      routePath.forEach((node, index) => {
        let durationFromPrevious = 0;
        if (index > 0) {
          const prevNode = routePath[index - 1];
          durationFromPrevious = node.distance - prevNode.distance;
        }
        const isActualWaypoint = this.currentRoute.waypoints.some(wp => wp.id === node.system.id);
        const isStartOrEnd = index === 0 || index === routePath.length - 1;

        displayWaypoints.push({
          systemName: node.system.name,
          systemId: node.system.id,
          durationText: index > 0 ? formatDurationHMM(durationFromPrevious) : '',
          isStart: index === 0,
          isEnd: index === routePath.length - 1,
          isWaypoint: isActualWaypoint || isStartOrEnd,
          iconClass: isStartOrEnd ? 'fa-map-marker' : (isActualWaypoint ? 'fa-flag-checkered' : 'fa-arrow-right'),
          iconTitle: isStartOrEnd ? (index === 0 ? 'Start' : 'Destination') : (isActualWaypoint ? 'Waypoint' : 'Jump'),
          system: node.system, // Keep the original system object for actions
        });
      });

      this.routeWaypointsForDisplay = displayWaypoints;
      this.totalRouteDuration = routePath.length > 0 ? routePath[routePath.length - 1].distance : 0;

      if (this.currentRoute.lastError()) {
        this.routeStatusText = `Error: ${this.currentRoute.lastError().message}`;
        this.routeStatusClass = 'route-error error';
      } else if (routePath.length > 0) {
        this.routeStatusText = `Route calculated.`;
        this.routeStatusClass = 'route-ok success';
      } else {
        this.routeStatusText = 'No route possible with current settings.';
        this.routeStatusClass = 'route-error warning';
      }
      this._updatePrevNextInRouteForSelectedSystem();
    },

    initRoute(routeSettingsObject) {
      if (!this._scmapInstance) {
        console.error("SCMAP instance is required to initialize route. Call setScmapInstance first.");
        this.routeStatusText = "Error: SCMAP not initialized.";
        this.routeStatusClass = "route-error error";
        return;
      }
      this.currentRoute = new Route(null, [], this._scmapInstance, routeSettingsObject, this._scmapInstance.config);
      this.currentRoute.restoreFromSession(this._scmapInstance);
      this._recalculateRouteForDisplay();
    },

    setRouteWaypoints(startSystem, waypointsArray, routeSettingsObject) {
      if (!this._scmapInstance) return; // Guard
      if (!this.currentRoute) this.initRoute(routeSettingsObject);
      
      this.currentRoute.routingSettings = routeSettingsObject; // Update settings
      this.currentRoute.setRoute(startSystem, ...waypointsArray);
      this.currentRoute.storeToSession();
      this._recalculateRouteForDisplay();
    },

    removeWaypointFromRoute(systemToRemove, routeSettingsObject) {
      if (!this.currentRoute || !this._scmapInstance) return;
      this.currentRoute.routingSettings = routeSettingsObject; // Update settings

      const result = this.currentRoute.removeWaypoint(systemToRemove);
      if (result) {
        this.currentRoute.storeToSession();
        this._recalculateRouteForDisplay();
      }
    },

    clearRoute(routeSettingsObject) {
      if (!this.currentRoute || !this._scmapInstance) return;
      this.currentRoute.routingSettings = routeSettingsObject; // Update settings
      
      this.currentRoute.destroy();
      this.currentRoute.storeToSession();
      this._recalculateRouteForDisplay();
    },

    updateRoutePreferences(routeSettingsObject) {
      if (!this.currentRoute || !this.currentRoute.isSet() || !this._scmapInstance) return;
      this.currentRoute.routingSettings = routeSettingsObject; // Update settings

      this.currentRoute.rebuildCurrentRoute();
      this.currentRoute.storeToSession();
      this._recalculateRouteForDisplay();
    },

    // --- Selected System Management ---
    selectSystem(systemId, settingsStoreRef) { // Pass settingsStore for setActiveTab
      if (!this._scmapInstance) return;
      const system = this._scmapInstance.getStarSystemById(systemId);
      if (system) {
        this.selectedSystemId = systemId;
        // Populate selectedSystemDetails (simplified, adapt from old displayInfo)
        this.selectedSystemDetails = {
          id: system.id,
          name: system.name,
          nickname: system.nickname,
          faction: system.faction ? { name: system.faction.name, color: system.faction.color } : { name: 'Unclaimed', color: '#FFFFFF' },
          description: system.description,
          importCommodities: system.import.map(id => this._scmapInstance.getCommodityById(id)?.name || id).join(', ') || 'N/A',
          exportCommodities: system.export.map(id => this._scmapInstance.getCommodityById(id)?.name || id).join(', ') || 'N/A',
          blackMarketCommodities: system.blackMarket.map(id => this._scmapInstance.getCommodityById(id)?.name || id).join(', ') || 'N/A',
          crimeStatus: system.crimeStatus || { name: 'N/A' }, // Assuming crimeStatus is an object with 'name'
          ueeStrategicValue: system.ueeStrategicValue || { color: 'N/A' }, // Assuming ueeStrategicValue has 'color'
          jumpPoints: system.jumpPoints.map(jp => ({
            destination: { id: jp.destination.id, name: jp.destination.name },
            size: jp.size,
            distanceInLY: jp.distanceInLY,
          })),
          infoArticles: system.info || [], // Assuming system.info is array of { article, source }
        };
        this._updatePrevNextInRouteForSelectedSystem();
        if (settingsStoreRef) {
          settingsStoreRef.setActiveTab('system-info-tab-panel');
        }
      } else {
        this.selectedSystemId = null;
        this.selectedSystemDetails = null;
        this.selectedSystemPrevNextInRoute = { prev: null, next: null };
      }
    },
    
    _updatePrevNextInRouteForSelectedSystem() {
        this.selectedSystemPrevNextInRoute = { prev: null, next: null };
        if (this.selectedSystemId && this.currentRoute && this.currentRoute.isSet()) {
            const routePath = this.currentRoute.currentRoute();
            const currentIndex = routePath.findIndex(node => node.system.id === this.selectedSystemId);
            if (currentIndex > -1) {
                if (currentIndex > 0) {
                    this.selectedSystemPrevNextInRoute.prev = routePath[currentIndex - 1].system;
                }
                if (currentIndex < routePath.length - 1) {
                    this.selectedSystemPrevNextInRoute.next = routePath[currentIndex + 1].system;
                }
            }
        }
    },

    // --- User System Settings Management ---
    initUserSystemSettings() {
      // Already loaded from localStorage in state definition.
      // This action could be used for any further initialization if needed.
    },
    _ensureUserSystemEntry(systemId) {
      if (!this.userSystemSettings[systemId]) {
        this.userSystemSettings[systemId] = { bookmarked: false, hangar: false, avoid: false, comments: '' };
      }
    },
    setSystemBookmark(systemId, isBookmarked) {
      this._ensureUserSystemEntry(systemId);
      this.userSystemSettings[systemId].bookmarked = isBookmarked;
    },
    setSystemHangar(systemId, hasHangar) {
      this._ensureUserSystemEntry(systemId);
      this.userSystemSettings[systemId].hangar = hasHangar;
    },
    setSystemAvoid(systemId, shouldAvoid, currentRouteSettings) { // Pass currentRouteSettings
      this._ensureUserSystemEntry(systemId);
      if (this.userSystemSettings[systemId].avoid !== shouldAvoid) {
        this.userSystemSettings[systemId].avoid = shouldAvoid;
        // If a route is set and this system is part of it or could be, recalculate.
        // This check could be more sophisticated.
        if (this.currentRoute && this.currentRoute.isSet()) {
            console.log("Avoid setting changed for a system, consider updating route preferences if it affects the current route.");
            // Potentially call updateRoutePreferences if the change might affect the current route
            // For now, this is handled by a global watch on avoid settings in App.vue.
            // If this specific system's avoid status should trigger a recalc, that's more complex.
        }
      }
    },
    setSystemComments(systemId, commentsText) {
      this._ensureUserSystemEntry(systemId);
      this.userSystemSettings[systemId].comments = commentsText;
    },

    // --- Systems List Management ---
    refreshSystemListGroups() {
      if (!this._scmapInstance || !this._scmapInstance.allSystems) {
        this.systemListGroups = [];
        return;
      }
      // Simplified version of UI.buildDynamicLists()
      // This will need access to faction data, etc. from _scmapInstance
      const allSystems = this._scmapInstance.allSystems; // Array of StarSystem instances
      const groups = [];

      // Group 1: All Systems (sorted by name) - assuming allSystems is already sorted or SCMAP handles it
      const allSystemsItems = allSystems.map(sys => {
        const userSettings = this.userSystemSettings[sys.id] || {};
        const iconClasses = [];
        if (userSettings.bookmarked) iconClasses.push('fa fa-bookmark');
        if (userSettings.hangar) iconClasses.push('fa fa-home'); // Assuming hangar uses home icon
        if (userSettings.comments) iconClasses.push('fa fa-comments');
        // Add other icons based on system properties (e.g., trade hub, offlimits)
        if (sys.isMajorTradeHub) iconClasses.push('fa fa-anchor'); // Example
        if (sys.isOffLimits) iconClasses.push('fa fa-ban'); // Example

        return {
          id: sys.id,
          name: sys.name,
          factionName: sys.faction ? sys.faction.name : 'Unclaimed',
          factionColor: sys.faction ? sys.faction.color : '#FFFFFF', // hex string
          iconClasses: iconClasses,
        };
      });
      groups.push({ title: 'All Systems (Sorted by Name)', items: allSystemsItems });
      
      // Group 2: Systems by Faction
      const systemsByFaction = {};
      allSystems.forEach(sys => {
        const factionName = sys.faction ? sys.faction.name : 'Unclaimed';
        if (!systemsByFaction[factionName]) {
          systemsByFaction[factionName] = {
            faction: factionName,
            color: sys.faction ? sys.faction.color : '#FFFFFF',
            items: []
          };
        }
        const userSettings = this.userSystemSettings[sys.id] || {};
        const iconClasses = [];
        if (userSettings.bookmarked) iconClasses.push('fa fa-bookmark');
        // ... other icons
        systemsByFaction[factionName].items.push({ 
            id: sys.id, name: sys.name, iconClasses 
        });
      });
      groups.push({ title: 'Systems by Faction', factions: Object.values(systemsByFaction) });

      this.systemListGroups = groups;
    },

    // --- Debug Data Actions ---
    updateRendererStats(statsObject) {
      this.rendererStats = { ...this.rendererStats, ...statsObject };
    },
    updateMemoryStats(statsObject) {
      this.memoryStats = { ...this.memoryStats, ...statsObject };
    },
    setLoadedSystemsCount(count) {
      this.loadedSystemsCount = count;
    },
  }
});

// Setup $subscribe for persistence
if (typeof window !== 'undefined') {
  const mapStoreInstance = useMapStore();
  mapStoreInstance.$subscribe((mutation, state) => {
    if (state.hasOwnProperty('selectedSystemId')) {
      sessionStorage.setItem('selectedSystemId', JSON.stringify(state.selectedSystemId));
    }
    if (state.hasOwnProperty('userSystemSettings')) {
      localStorage.setItem('userSystemSettings', JSON.stringify(state.userSystemSettings));
    }
    // Note: rendererStats, memoryStats, loadedSystemsCount are not persisted by default.
    // They are runtime debug values.
  });
}
