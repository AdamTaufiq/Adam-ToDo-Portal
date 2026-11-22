<template>
  <main class="shell">
    <section v-if="!session" class="auth-layout">
      <div class="intro-panel">
        <p class="eyebrow">ADAM TODO PORTAL</p>
        <h1>Organise your day.<br><em>Keep moving.</em></h1>
        <p class="intro-copy">A private, simple workspace for capturing tasks and turning plans into progress.</p>
        <div class="feature-list"><span>✓ Secure REST API authentication</span><span>✓ Private per-user tasks</span><span>✓ Fast and simple workflow</span></div>
      </div>
      <div class="auth-card">
        <div class="brand-mark small">AT</div>
        <h2>{{ authMode === 'login' ? 'Welcome back' : 'Create your account' }}</h2>
        <p class="muted">{{ authMode === 'login' ? 'Sign in to continue to your tasks.' : 'Start managing your personal task list.' }}</p>
        <p class="notice info">Using the portal REST API: <code>{{ apiBase }}/auth/{{ authMode === 'login' ? 'login' : 'register' }}</code></p>
        <form @submit.prevent="submitAuth">
          <label>Email<input v-model.trim="email" type="email" autocomplete="email" placeholder="you@example.com" required /></label>
          <label>Password<input v-model="password" type="password" autocomplete="current-password" placeholder="Minimum 6 characters" minlength="6" required /></label>
          <button class="primary full" :disabled="busy">{{ busy ? 'Please wait...' : authMode === 'login' ? 'Sign in' : 'Create account' }}</button>
        </form>
        <p v-if="message" :class="['notice', messageType]">{{ message }}</p>
        <button class="link-button" @click="toggleAuth">{{ authMode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in' }}</button>
      </div>
    </section>

    <section v-else class="todo-layout">
      <header class="topbar"><div><p class="eyebrow">ADAM TODO PORTAL</p><h1>My tasks</h1></div><div class="user-area"><span>{{ session.user.email }}</span><button class="outline" @click="signOut">Sign out</button></div></header>
      <div class="todo-card">
        <form class="add-form" @submit.prevent="addTodo"><input v-model.trim="newTodo" placeholder="What needs to be done?" maxlength="200" required /><label class="date-field">Due date<input v-model="newDueDate" type="date" /></label><button class="primary" :disabled="busy">Add task</button></form>
        <div class="filters"><button v-for="filter in filters" :key="filter.key" :class="['filter', { active: activeFilter === filter.key }]" @click="activeFilter = filter.key">{{ filter.label }} <b>{{ filterCount(filter.key) }}</b></button></div>
        <div v-if="busy && !todos.length" class="empty">Loading your tasks...</div>
        <div v-else-if="!filteredTodos.length" class="empty"><div class="empty-icon">✓</div><h3>{{ todos.length ? 'No tasks in this view' : 'Your list is clear' }}</h3><p>Add a task above to get started.</p></div>
        <ul v-else class="todo-list"><li v-for="todo in filteredTodos" :key="todo.id" :class="{ completed: todo.completed }"><button class="check" :aria-label="todo.completed ? 'Mark incomplete' : 'Mark complete'" @click="toggleTodo(todo)">{{ todo.completed ? '✓' : '' }}</button><span class="todo-content"><span>{{ todo.title }}</span><small v-if="todo.due_date" class="due-date">Due {{ formatDate(todo.due_date) }}</small></span><button class="delete" aria-label="Delete task" @click="deleteTodo(todo)">×</button></li></ul>
        <footer class="todo-footer"><span>{{ remainingCount }} remaining</span><button v-if="completedCount" class="link-button" @click="clearCompleted">Clear completed</button></footer>
        <p v-if="message" :class="['notice', messageType]">{{ message }}</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const session = ref(JSON.parse(sessionStorage.getItem('adam_todo_session') || 'null'))
const authMode = ref('login')
const email = ref('')
const password = ref('')
const newTodo = ref('')
const newDueDate = ref('')
const todos = ref([])
const activeFilter = ref('all')
const busy = ref(false)
const message = ref('')
const messageType = ref('info')
const filters = [{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'completed', label: 'Completed' }]

const filteredTodos = computed(() => {
  if (activeFilter.value === 'active') return todos.value.filter(t => !t.completed)
  if (activeFilter.value === 'completed') return todos.value.filter(t => t.completed)
  return todos.value
})
const remainingCount = computed(() => todos.value.filter(t => !t.completed).length)
const completedCount = computed(() => todos.value.filter(t => t.completed).length)
function filterCount(key) { return key === 'all' ? todos.value.length : key === 'active' ? remainingCount.value : completedCount.value }
function formatDate(value) { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) }
function showMessage(text, type = 'info') { message.value = text; messageType.value = type }
function toggleAuth() { authMode.value = authMode.value === 'login' ? 'signup' : 'login'; message.value = '' }
function saveSession(nextSession) {
  session.value = nextSession
  if (nextSession) sessionStorage.setItem('adam_todo_session', JSON.stringify(nextSession))
  else sessionStorage.removeItem('adam_todo_session')
}
async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (session.value?.access_token) headers.Authorization = `Bearer ${session.value.access_token}`
  const response = await fetch(`${apiBase}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || `REST API request failed (${response.status})`)
  return payload
}
async function submitAuth() { return authMode.value === 'login' ? signIn() : signUp() }
async function signIn() {
  busy.value = true; message.value = ''
  try {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: email.value, password: password.value }) })
    saveSession(data)
    password.value = ''
    await loadTodos()
  } catch (error) { showMessage(error.message, 'error') }
  finally { busy.value = false }
}
async function signUp() {
  busy.value = true; message.value = ''
  try {
    const data = await request('/auth/register', { method: 'POST', body: JSON.stringify({ email: email.value, password: password.value }) })
    password.value = ''
    if (data.access_token) {
      saveSession(data)
      await loadTodos()
    } else {
      showMessage(data.message || 'Account created. Check your email before signing in.', 'success')
      authMode.value = 'login'
    }
  } catch (error) { showMessage(error.message, 'error') }
  finally { busy.value = false }
}
async function signOut() { saveSession(null); todos.value = []; message.value = '' }
async function loadTodos() {
  if (!session.value?.access_token) return
  busy.value = true
  try { const result = await request('/todos'); todos.value = result.data || [] }
  catch (error) { showMessage(error.message, 'error') }
  finally { busy.value = false }
}
async function addTodo() {
  if (!newTodo.value) return
  busy.value = true
  try { const result = await request('/todos', { method: 'POST', body: JSON.stringify({ title: newTodo.value, due_date: newDueDate.value || null }) }); todos.value.unshift(result.data); newTodo.value = ''; newDueDate.value = '' }
  catch (error) { showMessage(error.message, 'error') }
  finally { busy.value = false }
}
async function toggleTodo(todo) {
  try { const result = await request('/todos', { method: 'PATCH', body: JSON.stringify({ id: todo.id, completed: !todo.completed }) }); Object.assign(todo, result.data) }
  catch (error) { showMessage(error.message, 'error') }
}
async function deleteTodo(todo) {
  try { await request('/todos', { method: 'DELETE', body: JSON.stringify({ id: todo.id }) }); todos.value = todos.value.filter(item => item.id !== todo.id) }
  catch (error) { showMessage(error.message, 'error') }
}
async function clearCompleted() {
  const completed = todos.value.filter(t => t.completed)
  for (const todo of completed) await deleteTodo(todo)
}
async function validateSession() {
  if (!session.value?.access_token) return
  try { const result = await request('/auth/me'); session.value.user = result.user; await loadTodos() }
  catch { saveSession(null) }
}
onMounted(validateSession)
</script>
