<template>
  <div class="collapsible-section">
    <div class="collapsible-header" @click="toggleOpen">
      <i :class="['fa', 'fa-fw', isOpen ? 'fa-caret-down' : 'fa-caret-right']"></i>
      {{ title }}
    </div>
    <div v-show="isOpen" class="collapsible-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  initiallyOpen: {
    type: Boolean,
    default: false,
  },
  storageKey: { // For sessionStorage persistence
    type: String,
    default: null,
  },
});

const isOpen = ref(props.initiallyOpen);

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

onMounted(() => {
  if (props.storageKey && typeof sessionStorage !== 'undefined') {
    const storedState = sessionStorage.getItem(props.storageKey);
    if (storedState !== null) {
      isOpen.value = JSON.parse(storedState);
    } else {
      // If not in session storage, set it based on initiallyOpen
      sessionStorage.setItem(props.storageKey, JSON.stringify(isOpen.value));
    }
  }
});

watch(isOpen, (newValue) => {
  if (props.storageKey && typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(props.storageKey, JSON.stringify(newValue));
  }
});
</script>

<style scoped>
.collapsible-section {
  margin-bottom: 10px; /* Space between sections */
  border: 1px solid #ddd; /* Optional border for the whole section */
  border-radius: 4px;
}

.collapsible-header {
  background-color: #f0f0f0; /* Light grey background for header */
  padding: 8px 12px;
  cursor: pointer;
  font-weight: bold;
  border-bottom: 1px solid #ddd; /* Separator if content is visible */
  display: flex;
  align-items: center;
}

.collapsible-header:hover {
  background-color: #e9e9e9;
}

.collapsible-header i.fa {
  margin-right: 8px;
  transition: transform 0.2s ease-in-out;
}

/* If using carets, this can rotate the icon - handled by class change now */
/* .collapsible-header.is-open i.fa-caret-right {
  transform: rotate(90deg);
} */

.collapsible-content {
  padding: 10px;
  border-top: none; /* Content area styling */
  background-color: #fff;
}
</style>
