<template>
  <div class="settings-panel">
    <CollapsibleSection title="Effects & Performance" storageKey="collapsible_settings_effects" :initiallyOpen="true">
      <div class="checkbox-option">
        <label>
          <input type="checkbox" v-model="settingsStore.effectAntialias" @change="settingsStore.setEffectAntialias($event.target.checked)" />
          Enable antialiasing
        </label>
        <p class="description">Disable postprocessing; forces reload.<br>Note: antialiasing does not work everywhere.</p>
      </div>
      <div class="checkbox-option">
        <label>
          <input type="checkbox" v-model="settingsStore.effectFXAA" @change="settingsStore.setEffectFXAA($event.target.checked)" />
          Postprocess: FXAA
        </label>
      </div>
      <div class="checkbox-option">
        <label>
          <input type="checkbox" v-model="settingsStore.effectBloom" @change="settingsStore.setEffectBloom($event.target.checked)" />
          Postprocess: Bloom
        </label>
      </div>
       <div class="checkbox-option"> <!-- Moved from DebugPanel for consistency with original settings tab -->
            <label>
                <input type="checkbox" v-model="settingsStore.showRendererStats" @change="settingsStore.setShowRendererStats($event.target.checked)" />
                Show Framerate Statistics HUD
            </label>
             <p class="description">Toggles the visibility of the performance statistics overlay (Three.js Stats).</p>
        </div>
    </CollapsibleSection>

    <CollapsibleSection title="Map Display" storageKey="collapsible_settings_mapdisplay" :initiallyOpen="true">
      <div class="ui-section-width slider-option">
        <label for="sc-map-slider-system-size">System size: {{ settingsStore.systemScale.toFixed(2) }}</label>
        <input type="range" id="sc-map-slider-system-size" class="sc-map-slider-system-size" 
               :value="settingsStore.systemScale" @input="settingsStore.setSystemScale(parseFloat($event.target.value))" 
               :min="settingsStore.minSystemScale" :max="settingsStore.maxSystemScale" :step="0.01" />
      </div>

      <div class="ui-section-width slider-option">
        <label for="sc-map-slider-label-size">Label size: {{ settingsStore.labelScale.toFixed(2) }}</label>
        <input type="range" id="sc-map-slider-label-size" class="sc-map-slider-label-size"
               :value="settingsStore.labelScale" @input="settingsStore.setLabelScale(parseFloat($event.target.value))"
               :min="settingsStore.minLabelScale" :max="settingsStore.maxLabelScale" :step="0.01" />
      </div>

      <div class="ui-section-width slider-option">
        <label for="sc-map-slider-label-offset">Label offset: {{ settingsStore.labelOffset.toFixed(1) }}</label>
        <input type="range" id="sc-map-slider-label-offset" class="sc-map-slider-label-offset"
               :value="settingsStore.labelOffset" @input="settingsStore.setLabelOffset(parseFloat($event.target.value))"
               :min="settingsStore.minLabelOffset" :max="settingsStore.maxLabelOffset" :step="0.1" />
      </div>
      <div class="checkbox-option">
        <label>
          <input type="checkbox" v-model="settingsStore.glow" @change="settingsStore.setGlow($event.target.checked)" />
          Enable star glow <!-- TODO: Trigger map.geometry.glow.refreshVisibility() -->
        </label>
      </div>
      <div class="checkmark-option">
        <label>
          <input type="checkbox" id="sc-map-toggle-labels" v-model="settingsStore.labels" @change="settingsStore.setLabels($event.target.checked)" />
          Enable system labels <!-- TODO: Trigger map.geometry.labels.refreshVisibility() -->
        </label>
        <label>
          <input type="checkbox" id="sc-map-toggle-label-icons" v-model="settingsStore.labelIcons" @change="settingsStore.setLabelIcons($event.target.checked)" />
          <i class="fa fa-level-up fa-rotate-90 fa-fw"></i> Display icons in system labels <!-- TODO: Trigger map.geometry.labels.refreshIcons() -->
        </label>
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Interface" storageKey="collapsible_settings_interface" :initiallyOpen="true">
      <div class="slider-option">
        <label for="sc-map-slider-uiwidth">UI width: {{ settingsStore.uiWidthClass }} ({{ uiWidthPercentage }}%)</label>
        <input type="range" id="sc-map-slider-uiwidth" class="sc-map-slider-uiwidth"
               :value="settingsStore.uiWidthClassIndex" @input="settingsStore.setUiWidthClassIndex(parseInt($event.target.value, 10))" 
               :min="settingsStore.uiWidthMinIndex" :max="settingsStore.uiWidthMaxIndex" :step="1" />
      </div>
    </CollapsibleSection>

     <CollapsibleSection title="Route Settings" storageKey="collapsible_settings_route" :initiallyOpen="true">
         <div class="checkbox-option">
            <label>
                <input type="checkbox" v-model="settingsStore.routeAvoidHostile" @change="settingsStore.setRouteAvoidHostile($event.target.checked)" />
                Avoid Hostile Territory
            </label>
        </div>
        <div class="checkbox-option">
            <label>
                <input type="checkbox" v-model="settingsStore.routeAvoidUnknownJumppoints" @change="settingsStore.setRouteAvoidUnknownJumppoints($event.target.checked)" />
                Avoid Unconfirmed Jumppoints
            </label>
        </div>
        <div class="checkbox-option">
            <label>
                <input type="checkbox" v-model="settingsStore.routeAvoidOffLimits" @change="settingsStore.setRouteAvoidOffLimits($event.target.checked)" />
                Avoid 'Off Limits' Systems
            </label>
        </div>
    </CollapsibleSection>
    <!-- Performance section removed as its only item was moved to Effects & Performance -->
  </div>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings';
import { computed } from 'vue';
import CollapsibleSection from './CollapsibleSection.vue';

const settingsStore = useSettingsStore();

// For displaying UI width as a percentage as well
const uiWidthPercentages = [25, 30, 35, 45, 55]; // Example percentages corresponding to XS, S, N, L, XL
const uiWidthPercentage = computed(() => {
    return uiWidthPercentages[settingsStore.uiWidthClassIndex] || uiWidthPercentages[2]; // Default to 'N'
});

</script>

<style scoped>
/* .ui-section is now handled by CollapsibleSection's content slot if needed, or locally */
.checkbox-option, .checkmark-option, .slider-option {
  margin-bottom: 0.75em;
  display: block;
}
.checkbox-option .description {
  font-size: 0.9em;
  color: #666;
  margin-left: 1.8em; /* Align with checkbox text */
  margin-top: 0.2em;
}
.slider-option {
  margin-top: 1em;
}
.slider-option label {
  display: block;
  margin-bottom: 0.3em;
}
.slider-option input[type="range"] {
  width: 100%; /* Make sliders take full width of their container */
}
.checkmark-option label {
  margin-right: 10px; /* Space between multiple checkboxes in the same group */
}
.checkmark-option label i {
  margin-right: 3px;
}
/* Added styles for new sections for clarity */
.ui-section h3 {
    font-size: 1.1em;
    font-weight: bold;
    margin-bottom: 0.5em;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.3em;
}
</style>
