import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'

import { devtools } from '@vue/devtools'
import 'leaflet/dist/leaflet.css'



const app = createApp(App)

if (import.meta.env.MODE === 'development') devtools.connect()


app.use(router).use(store).mount('#app')
