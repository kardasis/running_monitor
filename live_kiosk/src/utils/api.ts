import { BASE_DOMAIN, API_BASE } from './constants'

export default {
  fetchHistoricalBests: async function(runId) {
    const url = `${API_BASE}/historical_bests`
    const res = await fetch(url)
    return res.json()
  }
}
