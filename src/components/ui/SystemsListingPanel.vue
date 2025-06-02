<template>
  <div class="systems-listing-panel">
    <div v-if="mapStore.systemListGroups.length === 0">
      <p>Loading system data or no systems available...</p>
    </div>
    <CollapsibleSection 
      v-for="group in mapStore.systemListGroups" 
      :key="group.title" 
      :title="group.title"
      :initiallyOpen="group.title === 'All Systems (Sorted by Name)'" 
      :storageKey="`collapsible_syslist_${group.title.replace(/\s+/g, '_')}`"
      class="system-group-section"
    >
      <div v-if="group.items && group.items.length > 0">
        <ul class="nostyle system-links-list">
          <li v-for="system in group.items" :key="system.id">
            <a href="#" @click.prevent="selectSystem(system.id)" :style="{ color: system.factionColor }">
              {{ system.name }}
            </a>
            <span class="faction-name muted small"> ({{ system.factionName }}) </span>
            <span v-if="system.iconClasses && system.iconClasses.length > 0" class="system-icons">
              <i v-for="iconClass in system.iconClasses" :key="iconClass" :class="iconClass"></i>
            </span>
          </li>
        </ul>
      </div>
      <div v-else-if="group.factions && group.factions.length > 0">
        <CollapsibleSection 
          v-for="factionData in group.factions" 
          :key="factionData.faction" 
          :title="factionData.faction"
          :initiallyOpen="false"
          :storageKey="`collapsible_syslist_${group.title.replace(/\s+/g, '_')}_${factionData.faction.replace(/\s+/g, '_')}`"
          class="faction-subsection"
          :style="{ borderLeftColor: factionData.color || '#ccc' }"
        >
          <ul class="nostyle system-links-list">
            <li v-for="system in factionData.items" :key="system.id">
              <!-- Faction color already applied to header, link can be default or specific -->
              <a href="#" @click.prevent="selectSystem(system.id)"> 
                {{ system.name }}
              </a>
              <span v-if="system.iconClasses && system.iconClasses.length > 0" class="system-icons">
                <i v-for="iconClass in system.iconClasses" :key="iconClass" :class="iconClass"></i>
              </span>
            </li>
          </ul>
        </CollapsibleSection>
      </div>
    </CollapsibleSection>
  </div>
</template>

<script setup>
import { useMapStore } from '@/stores/useMapStore';
import { useSettingsStore } from '@/stores/settings';
import CollapsibleSection from './CollapsibleSection.vue';

const mapStore = useMapStore();
const settingsStore = useSettingsStore();

const selectSystem = (systemId) => {
  mapStore.selectSystem(systemId, settingsStore);
};
</script>

<style scoped>
/* .ui-section styling is now handled by CollapsibleSection or local styles */

.system-group-section {
  margin-bottom: 5px; /* Space between top-level collapsible sections */
}
.faction-subsection {
  /* margin-left: 20px; // Indentation can be handled by CollapsibleSection's own structure if desired */
  /* border-left: 3px solid #ccc; // Example to show faction color */
  margin-top: 5px;
  margin-bottom: 5px;
}
ul.nostyle {
  list-style: none;
  padding-left: 0;
}
ul.nostyle li {
  margin-bottom: 0.4em;
  line-height: 1.5;
}
.system-links-list a {
  text-decoration: none;
  font-weight: bold;
}
.system-links-list a:hover {
  text-decoration: underline;
}
.faction-name {
  /* Faction name already part of the link or next to it */
}
.system-icons {
  margin-left: 8px;
}
.system-icons i {
  margin-right: 4px;
  color: #777; /* Default icon color, can be overridden if icons have specific colors */
}
.muted {
  color: #777;
}
.small {
  font-size: 0.9em;
}
</style>
