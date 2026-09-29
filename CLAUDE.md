# Working in this repository

This repository holds many websites, one per folder under `sites/`. See `README.md` for the
layout and commands.

- Put each website's code, assets and scripts in `sites/<name>/`. Don't add site code at the root.
- Start a new site with `npm run new -- <name>`, or create `sites/<name>/package.json` by hand
  with `name` matching the folder. Add the site to the Sites table in `README.md`.
- Run commands from the root with `-w <name>` (e.g. `npm run dev -w elastic`), and add
  dependencies with `npm install <package> -w <name>` so they land in that site's
  `package.json`. There is one `package-lock.json`, at the root.
- Keep a site's own documentation in `sites/<name>/README.md`.
- Before committing, run `npm run typecheck` and `npm run build` from the root; they check every site.
