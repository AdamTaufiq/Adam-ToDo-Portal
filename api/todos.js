import { cors, getAuthenticatedClient } from './_lib/auth.js'

function bodyOf(req) {
  if (!req.body) return {}
  if (typeof req.body === 'object') return req.body
  try { return JSON.parse(req.body) } catch { return {} }
}

export default async function handler(req, res) {
  cors(res)
  res.setHeader('Content-Type', 'application/json')
  if (req.method === 'OPTIONS') return res.status(204).end()

  const auth = await getAuthenticatedClient(req, res)
  if (!auth) return
  const { client, user } = auth
  const email = user.email
  if (!email) return res.status(400).json({ error: 'Authenticated user email is required' })

  const { error: profileError } = await client.from('todo_users').upsert({ email, user_id: user.id }, { onConflict: 'email' })
  if (profileError) return res.status(500).json({ error: profileError.message })

  if (req.method === 'GET') {
    const { data, error } = await client.from('todos').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  if (req.method === 'POST') {
    const { title, due_date } = bodyOf(req)
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 200) {
      return res.status(400).json({ error: 'title is required and must be 1-200 characters' })
    }
    if (due_date !== undefined && due_date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
      return res.status(400).json({ error: 'due_date must use YYYY-MM-DD format' })
    }
    const { data, error } = await client.from('todos').insert({ title: title.trim(), due_date: due_date || null, email, user_id: user.id }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ data })
  }

  if (req.method === 'PATCH') {
    const { id, title, completed, due_date } = bodyOf(req)
    if (!id) return res.status(400).json({ error: 'id is required' })
    const update = {}
    if (typeof title === 'string') update.title = title.trim()
    if (typeof completed === 'boolean') update.completed = completed
    if (due_date !== undefined) {
      if (due_date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) return res.status(400).json({ error: 'due_date must use YYYY-MM-DD format' })
      update.due_date = due_date || null
    }
    if (!Object.keys(update).length) return res.status(400).json({ error: 'Provide title, due date or completed' })
    const { data, error } = await client.from('todos').update(update).eq('id', id).eq('user_id', user.id).select().single()
    if (error) return res.status(404).json({ error: 'Todo not found or update failed' })
    return res.status(200).json({ data })
  }

  if (req.method === 'DELETE') {
    const { id } = bodyOf(req)
    if (!id) return res.status(400).json({ error: 'id is required' })
    const { error } = await client.from('todos').delete().eq('id', id).eq('user_id', user.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ message: 'Todo deleted' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
