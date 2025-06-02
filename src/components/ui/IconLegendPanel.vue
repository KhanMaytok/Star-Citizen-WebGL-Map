<template>
  <div class="icon-legend-panel">
    <h3>Icon legend</h3>
    <ul class="fa-ul bullet-list-med legend">
      <li v-for="(iconHtml, index) in icons" :key="index" v-html="iconHtml"></li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Placeholder data for icons. This would eventually come from props or a store.
// The format assumes each item is an HTML string, as suggested by `{{{this}}}`.
const icons = ref([
  '<i class="fa-li fa fa-fw fa-home"></i> System with a habitable planet',
  '<i class="fa-li fa fa-fw fa-anchor"></i> Major trade hub / Hangar location',
  '<i class="fa-li fa fa-fw fa-bookmark"></i> Bookmarked system',
  '<i class="fa-li fa fa-fw fa-comments"></i> System with user comments',
  '<i class="fa-li fa fa-fw fa-info"></i> System with noteworthy information',
  '<i class="fa-li fa fa-fw fa-exclamation-triangle"></i> System has warnings',
  '<i class="fa-li fa fa-fw fa-minus-circle"></i> System is off limits / forbidden',
  '<i class="fa-li fa fa-fw fa-warning"></i> Hostile system (e.g. Vanduul)',
  '<i class="fa-li fa fa-fw fa-ban"></i> Avoid this system in routing',
  // Add more placeholder icons if necessary, based on expected legend items.
]);
</script>

<style scoped>
/* Styles specific to IconLegendPanel can go here */
.icon-legend-panel {
  margin-top: 1em;
}

.legend {
  list-style: none; /* Assuming fa-ul handles bullet points if needed */
  padding-left: 0; /* Adjust if fa-ul requires padding */
}

.legend li {
  margin-bottom: 0.5em;
}

/* Note: The original .hbs used FontAwesome classes like `fa-ul`.
   Ensure FontAwesome is loaded globally in the Vue application for these to work.
   The `v-html` directive is used because the original template suggests HTML content.
   If the icons array were just text and classes, a different approach could be taken.
   For example:
   <li v-for="icon in icons" :key="icon.text">
     <i class="fa-li fa fa-fw" :class="icon.class"></i> {{ icon.text }}
   </li>
   But this requires changing the structure of the `icons` data.
   For now, sticking to `v-html` to match the Handlebars `{{{this}}}`.
*/
</style>
