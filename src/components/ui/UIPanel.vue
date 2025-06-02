<template>
  <div :class="['sc-map-ui-padding', uiPanelClass]" ref="uiPanelRoot">
    <ul class="menubar nav-tabs">
      <li v-for="tab in tabs" :key="tab.id" :class="{ 'active': settingsStore.activeTab === tab.id }">
        <a href="#" @click.prevent="activateTab(tab.id)">
          <i :class="['fa', tab.icon]"></i> {{ tab.name }}
        </a>
      </li>
    </ul>

    <div class="tab-content-container" ref="tabContentContainer">
      <!-- Tab: Usage -->
      <div :ref="el => tabPanels['usage-tab-panel'] = el" id="usage-tab-panel" v-show="settingsStore.activeTab === 'usage-tab-panel'">
        <h2>Usage</h2>
        <InstructionsPanel />
        <ShortcutsPanel />
        <IconLegendPanel />
        <QuickFunctionsPanel />
      </div>

      <!-- Tab: Systems -->
      <div :ref="el => tabPanels['systems-tab-panel'] = el" id="systems-tab-panel" v-show="settingsStore.activeTab === 'systems-tab-panel'">
        <h2>Systems</h2>
        <SystemsListingPanel />
      </div>

      <!-- Tab: Selected system information -->
      <div :ref="el => tabPanels['system-info-tab-panel'] = el" id="system-info-tab-panel" v-show="settingsStore.activeTab === 'system-info-tab-panel'">
        <h2>Selected system information</h2>
        <SystemInfoPanel />
      </div>

      <!-- Tab: Plan a route -->
      <div :ref="el => tabPanels['route-tab-panel'] = el" id="route-tab-panel" v-show="settingsStore.activeTab === 'route-tab-panel'">
        <h2>Plan a route</h2>
        <RouteListPanel />
      </div>

      <!-- Tab: Settings -->
      <div :ref="el => tabPanels['settings-tab-panel'] = el" id="settings-tab-panel" v-show="settingsStore.activeTab === 'settings-tab-panel'">
        <h2>Settings</h2>
        <SettingsPanel />
      </div>

      <!-- Tab: Debug information -->
      <div :ref="el => tabPanels['debug-tab-panel'] = el" id="debug-tab-panel" v-show="settingsStore.activeTab === 'debug-tab-panel'">
        <h2>Debug information</h2>
        <DebugPanel />
      </div>

      <!-- Tab: About this map -->
      <div :ref="el => tabPanels['about-tab-panel'] = el" id="about-tab-panel" v-show="settingsStore.activeTab === 'about-tab-panel'">
        <h2>About this map</h2>
        <AboutPanel />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, onMounted, nextTick } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useMapStore } from '@/stores/useMapStore'; // Import mapStore

// Import all child panel components
import AboutPanel from './AboutPanel.vue';
import IconLegendPanel from './IconLegendPanel.vue';
import DebugPanel from './DebugPanel.vue';
import InstructionsPanel from './InstructionsPanel.vue';
import QuickFunctionsPanel from './QuickFunctionsPanel.vue';
import RouteListPanel from './RouteListPanel.vue';
import SettingsPanel from './SettingsPanel.vue';
import ShortcutsPanel from './ShortcutsPanel.vue';
import SystemInfoPanel from './SystemInfoPanel.vue';
import SystemsListingPanel from './SystemsListingPanel.vue';

const settingsStore = useSettingsStore();
const mapStore = useMapStore(); // Initialize mapStore

const uiPanelRoot = ref(null); // Ref for the root element of the UI panel
const tabContentContainer = ref(null); // Ref for the container of all tab panels
const tabPanels = ref({}); // To store refs to individual tab panel divs

const tabs = ref([
  { id: 'usage-tab-panel', name: 'Usage', icon: 'fa-home' },
  { id: 'systems-tab-panel', name: 'Systems', icon: 'fa-list' },
  { id: 'system-info-tab-panel', name: 'System Info', icon: 'fa-info-circle' },
  { id: 'route-tab-panel', name: 'Route', icon: 'fa-paper-plane' },
  { id: 'settings-tab-panel', name: 'Settings', icon: 'fa-wrench' },
  { id: 'debug-tab-panel', name: 'Debug', icon: 'fa-bug' },
  { id: 'about-tab-panel', name: 'About', icon: 'fa-comment' },
]);

const uiPanelClass = computed(() => {
  return settingsStore.uiWidthClass;
});

const activateTab = (tabId) => {
  settingsStore.setActiveTab(tabId);
  if (tabId === 'systems-tab-panel') {
    // console.log('Systems tab clicked - refreshing system list groups.');
    mapStore.refreshSystemListGroups();
  }
};

watch(() => settingsStore.activeTab, (newTabId, oldTabId) => {
  nextTick(() => { 
    const panelElement = tabPanels.value[newTabId];
    if (panelElement) {
      if (tabContentContainer.value) {
        tabContentContainer.value.scrollTop = 0;
      }
    }
    // Refresh systems list if 'systems' tab becomes active and wasn't already the active one
    // (activateTab handles the click case, this handles programmatic changes to activeTab)
    if (newTabId === 'systems-tab-panel' && newTabId !== oldTabId) {
        // console.log('Systems tab became active via watch - refreshing system list groups.');
        mapStore.refreshSystemListGroups();
    }
  });
});

// Ensure the default active tab's content is visible on mount
// and scroll it to top. Also, refresh systems list if it's the initial active tab.
onMounted(() => {
  const currentTabId = settingsStore.activeTab;
  if (currentTabId && tabPanels.value[currentTabId]) {
     if (tabContentContainer.value) {
        tabContentContainer.value.scrollTop = 0;
      }
     if (currentTabId === 'systems-tab-panel') {
        mapStore.refreshSystemListGroups();
     }
  } else if (tabs.value.length > 0) {
    const firstTabId = tabs.value[0].id;
    settingsStore.setActiveTab(firstTabId); // This will trigger the watcher if it changes the tab
    if (firstTabId === 'systems-tab-panel') { // Check if the first tab is systems tab
        mapStore.refreshSystemListGroups();
    }
  }
});

</script>

<style scoped>
.sc-map-ui-padding {
  padding: 10px;
  transition: width 0.3s ease-in-out;
  display: flex;
  flex-direction: column; /* Stack menubar and content vertically */
  height: 100%; /* Assuming parent provides height, or use vh */
  overflow: hidden; /* Prevent panel itself from scrolling due to content */
}

.menubar.nav-tabs {
  list-style-type: none;
  padding: 0;
  margin: 0 0 10px 0;
  display: flex;
  flex-wrap: wrap; /* Allow tabs to wrap on smaller screens */
  border-bottom: 1px solid #ccc;
}
.menubar.nav-tabs li {
  margin-right: 2px;
}
.menubar.nav-tabs li a {
  display: block;
  padding: 8px 12px;
  text-decoration: none;
  border: 1px solid #ccc;
  border-bottom: none;
  background-color: #f0f0f0;
  color: #337ab7;
  border-radius: 4px 4px 0 0;
}
.menubar.nav-tabs li.active a {
  background-color: #fff;
  border-color: #ccc;
  border-bottom: 1px solid #fff; /* Make it look connected to content */
  color: #555;
  font-weight: bold;
}
.menubar.nav-tabs li a:hover {
  background-color: #e7e7e7;
}
.menubar.nav-tabs li.active a:hover {
  background-color: #fff; /* Keep active tab background on hover */
}
.menubar.nav-tabs li i {
  margin-right: 5px;
}

.tab-content-container {
  flex-grow: 1; /* Take remaining vertical space */
  overflow-y: auto; /* Allow content within this container to scroll */
  padding-right: 5px; /* For scrollbar */
}

div[id$="-tab-panel"] {
  /* Removed border and margin-top from individual panels, handled by container or tab styling */
  background-color: #fff; /* Assuming white background for tab content area */
  padding: 10px;
}

div[id$="-tab-panel"] h2 {
  margin-top: 0;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
  font-size: 1.2em; /* Slightly smaller header for tab content */
}

/* Width classes that will be dynamically applied via uiPanelClass */
.widthXS { width: 250px; }
.widthS  { width: 300px; }
.widthN  { width: 350px; }
.widthL  { width: 450px; }
.widthXL { width: 550px; }
</style>
