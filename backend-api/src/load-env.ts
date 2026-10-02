import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { paths } from './lib/paths.js'

// Hosts such as cPanel/Passenger start `dist/server.js` without --env-file. Variables that are
// already set (host config, --env-file) win over the file.
const file = resolve(paths.root, '.env')
if (existsSync(file)) process.loadEnvFile(file)
