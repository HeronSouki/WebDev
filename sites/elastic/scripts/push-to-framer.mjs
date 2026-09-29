#!/usr/bin/env node
// Copies the Elastic code components into a Framer project with Framer's Server API
// (https://www.framer.com/developers/server-api-introduction).
//
//   FRAMER_API_KEY=... npm run push                      # default project below
//   FRAMER_API_KEY=... npm run push -- <project url>     # any other project
//
// Create the key in Framer: open the project, Cmd+K → "Open settings" → API Keys.
// Existing files with the same name are updated in place; Framer keeps their version history.

import { readFile } from "node:fs/promises"
import { connect } from "framer-api"

const DEFAULT_PROJECT = "https://framer.com/projects/Tranquil-Biscuits--WY4qyJszb81qH3hv9Pe4-1ac2r"

// Theme and Covers first: every other file imports them.
const FILES = ["Theme", "Covers", "Preloader", "Cursor", "Navigation", "Hero", "Work", "Marquee", "About", "Contact"]

const arg = process.argv.slice(2).find((a) => !a.startsWith("--"))
const projectUrl = (arg || process.env.FRAMER_PROJECT_URL || DEFAULT_PROJECT).split("?")[0]
const token = process.env.FRAMER_API_KEY

if (!token) {
    console.error("FRAMER_API_KEY is not set. Create a key in your Framer project (Cmd+K → Open settings → API Keys).")
    process.exit(1)
}

const framer = await connect(projectUrl, token)
const pushed = []

try {
    for (const name of FILES) {
        const code = await readFile(new URL(`../framer/${name}.tsx`, import.meta.url), "utf8")
        const existing = await framer.getCodeFile(`${name}.tsx`)
        const file = existing ? await existing.setFileContent(code) : await framer.createCodeFile(name, code)
        pushed.push(file)
        console.log(`${existing ? "updated" : "created"}  ${file.path}`)
    }

    let errors = 0
    for (const file of pushed) {
        const diagnostics = await file.typecheck()
        for (const d of diagnostics.filter((d) => d.category === 1)) {
            errors++
            console.warn(`type error  ${file.path}: ${d.message}`)
        }
    }

    console.log(errors ? `\nPushed with ${errors} type error(s).` : "\nPushed. Type check passed.")
    console.log("Components are in Assets → Code. Add them to a page from top to bottom:")
    console.log("Preloader, Cursor, Navigation, Hero, Work, Marquee, About, Contact.")
} finally {
    await framer.disconnect()
}
