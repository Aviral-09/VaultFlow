import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import router from './router';
import { i18n } from './i18n';

// Initialize saved theme or default to 'dark'
const initialTheme = window.localStorage.getItem('omnicloud-theme') || 'dark';
document.documentElement.classList.toggle('dark', initialTheme === 'dark');

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.mount('#app');
