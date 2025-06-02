<template>
  <div>
    <!-- The tabHeader 'About this map' is handled by the parent UIPanel.vue -->

    <p class="ui-section">
      A 3D (and 2D) interactive galaxy map of the space sim adventure game
      <a href="https://robertsspaceindustries.com/about-the-game" target="_blank" rel="noopener noreferrer">Star Citizen</a>
      (currently being developed).
    </p>

    <p class="ui-section">
      Created by
      <a href="https://forums.robertsspaceindustries.com/profile/51803/Shiari" title="My profile on the Roberts Space Industries forums" target="_blank" rel="noopener noreferrer">Daughter of Sol</a>
      (@Shiari on the RSI forums) using <a href="http://get.webgl.org/" target="_blank" rel="noopener noreferrer">WebGL</a> and is announced and discussed in
      <a href="https://forums.robertsspaceindustries.com/discussion/54931/browser-based-3d-system-map-wip" target="_blank" rel="noopener noreferrer">my forum thread</a>.
    </p>

    <p class="ui-section">
      Map data was originally kindly provided for use by me by
      <a href="https://forums.robertsspaceindustries.com/profile/149083/Zuur" target="_blank" rel="noopener noreferrer">Zuur</a>,
      see <a href="http://mobiglas.com/StarMap/" target="_blank" rel="noopener noreferrer">the MobiGlas Star Map</a> for his original map.
      It's now also updated with some of the data from the
      <a href="https://robertsspaceindustries.com/starmap" target="ark-map" rel="noopener noreferrer">ARK star map</a>.
    </p>

    <p class="ui-section">
      The sourcecode which drives this map is available under the MIT license on its
      <a href="https://github.com/Leeft/Star-Citizen-WebGL-Map" target="_blank" rel="noopener noreferrer">GitHub project page</a>.
    </p>
  </div>
</template>

<script setup>
// No specific script logic needed for this static panel yet.
// Data like SFEVER mentioned in the main task description isn't present in this specific .hbs file,
// but if it were, it would be handled here or passed as props.
</script>

<style scoped>
.ui-section {
  margin-bottom: 1em;
}
/* Add any other specific styles for AboutPanel here if necessary */
</style>
