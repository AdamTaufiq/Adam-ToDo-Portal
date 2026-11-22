import { createClient } from '@supabase/supabase-js'

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
}

export function getToken(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return null
  return header.slice(7)
}

export async function getAuthenticatedClient(req, res) {
  const token = getToken(req)
  if (!token) {
    res.status(401).json({ error: 'Missing Bearer access token' })
    return null
  }

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    res.status(500).json({ error: 'Supabase server environment variables are not configured' })
    return null
  }

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired access token' })
    return null
  }
  return { client, user: data.user }
}
