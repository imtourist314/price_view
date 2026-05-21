async function requestText(url, { headers = {}, ...options } = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json, text/html;q=0.9, */*;q=0.8',
      ...headers
    }
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(
      `Request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`
    )
  }

  return res.text()
}

async function requestJson(url, options) {
  const text = await requestText(url, {
    ...options,
    headers: {
      ...(options?.headers || {}),
      Accept: 'application/json'
    }
  })

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Failed to parse JSON from ${url}`)
  }
}

export async function fetchItems() {
  // Legacy example endpoint (not used by the current UI)
  return requestJson('/api/items')
}

export async function fetchTables() {
  const body = await requestText('/database/list', {
    headers: { Accept: 'text/html,application/json' }
  })

  // The backend historically returned HTML with a <pre> containing JSON.
  try {
    return JSON.parse(body)
  } catch {
    const doc = new DOMParser().parseFromString(body, 'text/html')
    const pre = doc.querySelector('pre')
    if (!pre) {
      throw new Error('Failed to parse table list: missing <pre> element in response')
    }
    return JSON.parse(pre.textContent || '[]')
  }
}

export async function fetchOpenApiSpec() {
  return requestJson('/openapi.json')
}

export async function fetchTableStructure(tableName, { schema = 'public' } = {}) {
  const t = encodeURIComponent(tableName)
  const s = encodeURIComponent(schema)
  return requestJson(`/tables/${t}/structure?schema=${s}`)
}

export async function fetchTableData(tableName, { limit } = {}) {
  const t = encodeURIComponent(tableName)
  const params = new URLSearchParams()
  if (limit !== undefined && limit !== null) {
    params.set('limit', String(limit))
  }
  const suffix = params.toString() ? `?${params.toString()}` : ''

  const body = await requestText(`/data/${t}${suffix}`, {
    headers: { Accept: 'application/json, text/html' }
  })

  // Be tolerant of backends that respond with HTML wrapping JSON in a <pre>.
  try {
    return JSON.parse(body)
  } catch {
    const doc = new DOMParser().parseFromString(body, 'text/html')
    const pre = doc.querySelector('pre')
    if (!pre) {
      throw new Error('Failed to parse table data: expected JSON or an HTML <pre> containing JSON')
    }
    return JSON.parse(pre.textContent || '[]')
  }
}

export async function fetchAccountsActivity({ func, limit = 100, offset = 0 } = {}) {
  if (!func) {
    throw new Error('fetchAccountsActivity requires a { func } parameter')
  }
  const params = new URLSearchParams({
    func: String(func),
    limit: String(limit),
    offset: String(offset)
  })
  return requestJson(`/accounts/activity/?${params.toString()}`)
}
