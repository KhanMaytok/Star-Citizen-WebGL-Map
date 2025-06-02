<template>
  <div class="debug-panel">
    <CollapsibleSection title="Performance Overlay" storageKey="collapsible_debug_perf" :initiallyOpen="true">
      <div class="checkbox-option">
        <label>
          <input type="checkbox" id="sc-map-toggle-stats" v-model="settingsStore.showRendererStats" @change="settingsStore.setShowRendererStats($event.target.checked)" />
          Show Framerate/Render Statistics HUD
        </label>
        <p class="description">Toggles the visibility of the performance statistics overlay (Three.js Stats).</p>
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Map Data & State" storageKey="collapsible_debug_state" :initiallyOpen="true">
      <div class="sc-map-debug">
        <p id="debug-systems">Loaded Systems: {{ mapStore.loadedSystemsCount }}</p>
        <p id="debug-state">Current Active Tab ID: {{ settingsStore.activeTab }}</p>
        <p id="debug-selected-system">Selected System ID: {{ mapStore.selectedSystemId || 'None' }}</p>
        
        <!-- Placeholder for other debug info from original template, can be connected later -->
        <!-- <p id="debug-camera-is-moving">Camera Moving: {{ isCameraMoving }}</p> -->
        <!-- <p id="debug-angle" :class="{ hide: !showDebugAngle }">Angle: {{ angleInfo }}</p> -->
        <!-- <p id="debug-target">Target: {{ targetInfo }}</p> -->
        <!-- <p id="debug-axis" :class="{ hide: !showDebugAxis }">Axis: {{ axisInfo }}</p> -->

        <div id="debug-renderer" v-if="settingsStore.showRendererStats"> <!-- This section is now conditional on the same flag -->
          <h4>Renderer Information (Live)</h4>
          <p><em>These values would be updated live by the renderer.</em></p>
          <dl class="medium">
            <dt class="calls">Calls</dt>
            <dd class="calls">{{ mapStore.rendererStats.calls }}</dd>
            <dt class="faces">Faces</dt>
            <dd class="faces">{{ mapStore.rendererStats.faces }}</dd>
            <dt class="points">Points</dt>
            <dd class="points">{{ mapStore.rendererStats.points }}</dd>
            <dt class="vertices">Vertices</dt>
            <dd class="vertices">{{ mapStore.rendererStats.vertices }}</dd>
          </dl>

          <p>Memory:</p>
          <dl class="medium">
            <dt class="geometries">Geometries</dt>
            <dd class="geometries">{{ mapStore.memoryStats.geometries }}</dd>
            <dt class="textures">Textures</dt>
            <dd class="textures">{{ mapStore.memoryStats.textures }}</dd>
          </dl>
        </div>
        <!-- <p id="debug-canvases">Canvases: {{ canvasesInfo }}</p> -->
      </div>
    </CollapsibleSection>
  </div>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings';
import { useMapStore } from '@/stores/useMapStore';
import CollapsibleSection from './CollapsibleSection.vue';

const settingsStore = useSettingsStore();
const mapStore = useMapStore();

// Other local refs for debug info not yet in store (if any) can be added here.
// const stateInfo = ref('');
// const isCameraMoving = ref(false);
// const angleInfo = ref('');
// const targetInfo = ref('');
// const axisInfo = ref('');
// const canvasesInfo = ref('');

// const showDebugAngle = ref(false); 
// const showDebugAxis = ref(false);

// The actual Three.js Stats HUD visibility will be controlled by a separate mechanism
// that reads settingsStore.showRendererStats. This checkbox just updates the store.
</script>

<style scoped>
.ui-section { /* This class might be used by CollapsibleSection's slot or specific content */
  margin-bottom: 1em;
}
.checkbox-option .description {
  font-size: 0.9em;
  color: #666;
  margin-left: 1.8em; /* Align with checkbox text */
  margin-top: 0.2em;
}
.sc-map-debug p,
.sc-map-debug dt,
.sc-map-debug dd {
  font-family: monospace;
  font-size: 0.9em;
}
.sc-map-debug h3, .sc-map-debug h4 {
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-size: 1.1em;
}
.sc-map-debug dl {
  margin-left: 20px;
}
.sc-map-debug dt {
  width: 100px;
  float: left;
  clear: left;
}
.hide { /* This class might still be used by commented out placeholder debug lines */
  display: none;
}
</style>
