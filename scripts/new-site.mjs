#!/usr/bin/env node
// Creates a new site in sites/<name> from a starter in templates/.
//
//   npm run new -- <name>                          # Vite + React + TypeScript starter
//   npm run new -- <name> --template <starter>     # any other folder in templates/
//
// Every "__SITE_NAME__" in the starter's files is replaced with <name>.

import { cp, readdir, readFile, writeFile, stat } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const TEMPLATES = join(ROOT, "templates")
const SITES = join(ROOT, "sites")
const PLACEHOLDER = "__SITE_NAME__"

const args = process.argv.slice(2)
const flag = args.indexOf("--template")
const template = flag === -1 ? "vite-react" : args[flag + 1]
const name = args.find((a, i) => !a.startsWith("--") && (flag === -1 || i !== flag + 1))

const starters = (await readdir(TEMPLATES, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)

function fail(message) {
    console.error(message)
    process.exit(1)
}

if (!name) fail(`Usage: npm run new -- <name> [--template ${starters.join("|")}]`)
if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) fail(`"${name}" isn't a valid site name. Use lowercase letters, numbers and dashes.`)
if (!starters.includes(template)) fail(`No starter called "${template}". Available: ${starters.join(", ")}.`)

const target = join(SITES, name)
if (await exists(target)) fail(`sites/${name} already exists.`)

await cp(join(TEMPLATES, template), target, {
    recursive: true,
    filter: (src) => !/[\\/](node_modules|dist)$/.test(src),
})

for (const file of await listFiles(target)) {
    const text = await readFile(file, "utf8")
    if (text.includes(PLACEHOLDER)) await writeFile(file, text.replaceAll(PLACEHOLDER, name))
}

console.log(`Created sites/${name} from templates/${template}.

Next:
  npm install
  npm run dev -w ${name}

Then add the site to the table in README.md.`)

async function exists(path) {
    try {
        await stat(path)
        return true
    } catch {
        return false
    }
}

async function listFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true, recursive: true })
    return entries.filter((e) => e.isFile()).map((e) => join(e.parentPath, e.name))
}
