import { cors, getAuthenticatedClient } from '../_lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  res.setHeader('Content-Type', 'application/json')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await getAuthenticatedClient(req, res)
  if (!auth) return
  const { client, user } = auth
  const { data: profile, error } = await client.from('users').select('id,email,full_name,role,created_at').eq('id', user.id).single()
  if (error) return res.status(404).json({ error: 'User profile not found. Run auth_schema.sql.' })
  return res.status(200).json({ user, profile })
}
