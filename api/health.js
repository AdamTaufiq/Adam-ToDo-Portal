export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  return res.status(200).json({ service: 'adamTodoPortal API', status: 'ok' })
}
