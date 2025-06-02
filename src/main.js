import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Import
import App from './App.vue';

// Import styles
import '../css/sc.css'; // Or your SASS entry point

const app = createApp(App);
app.use(createPinia()); // Use Pinia
app.mount('#app');
