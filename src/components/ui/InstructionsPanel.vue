<template>
  <CollapsibleSection title="Instructions" initiallyOpen storageKey="collapsible_instructions" class="instructions-panel">
    <ul class="fa-ul bullet-list-med">
      <li v-for="(instruction, index) in instructions" :key="index">
        <i class="fa fa-li fa-circle-thin"></i>
        <span v-html="instruction"></span>
      </li>
    </ul>
  </CollapsibleSection>
</template>

<script setup>
import { ref } from 'vue';
import CollapsibleSection from './CollapsibleSection.vue';

// Placeholder data for instructions
const instructions = ref([
  '<strong>Left click and drag</strong> to rotate the map around the X and Y axes.',
  '<strong>Right click and drag</strong> to pan the map.',
  'Use the <strong>mouse wheel</strong> to zoom in and out.',
  '<strong>Hover</strong> your mouse over a system to see its name and faction.',
  '<strong>Click a system</strong> to select it and show more information about it.',
  '<strong>Click a jump point</strong> to select it and show its name.',
  '<strong>Shift-click a system</strong> to add it as a waypoint to the current route.',
  '<strong>Control-click a system</strong> to set it as the start of a new route.',
  'Or use the form in the "Plan a route" tab.',
]);
// In a real scenario, this data might come from a configuration file or a store.
</script>

<style scoped>
/* .instructions-panel specific styles, if any, beyond CollapsibleSection */
/* The h3 is now part of CollapsibleSection */

.bullet-list-med {
  /* Styles for bullet-list-med if any specific beyond FontAwesome defaults */
  /* fa-ul and fa-li are FontAwesome classes, ensure FA is loaded globally */
  padding-left: 1.5em; /* Add some padding if fa-ul doesn't provide enough */
}
.bullet-list-med li {
  margin-bottom: 0.5em;
  line-height: 1.4;
}
</style>
