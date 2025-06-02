<template>
  <div id="app-container">
    <UIPanel />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import UIPanel from './components/ui/UIPanel.vue';
import { useSettingsStore } from '@/stores/settings';
import { useMapStore } from '@/stores/useMapStore';
import SCMAP from './scmap/scmap'; // Assuming this is the path to the refactored SCMAP class
import defaultMapConfig from './scmap/config'; // Path to defaultMapConfig

const settingsStore = useSettingsStore();
const mapStore = useMapStore();

// Instantiate SCMAP.
const scmapInstance = new SCMAP(defaultMapConfig);
mapStore.setScmapInstance(scmapInstance); // Set it in the store

// TODO: Implement actual SCMAP data loading.
// For now, we'll assume scmapInstance.allSystems might be populated synchronously
// or some default/empty state is fine for initial UI rendering.
// Example of how data loading might look:
// async function loadScmapData() {
//   await scmapInstance.loadFactions(defaultMapConfig.factionsJson);
//   await scmapInstance.loadCommodities(defaultMapConfig.goodsJson);
//   // ... other data types
//   await scmapInstance.importStarSystems(jsonDataFromSystemsJson); // This needs actual JSON
//   console.log("SCMAP Data loaded (simulated)");
//   mapStore.refreshSystemListGroups(); // Refresh list after data is available
//   // If there was a selected system from session, try to re-select it
//   if (mapStore.selectedSystemId) {
//     mapStore.selectSystem(mapStore.selectedSystemId, settingsStore);
//   }
// }

onMounted(() => {
  mapStore.initUserSystemSettings(); // Load user settings from localStorage
  
  // Initialize the route system using current route settings from settingsStore
  mapStore.initRoute(settingsStore.routeSettings); // scmapInstance is already in mapStore

  // Simulate SCMAP data being ready for list generation & initial selection
  // In a real app, this would be after actual data loading.
  // For now, let's assume scmapInstance.allSystems is somewhat populated by constructor or stubs.
  if (scmapInstance.allSystems && scmapInstance.allSystems.length > 0) {
     mapStore.refreshSystemListGroups();
     if (mapStore.selectedSystemId) {
       mapStore.selectSystem(mapStore.selectedSystemId, settingsStore);
     }
  } else {
    // If no systems yet (e.g. data not loaded), list will be empty.
    // selectSystem if ID exists might fail or show "not found".
    // This is acceptable for now as data loading is separate.
    mapStore.refreshSystemListGroups(); // Will show empty groups
    if (mapStore.selectedSystemId) {
      // Attempt selection, it might result in 'not found' if data isn't there
      mapStore.selectSystem(mapStore.selectedSystemId, settingsStore); 
    }
  }
});

// Watch for changes in route settings and update the route calculation
watch(() => settingsStore.routeSettings, (newSettings) => {
  console.log("Route settings changed, updating route calculation.");
  mapStore.updateRoutePreferences(newSettings); // scmapInstance is in mapStore
}, { deep: true }); // Use deep watch for object properties

// Any other global app logic or setup can go here.
</script>

<style>
/* Global styles for the application */
/* Assuming styles from css/sc.css are loaded globally via main.js or index.html */

/* Basic app container styling */
#app-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50; /* Example text color, adjust as per sc.css */
  /* Max width and centering could be useful for the UI panel if it's not full screen */
  /* max-width: 1280px; */
  /* margin: 0 auto; */
}
</style>
