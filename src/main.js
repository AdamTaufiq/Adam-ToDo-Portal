import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)
app.mount('#app')

setTimeout(() => {
  const root = document.querySelector('#app')
  const fallback = document.querySelector('#fallback-login')
  if (root && root.textContent.trim() && fallback) fallback.remove()
}, 1000)
