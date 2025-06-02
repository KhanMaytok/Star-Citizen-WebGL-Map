<template>
  <div class="system-info-panel">
    <div v-if="mapStore.selectedSystemId && mapStore.selectedSystemDetails">
      <h1 :class="['systemname', { padleft: !hasPrevNextInRoute }]" :style="{ color: mapStore.selectedSystemDetails.faction?.color || '#FFFFFF' }">
        <RouteNavLinks 
          :previous="mapStore.selectedSystemPrevNextInRoute.prev" 
          :next="mapStore.selectedSystemPrevNextInRoute.next"
          @select-system="navigateToSystem" 
        />
        {{ mapStore.selectedSystemDetails.name }}
      </h1>

      <h2 v-if="mapStore.selectedSystemDetails.nickname" class="nickname quote padleft" :style="{ color: mapStore.selectedSystemDetails.faction?.color || '#FFFFFF' }">
        {{ mapStore.selectedSystemDetails.nickname }}
      </h2>

      <CollapsibleSection title="Basic info" :initiallyOpen="true" :storageKey="`sysinfo_${mapStore.selectedSystemId}_basic`">
        <dl class="wide basic-system">
          <dt class="faction">Faction</dt>
          <dd class="faction">{{ mapStore.selectedSystemDetails.faction?.name || 'Unclaimed' }}</dd>

          <dt class="import">Import</dt>
          <dd class="import">{{ mapStore.selectedSystemDetails.importCommodities }}</dd>

          <dt class="export">Export</dt>
          <dd class="export">{{ mapStore.selectedSystemDetails.exportCommodities }}</dd>

          <dt class="blackMarket">Black market</dt>
          <dd class="blackMarket">{{ mapStore.selectedSystemDetails.blackMarketCommodities }}</dd>

          <dt class="crime">Crime status</dt>
          <dd :class="['crime', `crime_${mapStore.selectedSystemDetails.crimeStatus?.name?.toLowerCase()}`]">{{ mapStore.selectedSystemDetails.crimeStatus?.name || 'N/A' }}</dd>

          <dt class="strategic">UEE strategic value</dt>
          <dd :class="['strategic', `strategic_value_${mapStore.selectedSystemDetails.ueeStrategicValue?.color?.toLowerCase()}`]">{{ mapStore.selectedSystemDetails.ueeStrategicValue?.color || 'N/A' }}</dd>
        </dl>
      </CollapsibleSection>

      <CollapsibleSection title="Jump points" :initiallyOpen="true" :storageKey="`sysinfo_${mapStore.selectedSystemId}_jps`">
        <table class="jumps">
          <tbody>
            <tr v-for="jp in mapStore.selectedSystemDetails.jumpPoints" :key="jp.destination.id">
                <th class="system">
                  <a href="#" @click.prevent="navigateToSystem(jp.destination.id)">{{ jp.destination.name }}</a>
                </th>
                <td class="size">{{ jp.size }}</td>
                <td class="distance">{{ formatDistanceLY(jp.distanceInLY) }}</td>
              </tr>
          </tbody>
        </table>
      </CollapsibleSection>

      <CollapsibleSection :title="`Comments and settings for ${mapStore.selectedSystemDetails.name}`" :initiallyOpen="true" :storageKey="`sysinfo_${mapStore.selectedSystemId}_userprefs`">
        <label class="checkbox-button">
          <input type="checkbox" v-model="currentSystemUserSettings.hangar" />
          <i class="fa fa-home"></i> My hangar location
        </label>
        <label class="checkbox-button">
          <input type="checkbox" v-model="currentSystemUserSettings.bookmarked" />
          <i class="fa fa-bookmark"></i> Bookmarked
        </label>
        <label class="checkbox-button">
          <input type="checkbox" v-model="currentSystemUserSettings.avoid" />
          <i class="fa fa-times"></i> Avoid: don't route here for me
        </label>

        <div class="comment-editing">
          <CollapsibleSection title="Edit your comments" :initiallyOpen="false" :storageKey="`sysinfo_${mapStore.selectedSystemId}_comments_edit`" class="user-section">
            <div>
              <label :for="`user-comments-${mapStore.selectedSystemId}`">Your comments (<a href="https://daringfireball.net/projects/markdown/basics" target="_new" rel="noopener noreferrer">markdown syntax</a>):</label>
              <a href="#" @click.prevent="removeComments" title="Remove" class="pull-right text-danger">
                <i class="fa fa-fw fa-lg fa-times"></i>
              </a>
              <textarea :id="`user-comments-${mapStore.selectedSystemId}`" v-model="currentSystemUserSettings.comments" class="user-system-comments"></textarea>
            </div>
          </CollapsibleSection>
          <!-- Display rendered comments - consider if this should be outside the 'Edit' collapsible or always visible -->
          <h4>Your Comments (Preview)</h4>
          <div class="user-system-comments-md" v-html="renderedComments"></div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Description" :initiallyOpen="true" :storageKey="`sysinfo_${mapStore.selectedSystemId}_desc`">
        <div class="system-description" v-html="renderMarkdown(mapStore.selectedSystemDetails.description)"></div>
      </CollapsibleSection>

      <CollapsibleSection 
        v-for="(info, index) in mapStore.selectedSystemDetails.infoArticles" 
        :key="`bginfo_${index}`" 
        :title="`Background info ${info.source ? '('+info.source+')' : '(Official)'}`" 
        :initiallyOpen="index === 0"
        :storageKey="`sysinfo_${mapStore.selectedSystemId}_bginfo_${index}`"
      >
        <div class="system-blurb-body" :data-source="info.source" v-html="renderMarkdown(info.article)">
        </div>
        <p v-if="info.source" class="system-blurb-source">
          <a :href="info.source" target="_new" rel="noopener noreferrer">(source)</a>
        </p>
      </CollapsibleSection>

    </div>
    <div v-else>
      <p class="padleft impossible large ui-section">No system selected, or system data not found.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'; // Removed watch as it's not used here directly
import { useMapStore } from '@/stores/useMapStore';
import { useSettingsStore } from '@/stores/settings'; // To pass to selectSystem for tab switching
import { marked } from 'marked';

const mapStore = useMapStore();
const settingsStore = useSettingsStore();


const hasPrevNextInRoute = computed(() => 
  mapStore.selectedSystemPrevNextInRoute.prev || mapStore.selectedSystemPrevNextInRoute.next
);

const formatDistanceLY = (distance) => {
  return distance ? `${Number(distance).toFixed(2)} LY` : 'N/A';
};

const renderMarkdown = (markdownText) => {
  if (!markdownText) return '';
  return marked(markdownText);
};

const renderedComments = computed(() => {
    const systemId = mapStore.selectedSystemId;
    if (systemId && mapStore.userSystemSettings[systemId] && mapStore.userSystemSettings[systemId].comments) {
        return marked(mapStore.userSystemSettings[systemId].comments);
    }
    return '';
});

const navigateToSystem = (systemId) => {
  if (systemId) {
    mapStore.selectSystem(systemId, settingsStore);
  }
};

// Computed properties with getter/setter for user system settings
const currentSystemUserSettings = computed(() => {
  const systemId = mapStore.selectedSystemId;
  if (!systemId) {
    // Return a default structure or empty object if no system is selected
    // This prevents errors when trying to bind to undefined properties
    return { bookmarked: false, hangar: false, avoid: false, comments: '' };
  }
  // Ensure there's an entry for the system
  mapStore._ensureUserSystemEntry(systemId); 
  return {
    get bookmarked() { return mapStore.userSystemSettings[systemId]?.bookmarked ?? false; },
    set bookmarked(value) { mapStore.setSystemBookmark(systemId, value); },
    get hangar() { return mapStore.userSystemSettings[systemId]?.hangar ?? false; },
    set hangar(value) { mapStore.setSystemHangar(systemId, value); },
    get avoid() { return mapStore.userSystemSettings[systemId]?.avoid ?? false; },
    set avoid(value) { mapStore.setSystemAvoid(systemId, value, settingsStore.routeSettings); },
    get comments() { return mapStore.userSystemSettings[systemId]?.comments ?? ''; },
    set comments(value) { mapStore.setSystemComments(systemId, value); },
  };
});

const removeComments = () => {
  if (mapStore.selectedSystemId) {
    mapStore.setSystemComments(mapStore.selectedSystemId, '');
  }
};

// Child component for route navigation links (can be moved to its own file later)
const RouteNavLinks = {
  props: ['previous', 'next'],
  emits: ['select-system'],
  setup(props, { emit }) {
    const select = (systemId) => {
      emit('select-system', systemId);
    };
    return { props, select };
  },
  template: `
    <span class="route-nav-links">
      <a v-if="props.previous" href="#" @click.prevent="select(props.previous.id)" class="prev" :title="'Previous: ' + props.previous.name">&laquo;</a>
      <a v-if="props.next" href="#" @click.prevent="select(props.next.id)" class="next" :title="'Next: ' + props.next.name">&raquo;</a>
    </span>
  `
};

</script>

<style scoped>
/* .ui-section styling is now handled by CollapsibleSection or local styles within it */
.padleft { padding-left: 20px; /* Example value. TODO: Review if needed with CollapsibleSection */ }
.systemname { font-size: 1.8em; margin-bottom: 0.2em; }
.nickname { font-size: 1.2em; font-style: italic; margin-top: 0; }
.quote::before { content: '"'; }
.quote::after { content: '"'; }

dl.wide dt { width: 150px; float: left; clear: left; font-weight: bold; }
dl.wide dd { margin-left: 160px; margin-bottom: 0.3em; }

.jumps { width: 100%; border-collapse: collapse; }
.jumps th, .jumps td { padding: 0.3em 0.5em; text-align: left; border-bottom: 1px solid #eee; }
.jumps th.system a { text-decoration: none; color: #337ab7; }
.jumps th.system a:hover { text-decoration: underline; }
.jumps td.size { width: 50px; }
.jumps td.distance { width: 80px; text-align: right; }

.checkbox-button { display: block; margin-bottom: 0.5em; }
.checkbox-button input { margin-right: 5px; }
.checkbox-button i { margin-right: 5px; width: 1.28571429em; /* FontAwesome default width for fa-fw */ text-align: center; }


.comment-editing .user-section { /* Target CollapsibleSection if it gets this class */
  margin-top: 1em;
}
.comment-editing textarea { width: 100%; min-height: 80px; margin-bottom: 0.5em; box-sizing: border-box; padding: 5px; border: 1px solid #ccc; border-radius: 4px;}
.user-system-comments-md { border: 1px dashed #ccc; padding: 10px; min-height: 30px; background: #f9f9f9; margin-top: 10px; }
.user-system-comments-md :deep(p:first-child) { margin-top: 0; }
.user-system-comments-md :deep(p:last-child) { margin-bottom: 0; }

.pull-right { float: right; }
.text-danger { color: #a94442; }
.text-danger:hover { color: #843534; }

.system-description, .system-blurb-body { margin-bottom: 0.5em; line-height: 1.5; }
/* Use :deep for v-html content if needed */
.system-description :deep(p:first-child) { margin-top: 0; }
.system-description :deep(p:last-child) { margin-bottom: 0; }
.system-blurb-body :deep(p:first-child) { margin-top: 0; }
.system-blurb-body :deep(p:last-child) { margin-bottom: 0; }

.system-blurb-source { font-size: 0.9em; text-align: right; }

.impossible.large { font-size: 1.5em; color: #777; }

/* Styles for crime/strategic value based on original CSS snippet. Ensure these classes are specific enough or global. */
.crime_low { color: green; }
.crime_medium { color: orange; }
.crime_high { color: red; }
.strategic_value_low { color: #879819; } /* Example, adjust to match original */
.strategic_value_medium { color: #986319; }
.strategic_value_high { color: #981919; }
.strategic_value_veryhigh { color: #981919; font-weight: bold; }

.route-nav-links a { margin-right: 5px; text-decoration: none; font-weight: bold; color: #337ab7 }
.route-nav-links a:hover { text-decoration: underline; }
</style>
