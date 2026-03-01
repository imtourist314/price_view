export async function fetchItems() {
  const res = await fetch('/api/items', {
    headers: { 'Accept': 'application/json' }
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`)
  }
  return res.json()
}
