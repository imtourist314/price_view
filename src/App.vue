<template>
  <main class="container">
    <h1>Items</h1>
    <form @submit.prevent="load">
      <button :disabled="loading">{{ loading ? 'Loading…' : 'Reload' }}</button>
    </form>

    <section v-if="error" class="error">
      {{ error }}
    </section>

    <ul v-if="items.length">
      <li v-for="item in items" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
    <p v-else-if="!loading">No items found.</p>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchItems } from './api.js'

const items = ref([])
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = await fetchItems()
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
</style>
