import { defineStore } from 'pinia';
import defaultMapConfig from '../scmap/config'; // To get default values

const UI_WIDTH_CLASSES = ['widthXS', 'widthS', 'widthN', 'widthL', 'widthXL'];
const DEFAULT_UI_WIDTH_INDEX = 2; // Corresponds to 'widthN'

// Helper function to safely parse JSON from localStorage
function getFromLocalStorage(key, defaultValue) {
  if (typeof localStorage === 'undefined') return defaultValue;
  const storedValue = localStorage.getItem(key);
  if (storedValue === null) return defaultValue;
  try {
    return JSON.parse(storedValue);
  } catch (e) {
    console.error(`Error parsing localStorage item ${key}:`, e);
    return defaultValue;
  }
}

// Helper function to safely parse JSON from sessionStorage
function getFromSessionStorage(key, defaultValue) {
  if (typeof sessionStorage === 'undefined') return defaultValue;
  const storedValue = sessionStorage.getItem(key);
  if (storedValue === null) return defaultValue;
  try {
    return JSON.parse(storedValue);
  } catch (e) {
    console.error(`Error parsing sessionStorage item ${key}:`, e);
    return defaultValue;
  }
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // From settings.js defaults or common usage
    glow: getFromLocalStorage('settingGlow', true),
    labels: getFromLocalStorage('settingLabels', true),
    labelIcons: getFromLocalStorage('settingLabelIcons', true),
    
    labelScale: getFromLocalStorage('settingLabelScale', parseFloat(defaultMapConfig.defaultLabelScale)),
    labelOffset: getFromLocalStorage('settingLabelOffset', parseFloat(defaultMapConfig.defaultLabelOffset)),
    systemScale: getFromLocalStorage('settingSystemScale', parseFloat(defaultMapConfig.defaultSystemScale)), // Note: original settings.js had this at 0.5, but defaultMapConfig.defaultSystemScale is 1.0. Using defaultMapConfig.
    
    // UI related, previously from ui.js
    uiWidthClassIndex: getFromLocalStorage('settingUiWidthIndex', DEFAULT_UI_WIDTH_INDEX), // Store index for UI width class
    rendererStats: getFromLocalStorage('settingRendererStats', false), // For the framerate stats toggle

    // Route settings from settings.js (flattened)
    routeAvoidHostile: getFromLocalStorage('settingRouteAvoidHostile', true), // Defaulted to true based on common preference
    routeAvoidUnknownJumppoints: getFromLocalStorage('settingRouteAvoidUnknown', true), // Defaulted to true
    routeAvoidOffLimits: getFromLocalStorage('settingRouteAvoidOffLimits', false),

    // Effects from settings.js
    effectAntialias: getFromLocalStorage('settingEffectAntialias', false), // Typically off by default due to performance
    effectFXAA: getFromLocalStorage('settingEffectFXAA', true),
    effectBloom: getFromLocalStorage('settingEffectBloom', true),

    // Session specific settings
    selectedSystemId: getFromSessionStorage('selectedSystemId', null),
    activeTab: getFromSessionStorage('activeTab', 'usage-tab-panel'), // Default to 'usage' tab id

    // New settings for QuickFunctionsPanel
    mapMode: getFromLocalStorage('settingMapMode', '3d'), // '2d' or '3d'
    cameraRotationLocked: getFromLocalStorage('settingCameraRotationLocked', false),

    // For DebugPanel stats visibility toggle
    showRendererStats: getFromLocalStorage('settingShowRendererStats', false), 
  }),

  getters: {
    // Getter to compute the actual UI width class string
    uiWidthClass: (state) => UI_WIDTH_CLASSES[state.uiWidthClassIndex] || UI_WIDTH_CLASSES[DEFAULT_UI_WIDTH_INDEX],
    // Min/max values for sliders, derived from defaultMapConfig
    minLabelScale: () => parseFloat(defaultMapConfig.minLabelScale),
    maxLabelScale: () => parseFloat(defaultMapConfig.maxLabelScale),
    minLabelOffset: () => parseFloat(defaultMapConfig.minLabelOffset),
    maxLabelOffset: () => parseFloat(defaultMapConfig.maxLabelOffset),
    minSystemScale: () => parseFloat(defaultMapConfig.minSystemScale),
    maxSystemScale: () => parseFloat(defaultMapConfig.maxSystemScale),
    uiWidthMinIndex: () => 0,
    uiWidthMaxIndex: () => UI_WIDTH_CLASSES.length - 1,
    
    // Getter to group route settings for easier passing
    routeSettings: (state) => ({
      avoidHostile: state.routeAvoidHostile,
      avoidUnknownJumppoints: state.routeAvoidUnknownJumppoints,
      avoidOffLimits: state.routeAvoidOffLimits,
      // Include other relevant settings if Route class needs them
    }),
  },

  actions: {
    // Actions to update each setting
    setGlow(value) { this.glow = value; },
    setLabels(value) { this.labels = value; },
    setLabelIcons(value) { this.labelIcons = value; },
    setLabelScale(value) { this.labelScale = parseFloat(value); },
    setLabelOffset(value) { this.labelOffset = parseFloat(value); },
    setSystemScale(value) { this.systemScale = parseFloat(value); },
    setUiWidthClassIndex(value) { this.uiWidthClassIndex = parseInt(value, 10); },
    setRendererStats(value) { this.rendererStats = value; },
    setRouteAvoidHostile(value) { this.routeAvoidHostile = value; },
    setRouteAvoidUnknownJumppoints(value) { this.routeAvoidUnknownJumppoints = value; },
    setRouteAvoidOffLimits(value) { this.routeAvoidOffLimits = value; },
    setEffectAntialias(value) { this.effectAntialias = value; },
    setEffectFXAA(value) { this.effectFXAA = value; },
    setEffectBloom(value) { this.effectBloom = value; },
    setSelectedSystemId(value) { this.selectedSystemId = value; },
    setActiveTab(value) { this.activeTab = value; },
    setMapMode(mode) { // mode should be '2d' or '3d'
      if (['2d', '3d'].includes(mode)) {
        this.mapMode = mode;
      }
    },
    setCameraRotationLocked(isLocked) { this.cameraRotationLocked = isLocked; },
    setShowRendererStats(value) { this.showRendererStats = value; },

    // Action to cycle UI width for convenience if needed elsewhere, e.g. a button
    cycleUiWidth() {
      let newIndex = this.uiWidthClassIndex + 1;
      if (newIndex >= UI_WIDTH_CLASSES.length) {
        newIndex = 0;
      }
      this.uiWidthClassIndex = newIndex;
    }
  },
});

// Setup $subscribe for persistence
if (typeof window !== 'undefined') { // Ensure localStorage/sessionStorage are available
  const store = useSettingsStore();

  store.$subscribe((mutation, state) => {
    // For each state property, decide if it goes to localStorage or sessionStorage
    // Mutation.storeId tells you which store changed, mutation.payload has the changes (if any)
    // mutation.type is 'direct' for direct changes, 'patch object' for $patch, 'patch function' for $patch(fn)

    // Properties for localStorage
    const persistToLocalStorage = [
      'glow', 'labels', 'labelIcons', 'labelScale', 'labelOffset', 'systemScale',
      'uiWidthClassIndex', 'rendererStats', 'routeAvoidHostile',
      'routeAvoidUnknownJumppoints', 'routeAvoidOffLimits',
      'effectAntialias', 'effectFXAA', 'effectBloom',
      'mapMode', 'cameraRotationLocked', 'showRendererStats' // Added new keys
    ];

    // Properties for sessionStorage
    const persistToSessionStorage = ['selectedSystemId', 'activeTab'];

    // The mutation.events.key logic in $subscribe might be too specific for initial setup.
    // A simpler approach is to just save all relevant keys on any state change.
    // This was already the subsequent logic.
    // The if/else if before the forEach loops can be removed if the forEach covers all cases.

    // Simplified persistence for all relevant keys on any change:
    persistToLocalStorage.forEach(key => {
        if (state.hasOwnProperty(key)) {
             // Constructing the key name with 'setting' prefix and capitalized first letter of the actual key.
            const storageKey = `setting${key.charAt(0).toUpperCase() + key.slice(1)}`;
            localStorage.setItem(storageKey, JSON.stringify(state[key]));
        }
    });
    persistToSessionStorage.forEach(key => {
        if (state.hasOwnProperty(key)) {
            sessionStorage.setItem(key, JSON.stringify(state[key]));
        }
    });

  });
}
</script>

<!--
Original settings.js structure for reference:
var settings = {
  defaults: {
    glow: true,
    labels: true,
    labelIcons: true,
    labelScale: parseFloat(config.defaultLabelScale), // Stored as float
    labelOffset: parseFloat(config.defaultLabelOffset), // Stored as float
    systemScale: 0.50, // Stored as float
  },
  storage: { // these are stored in localStorage
    selectedSystem: null, // The last selected system (StarSystem object)
    // ... other stored items like bookmarks, comments, hangar locations
  },
  route: { // these are stored in localStorage
    avoidHostile: false,
    avoidUnknownJumppoints: false,
    avoidOffLimits: false
  },
  effect: { // these are stored in localStorage
    Antialias: false, // Note: this forces a map reload
    FXAA: true,
    Bloom: true,
  },
  // ... other non-persistent runtime settings
};
-->
