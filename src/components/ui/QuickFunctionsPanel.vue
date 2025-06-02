<template>
  <div class="quick-functions-panel">
    <h3>Quick functions</h3>
    <p>
      <button id="sc-map-resetCamera" class="big-button" @click="resetCamera">
        <i class="fa fa-camera"></i> Reset view
      </button>
      <button id="sc-map-centreCamera" class="big-button" @click="centreCamera">
        <i class="fa fa-home"></i> Centre view [C]
      </button>
      <button id="sc-map-northCamera" class="big-button" @click="northCamera">
        <i class="fa fa-compass"></i> Reset orientation [R]
      </button>
      <button id="sc-map-topCamera" class="big-button" @click="topCamera">
        <i class="fa fa-camera-retro"></i> Top-down view [T]
      </button>
      <button id="sc-map-top2D" class="big-button" @click="activateTop2DMode">
        <i class="fa fa-map-marker"></i> 2D map mode [2]
      </button>
      <button id="sc-map-toggleFullScreen" class="big-button" @click="handleFullScreenToggle">
        <i class="fa fa-arrows-alt"></i> Toggle full screen mode
      </button>
      <br />
      <label class="checkbox-button">
        <input type="checkbox" id="sc-map-3d-mode" v-model="is3DModeActive" />
        3D map mode [3]
      </label>
      <label class="checkbox-button">
        <input type="checkbox" id="sc-map-lock-rotation" v-model="settingsStore.cameraRotationLocked" @change="settingsStore.setCameraRotationLocked($event.target.checked)" />
        Lock map rotation [L]
      </label>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import toggleFullScreenHelper from '@/helpers/toggle-full-screen.js'; // Adjusted path

const settingsStore = useSettingsStore();

// Computed property to interface with mapMode string ('2d'/'3d')
const is3DModeActive = computed({
  get: () => settingsStore.mapMode === '3d',
  set: (value) => {
    const newMode = value ? '3d' : '2d';
    settingsStore.setMapMode(newMode);
    // TODO: Trigger map display mode change: map.displayState.to3d() or to2d()
    console.log(`Map mode set to: ${newMode}`);
    if (newMode === '2d') {
        // console.log('TODO: Trigger camera action: Top-down view for 2D');
        // console.log('TODO: Update renderer controls rotation lock to true');
        settingsStore.setCameraRotationLocked(true); // Also lock rotation in 2D mode
    }
  }
});

const resetCamera = () => {
  console.log('Action: Reset Camera');
  // TODO: Trigger camera action: renderer.controls.reset();
};

const centreCamera = () => {
  console.log('Action: Centre Camera');
  // TODO: Trigger camera action: renderer.controls.moveTo( SCMAP.currentSystem.object.position );
};

const northCamera = () => {
  console.log('Action: Orient North');
  // TODO: Trigger camera action: renderer.controls.rotateTo(0, 0, 0);
};

const topCamera = () => {
  console.log('Action: Top-down view (3D)');
   settingsStore.setMapMode('3d'); // Ensure we are in 3D for this top-down view
  // TODO: Trigger camera action: renderer.controls.cameraTo(0, 90*DTR, 0);
  // TODO: Trigger camera action: renderer.controls.rotateTo(0, 0, 0);
};

const activateTop2DMode = () => {
  console.log('Action: Activate 2D Top-down Mode');
  settingsStore.setMapMode('2d');
  settingsStore.setCameraRotationLocked(true);
  // TODO: Trigger map display mode change: map.displayState.to2d();
  // TODO: Trigger camera action: renderer.controls.cameraTo(0, 90*DTR, 0);
  // TODO: Trigger camera action: renderer.controls.rotateTo(0, 0, 0);
  // TODO: Update renderer controls rotation lock to true
};

const handleFullScreenToggle = () => {
  toggleFullScreenHelper();
};

// Watch for changes in cameraRotationLocked from store to log (and later act on)
// settingsStore.$subscribe((mutation, state) => {
//   if (mutation.events.key === 'cameraRotationLocked') {
//     console.log(`Camera rotation lock set to: ${state.cameraRotationLocked}`);
//     // TODO: Update renderer controls rotation lock: renderer.controls.enableRotate = !state.cameraRotationLocked;
//   }
// });

</script>

<style scoped>
/* Styles specific to QuickFunctionsPanel can go here */
.quick-functions-panel {
  margin-top: 1em;
}
.big-button {
  /* Basic styling for big buttons, actual styling will come from sc.css */
  padding: 8px 12px;
  margin: 5px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
}
.big-button i {
  margin-right: 5px;
}
.checkbox-button {
  margin: 5px;
  padding: 5px;
  display: inline-block; /* Or block if they should be on new lines */
}
br {
    margin-bottom: 10px; /* Add some space after the break */
}
</style>
