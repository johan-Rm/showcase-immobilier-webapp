import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)
const jiti = require('jiti')(__filename)

const { config: loadEnv } = require('dotenv')
loadEnv({ path: resolve(__dirname, '../.env') })

const { runSchemaHook } = jiti(resolve(__dirname, '../services/hooks/schema.ts'))

await runSchemaHook()
