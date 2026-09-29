# WebDev

One repository for many websites. Each site lives in its own folder under `sites/`, with its own
README, dependencies and scripts. The root ties them together with
[npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces), so one `npm install` sets up
every site.

## Sites

| Site | What it is | Stack |
| --- | --- | --- |
| [`elastic`](sites/elastic) | Elastic, a motion-driven portfolio template for Framer | Framer code components, React, Vite preview |

## Layout

```
sites/                one folder per website
  elastic/
templates/            starters that `npm run new` copies into sites/
  vite-react/
scripts/              repo-wide tooling
tsconfig.base.json    shared TypeScript settings that sites extend
```

## Working on a site

Run everything from the repository root:

```bash
npm install                     # installs every site's dependencies
npm run dev -w elastic          # start one site
npm run build -w elastic        # build one site
npm run typecheck               # type-check every site
npm run build                   # build every site
```

`-w <name>` targets one site by its folder name. You can also `cd sites/<name>` and run its
scripts without `-w`. To add a dependency to one site: `npm install <package> -w <name>`.

## Adding a site

```bash
npm run new -- my-site          # copies templates/vite-react into sites/my-site
npm install
npm run dev -w my-site
```

Then add a row to the table above.

For a site that doesn't fit a starter (Next.js, Astro, plain HTML…), create `sites/<name>/`
yourself and give it a `package.json` whose `name` matches the folder. Add `dev`, `build` and
`typecheck` scripts where they apply; the root `build` and `typecheck` commands run them for
every site that has them.

## Conventions

- **One site, one folder.** Everything a site needs (source, assets, mockups, deploy scripts)
  stays inside `sites/<name>/`. Nothing site-specific goes at the root.
- **Folder name = package name**, in lowercase with dashes, so `-w <name>` works.
- **Sites don't import from each other.** When code is worth sharing, put it in a package
  under `packages/` and add `"packages/*"` to `workspaces` in the root `package.json`.
- **Build output** goes to the site's own `dist/`, which is ignored by git.
- **Secrets** such as API keys come from environment variables or a `.env` file, which is
  ignored by git. Commit a `.env.example` listing the variables a site needs.
