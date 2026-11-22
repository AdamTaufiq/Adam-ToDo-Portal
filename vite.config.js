import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const apiModules = {
  '/api/health': '/api/health.js',
  '/api/auth/login': '/api/auth/login.js',
  '/api/auth/register': '/api/auth/register.js',
  '/api/auth/me': '/api/auth/me.js',
  '/api/todos': '/api/todos.js'
}

function localApiPlugin() {
  return {
    name: 'local-api-functions',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url, 'http://127.0.0.1').pathname
        const modulePath = apiModules[pathname]
        if (!modulePath) return next()

        try {
          if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
            const chunks = []
            for await (const chunk of req) chunks.push(chunk)
            const rawBody = Buffer.concat(chunks).toString('utf8')
            req.body = rawBody ? JSON.parse(rawBody) : {}
          }
          res.status = (code) => { res.statusCode = code; return res }
          res.json = (payload) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(payload))
          }
          const handler = (await server.ssrLoadModule(modulePath)).default
          await handler(req, res)
        } catch (error) {
          if (!res.headersSent) res.statusCode = 500
          if (!res.writableEnded) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: error.message || 'Local API error' }))
          }
        }
      })
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    base: process.env.GITHUB_ACTIONS ? '/Adam-ToDo-Portal/' : '/',
    plugins: [vue(), localApiPlugin()]
  }
})
