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

export async function fetchTables() {
  const res = await fetch('http://127.0.0.1:8000/database/list', {
    headers: { 'Accept': 'text/html,application/json' }
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`)
  }
  const body = await res.text()
  // Try JSON first; if that fails, parse HTML and extract the <pre> content
  try {
    return JSON.parse(body)
  } catch {
    try {
      const doc = new DOMParser().parseFromString(body, 'text/html')
      const pre = doc.querySelector('pre')
      if (!pre) {
        throw new Error('Missing <pre> element in response')
      }
      return JSON.parse(pre.textContent || '[]')
    } catch (err) {
      throw new Error(`Failed to parse table list: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}
