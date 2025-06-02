<template>
  <div class="route-list-panel">
    <CollapsibleSection title="Routing options" storageKey="collapsible_routeopt" class="no-pad-top" :initiallyOpen="true">
      <div class="checkbox-option">
        <label>
          <input type="checkbox" v-model="settingsStore.routeAvoidHostile" />
          Don't enter hostile territory
        </label>
        <p class="description">But do try to get out of it quickly.</p>
      </div>
      <div class="checkbox-option">
        <label>
          <input type="checkbox" v-model="settingsStore.routeAvoidUnknownJumppoints" />
          Avoid unconfirmed jumppoints
        </label>
        <p class="description">Any jumppoint not yet confirmed, or not yet mapped - those with dashed lines.</p>
      </div>
      <div class="checkbox-option">
        <label>
          <input type="checkbox" v-model="settingsStore.routeAvoidOffLimits" />
          Avoid 'off limits' systems
        </label>
        <p class="description">Note though that not all of the system marked as such is necessarily off-limits.</p>
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="How this works" storageKey="collapsible_routehow" :initiallyOpen="false">
      <p>Click and drag from system to system to calculate a route between these two systems, which then becomes your current route. You can have only one active route, so you must delete the current route to create a new one, or modify your existing route as desired.</p>
      <p>Use the options section above to configure the global routing options, or set the 'avoid' flag on a system to change the routing through that system only. Note that all route options are advisory, the user has the final say ... as an example: if you set the destination just into hostile territory then turning on the option to avoid hostile systems will not be effective.</p>
      <p>The route will always be the shortest number of jumps possible with the given settings, as using a jump is always faster than traveling in a system from jumppoint to jumppoint, and using jumppoints has been stated to not require fuel.</p>
      <p>Once a route is set, you can drag any of its waypoints elsewhere. Dragging will create a new waypoint as needed. Existing waypoints on the route can be removed again with the <i class="fa fa-times"></i> symbol in the route list below.</p>
      <p>On a final note: the given estimate times are extremely rough indications based on available information (very little at this time). As we learn more about the in-system and jumppoint traveling I will do my best to refine the calculation accordingly.</p>
    </CollapsibleSection>

    <CollapsibleSection title="Calculated route" storageKey="collapsible_routecalc" :initiallyOpen="true">
      <div v-if="mapStore.routeWaypointsForDisplay.length > 0">
        <table class="routelist">
          <caption>
            <!-- Caption can be improved, e.g. start and end from routeWaypointsForDisplay if available -->
            Route from {{ mapStore.routeWaypointsForDisplay[0]?.systemName }}
            to {{ mapStore.routeWaypointsForDisplay[mapStore.routeWaypointsForDisplay.length - 1]?.systemName }}
            along <strong class="route-count">{{ mapStore.routeWaypointsForDisplay.length > 1 ? mapStore.routeWaypointsForDisplay.length -1 : 0 }}</strong> jump points:
          </caption>
          <tbody>
            <tr v-for="(waypoint, index) in mapStore.routeWaypointsForDisplay" :key="waypoint.systemId">
              <th class="count muted">{{ index + 1 }}</th>
              <td class="control muted">
                <a v-if="waypoint.isWaypoint && !waypoint.isStart && !waypoint.isEnd" href="#" @click.prevent="removeWaypoint(waypoint.system)" title="Remove waypoint">
                  <i class="fa fa-fw fa-lg fa-times"></i>
                </a>
                <i v-else class="fa fa-fw fa-lg" :class="waypoint.iconClass" :title="waypoint.iconTitle"></i>
              </td>
              <td class="system">{{ waypoint.systemName }}</td>
              <td class="duration muted small">{{ waypoint.durationText }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th class="count">&nbsp;</th>
              <th class="control">&nbsp;</th>
              <th class="system">&nbsp;</th>
              <th class="duration small">&plusmn;{{ totalDurationFormatted }}</th>
            </tr>
          </tfoot>
        </table>
        <p>
          <button class="delete-route" @click="clearRoute"><i class="fa fa-fw fa-trash-o"></i>Delete route</button>
        </p>
      </div>
      <div v-else>
        <p :class="mapStore.routeStatusClass">{{ mapStore.routeStatusText }}</p>
      </div>
    </CollapsibleSection>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useMapStore } from '@/stores/useMapStore';
import CollapsibleSection from './CollapsibleSection.vue';

const settingsStore = useSettingsStore();
const mapStore = useMapStore();

const scmapInstance = mapStore._scmapInstance;

const removeWaypoint = (system) => {
  if (!scmapInstance) {
      console.error("SCMAP instance not available for removing waypoint.");
      return;
  }
  mapStore.removeWaypointFromRoute(system, settingsStore.routeSettings);
};

const clearRoute = () => {
  if (!scmapInstance) {
      console.error("SCMAP instance not available for clearing route.");
      return;
  }
  mapStore.clearRoute(settingsStore.routeSettings);
};

// Computed property to format total duration from mapStore
const totalDurationFormatted = computed(() => {
    // Re-use the formatter logic from mapStore or import it if it's a standalone util
    // For now, assuming mapStore.totalRouteDuration is in seconds
    const totalSeconds = mapStore.totalRouteDuration;
    if (totalSeconds === null || totalSeconds === undefined || totalSeconds < 0) return 'N/A';
    if (totalSeconds === 0 && mapStore.routeWaypointsForDisplay.length <=1 ) return '0m'; // Show 0m if only start point or no route

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    let str = '';
    if (hours > 0) {
        str += `${hours}h `;
    }
    str += `${minutes}m`;
    return str;
});

// The checkboxes for route settings are directly v-modeled to settingsStore.
// The watcher in App.vue will call mapStore.updateRoutePreferences when these change.
</script>

<style scoped>
.ui-section {
  margin-bottom: 1.5em;
}
.ui-section h3 {
  margin-top: 0;
  margin-bottom: 0.5em;
}
.no-pad-top {
  padding-top: 0;
}
.checkbox-option {
  margin-bottom: 0.5em;
}
.checkbox-option label {
  display: block;
  margin-bottom: 0.25em;
}
.checkbox-option .description {
  font-size: 0.9em;
  color: #666;
  margin-left: 1.5em; /* Align with checkbox text */
  margin-top: 0;
}
.routelist {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
}
.routelist caption {
  text-align: left;
  font-weight: bold;
  padding-bottom: 0.5em;
}
.routelist th, .routelist td {
  padding: 0.3em 0.5em;
  text-align: left;
  border-bottom: 1px solid #eee;
}
.routelist th.count, .routelist td.count { width: 30px; text-align: right; }
.routelist th.control, .routelist td.control { width: 40px; text-align: center; }
.routelist th.duration, .routelist td.duration { width: 70px; text-align: right; }
.muted { color: #777; }
.small { font-size: 0.9em; }
.delete-route {
  padding: 0.5em 1em;
}
.delete-route i {
  margin-right: 0.5em;
}
/* Status message styling */
.no-route { color: #777; }
.calculating { color: #31708f; }
.route-ok { color: green; }
.route-error { color: #a94442; }
.error { background-color: #f2dede; padding: 10px; border-radius: 4px; }
.warning { background-color: #fcf8e3; padding: 10px; border-radius: 4px; }
.success { padding: 10px; border-radius: 4px; } /* No specific background for success text only */
</style>
