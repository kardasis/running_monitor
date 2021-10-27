import { BASE_DOMAIN } from './constants'

export default {
  baseUrl: `http://${BASE_DOMAIN}:3030`,
  getRun: async function(name) {
    if (!name) return null
    const res = (await fetch(`${this.baseUrl}/run/${name}`))
    return res.json()
  },
  getRuns: async function() {
    const res = await fetch(`${this.baseUrl}/runs`)
    return res.json()
  }
}
