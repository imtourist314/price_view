<template>
  <main class="container">
    <h1>Database Tables</h1>
    <form @submit.prevent="load">
      <button :disabled="loading">{{ loading ? 'Loading…' : 'Reload' }}</button>
    </form>

    <section v-if="error" class="error">
      {{ error }}
    </section>

    <section v-if="tables.length">
      <label for="table-listbox">Tables</label>
      <select
        id="table-listbox"
        v-model="selected"
        :size="Math.min(12, Math.max(4, tables.length))"
        :disabled="loading"
      >
        <option v-for="name in tables" :key="name" :value="name">
          {{ name }}
        </option>
      </select>
    </section>
    <p v-else-if="!loading">No tables found.</p>

    <p class="selection" aria-live="polite">
      Selected table: <strong>{{ selected || 'None' }}</strong>
    </p>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchTables } from './api.js'

const tables = ref([])
const loading = ref(false)
const error = ref('')
const selected = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const list = await fetchTables()
    tables.value = list.map(t => (typeof t === 'string' ? t : t.table_name)).filter(Boolean)
    if (!tables.value.includes(selected.value)) {
      selected.value = ''
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style>
body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 2rem; }
.container { max-width: 720px; margin: 0 auto; }
.error { color: #b00020; margin-top: 1rem; }
button { padding: 0.5rem 0.75rem; }
#table-listbox { width: 100%; min-width: 320px; margin-top: 0.5rem; }
.selection { margin-top: 1rem; }
</style>
