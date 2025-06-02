<template>
  <CollapsibleSection title="Keyboard shortcuts" storageKey="collapsible_shortcuts" class="shortcuts-panel">
    <dl class="shortcuts">
      <template v-for="(shortcut, index) in shortcuts" :key="index">
        <dt v-html="shortcut.key"></dt>
        <dd v-html="shortcut.description"></dd>
      </template>
    </dl>
  </CollapsibleSection>
</template>

<script setup>
import { ref } from 'vue';
import CollapsibleSection from './CollapsibleSection.vue';

// Placeholder data for shortcuts
const shortcuts = ref([
  { key: 'C', description: 'Center map on currently selected system (or Stanton if none selected)' },
  { key: 'R', description: 'Reset map orientation (North up)' },
  { key: 'T', description: 'Top-down map view (oriented North up)' },
  { key: 'L', description: 'Lock map rotation (allows zoom/pan only)' },
  { key: '2', description: 'Toggle 2D map mode (experimental)' },
  { key: '3', description: 'Toggle 3D map mode' },
  { key: '<kbd>Shift</kbd> + Click system', description: 'Add system to route as waypoint' },
  { key: '<kbd>Ctrl</kbd> + Click system', description: 'Set system as start of new route' },
  { key: '<kbd>Esc</kbd>', description: 'Clear current selection or route' },
  // Add more shortcuts as defined in the original application's data
]);
// In a real application, this data would come from a configuration or store.
</script>

<style scoped>
/* .shortcuts-panel specific styles, if any, beyond CollapsibleSection */
/* The h3 is now part of CollapsibleSection */

.shortcuts dt {
  font-weight: bold;
  font-family: monospace;
  background-color: #f0f0f0; /* Example styling */
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
  margin-right: 10px;
}
.shortcuts dd {
  margin-left: 0; /* Reset browser default */
  margin-bottom: 0.5em;
  padding-left: 10px; /* Indent description relative to key block */
  display: inline-block; /* Keep it on the same line if space allows, or use block for new line */
}

/* Example of how to style kbd if it's used in v-html, though direct styling of v-html content is limited */
/* It's better if the HTML strings themselves have classes, or if we parse the data further */
:deep(kbd) { /* :deep selector to pierce scoped styles if kbd is part of v-html */
    background-color: #eee;
    border-radius: 3px;
    border: 1px solid #b4b4b4;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .2), 0 2px 0 0 rgba(255, 255, 255, .7) inset;
    color: #333;
    display: inline-block;
    font-family: monospace;
    font-size: .85em;
    font-weight: 700;
    line-height: 1;
    padding: 2px 4px;
    white-space: nowrap;
}
</style>
