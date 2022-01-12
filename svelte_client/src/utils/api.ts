import { BASE_DOMAIN, API_BASE } from './constants'

export default {
  reprocessAllRuns: async function(runId) {
    const url = `${API_BASE}/process_run?bucketName=arikardasis-runs`
    const res = await fetch(url)
    return res.json()
  },
  processRun: async function(runId) {
    const url = `${API_BASE}/process_run?bucketName=arikardasis-runs&objectKey=${runId}.json`
    const res = await fetch(url)
    return res.json()
  },
  getRunData: async function(runId) {
    if (runId === '') return null
    const res = (await fetch(`${API_BASE}/run_data/${runId}`))
    return res.json()
  },
  getRuns: async function() {
    const res = await fetch(`${API_BASE}/runs`)
    return (await res.json()).Items
  },
  duplicateRun: async function(runId) {
    const url = `${API_BASE}/duplicate_run?bucketName=arikardasis-runs&objectKey=${runId}.json`
    const res = await fetch(url)
    return (await res.json()).Items
  },
  deleteRun: async function(runId) {
    const res = await fetch(
      `${API_BASE}/run/${runId}`, 
      { method: 'DELETE' }
    )
    return (await res.json())
  }
}
