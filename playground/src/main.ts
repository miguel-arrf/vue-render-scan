import { createApp } from 'vue'
import { createVueScan } from 'vue-render-scan'
import App from './App.vue'
import './styles.css'

createApp(App)
  .use(createVueScan({
    enabled: true,
    includeMounts: true,
    log: true,
    threshold: 0
  }))
  .mount('#app')
