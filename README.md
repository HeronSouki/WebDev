# Elastic — a portfolio template for Framer

A motion-led portfolio for designers, art directors and studios, built as Framer code components.

The whole template shares one idea: **type that stretches**. Every display line is set in
[Archivo](https://fonts.google.com/specimen/Archivo), a variable font with a width axis
(62%–125%), and the motion animates that axis:

- The hero name fills the page width. Letters near the cursor widen and gain weight while the
  others condense, so the line keeps its length. On phones the stretch travels through the
  name as you scroll.
- The preloader counter widens as it counts to 100.
- Section titles unfold from condensed to full width as they scroll in.
- Index titles go from condensed-light to wide-bold on hover.
- The marquee stretches wider the faster you scroll.
- "Let's talk" in the footer reacts to the cursor like the hero.

Projects open into full case studies: the cover you click expands into the case study's hero
image, and closing sends it back to its card.

## Components

| File | What it is |
| --- | --- |
| `Theme.tsx` | Colours, fonts, global CSS and shared helpers. Every other file imports it. |
| `Covers.tsx` | Sample projects, the project store, and the generated placeholder art. |
| `Preloader.tsx` | 000→100 counter that lifts away. Once per browser session. |
| `Cursor.tsx` | Inverting dot; becomes a labelled bubble over projects ("View", "Open"). Mouse only. |
| `Navigation.tsx` | Fixed bar with local time, availability pill and active-section marker. Full-screen menu on phones. Hides on scroll down. |
| `Hero.tsx` | Statement, project reel (click to open that project) and the elastic name. |
| `Work.tsx` | Filters, Grid/Index views, hover preview, and the case-study overlay. |
| `Marquee.tsx` | Scroll-velocity marquee. |
| `About.tsx` | Scroll-lit bio, portrait with parallax, services, clients, experience. |
| `Contact.tsx` | Elastic "Let's talk", magnetic copy-email button, socials, local time, back to top. |

## Install into your Framer project

### Option A — push with the Server API (fastest)

1. In Framer, open the project, press **Cmd+K → Open settings → API Keys**, and create a key.
2. Run:

   ```bash
   npm install
   FRAMER_API_KEY=your-key npm run push
   ```

   This creates (or updates) all ten files under **Assets → Code** in
   `Tranquil-Biscuits` and type-checks them inside Framer. To target another project,
   pass its URL: `npm run push -- https://framer.com/projects/…`.

### Option B — copy by hand

1. In Framer, open **Assets → Code → +** and create a code file for each file in `framer/`.
   Use the **same names** (`Theme`, `Covers`, `Preloader`, …) because the files import each
   other as `./Theme.tsx` and `./Covers.tsx`.
2. Paste each file's contents. Create `Theme` and `Covers` first.

### Build the page

Drag the components from **Assets → Code** onto the page, top to bottom:

1. **Preloader** — first, at the top level of the page (not inside another frame).
2. **Cursor** — anywhere; it renders over everything.
3. **Navigation** — top level. It fixes itself to the top of the window.
4. **Hero**, **Work**, **Marquee**, **About**, **Contact** — stacked in a vertical stack
   with **no gap**.

For each section set **Width: Fill** and **Height: Fit**. The sections provide the anchors the
navigation links to: `#top`, `#work`, `#about` and `#contact`.

For a font that's ready on first paint, you can also add this to
**Site Settings → General → Custom Code → Start of `<head>` tag**:

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Fragment+Mono&display=swap">
```

## Make it yours

Select a component on the canvas and edit it in the right-hand panel.

**Projects** live in the Work component's *Projects* list. Each project has a title, category,
year, client, role, services, summary, description, a live link, a cover, three gallery
images, a colour and an accent colour.

- Categories become the filter chips automatically, with counts.
- Until you add images, each project gets generated cover art in its two colours
  (*Placeholder* picks the style), and the case study shows a poster mock-up, a detail crop
  and a colour-swatch sheet. Once a project has any image of its own, only your images are
  shown.
- Covers are cropped to fit, so use large images (at least 2400px wide for the case-study hero).
- The hero reel shows the same projects as Work. Clicking it opens that case study.

**Colours and fonts** are in `Theme.tsx`:

- `palette.light` / `palette.dark` — background, surface, ink, muted, line, accent.
- `THEME_MODE` — `"auto"` follows the visitor's system setting; set `"light"` or `"dark"` to lock it.
- `fonts` — to change the display face, choose another Google font with a `wdth` axis
  (for example *Roboto Flex*, *Anybody* or *Encode Sans*) and update the stylesheet URL.

**Cursor labels**: add `data-cursor="Label"` to any element to show a label bubble over it.
Add `data-cursor-quiet` to keep the dot small over an element that has its own hover effect
(buttons with a fill do this automatically).

## Motion system

Reveals and button interactions share a small vocabulary, all in `Theme.tsx`, so everything
moves the same way:

| On screen | How it moves | Helper |
| --- | --- | --- |
| Images | Wipe open from the bottom while the image settles from a slight zoom | inline `clipPath` |
| Text blocks | Rise 20px and fade in, once, as they enter | `revealProps(still, delay)` |
| Lists | Rows cascade in turn; each row's hairline draws from the left | `listReveal` + `itemReveal` + `<Rule />` |
| Hairlines | Draw from the left | `<RevealRule />` |
| Pill and round buttons | A fill grows from where the pointer enters and shrinks to where it leaves; press scales to 96% | `.el-fill` + `trackFill`, `.el-press` |
| Filter chips and toggles | The same fill as a light tint | `.el-fill--tint` |
| Small labels | Letters roll up in a quick wave | `<RollText>` |
| Arrows | Leave along their direction while a second arrow arrives | `<Arrow swap />` |
| Inline links | Underline draws in from the left and leaves to the right | `.el-uline` |
| Round icon buttons, copy email | Lean toward the pointer | `useMagnetic()` |

Everything also runs on keyboard focus, and hover effects only apply on devices that can hover.

## Motion and accessibility

- Visitors who set *reduce motion* skip the preloader and get instant transitions; the
  stretch effects stay still. Reveals only fade, with no movement.
- In a case study: **Esc** closes, **←** / **→** move between projects, focus stays inside
  the dialog, and it returns to the card you opened when you close.
- The custom cursor only runs with a mouse or trackpad. Touch screens get the scroll-driven
  versions of the effects, and the Index view shows thumbnails instead of the hover preview.
- On the Framer canvas every component renders in its finished state, so you can design
  around it without playing animations.

## Preview locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # single-file preview in dist/index.html
npm run typecheck
```

The preview in `preview/` renders the same files from `framer/` with a small stand-in for
Framer's `framer` module (`preview/framer-shim.tsx`), using each component's default props.
