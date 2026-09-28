// Elastic — shared theme, styles and helpers.
// Every other Elastic component imports from this file, so changing a colour
// or font here re-skins the whole template.

import * as React from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { RenderTarget } from "framer"
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"

/* ------------------------------------------------------------------ */
/*  Tokens — edit these                                                 */
/* ------------------------------------------------------------------ */

/** "auto" follows the visitor's OS setting. Use "light" or "dark" to lock it. */
export const THEME_MODE: "auto" | "light" | "dark" = "auto"

export const palette = {
    light: {
        bg: "#E3E5EA", // Concrete
        surface: "#ECEEF2",
        ink: "#111317", // Graphite
        muted: "#5A5F6A",
        line: "rgba(17, 19, 23, 0.14)",
        accent: "#2F3BFF", // Ultramarine
        onAccent: "#FFFFFF",
    },
    dark: {
        bg: "#0E0F12",
        surface: "#17191E",
        ink: "#E8E9ED",
        muted: "#8F949E",
        line: "rgba(232, 233, 237, 0.14)",
        accent: "#8D95FF",
        onAccent: "#0E0F12",
    },
}

/**
 * Archivo is used for everything except labels because of its width axis
 * (62%–125%). The "elastic" motion in this template animates that axis.
 * If you swap the font, pick another variable font with a `wdth` axis.
 */
export const fonts = {
    sans: `"Archivo", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`,
    mono: `"Fragment Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`,
    href: "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Fragment+Mono&display=swap",
}

export const EASE_OUT = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const

/* ------------------------------------------------------------------ */
/*  Global CSS                                                          */
/* ------------------------------------------------------------------ */

type Palette = typeof palette.light

const tokens = (p: Palette) =>
    `--el-bg:${p.bg};--el-surface:${p.surface};--el-ink:${p.ink};--el-muted:${p.muted};--el-line:${p.line};--el-accent:${p.accent};--el-on-accent:${p.onAccent};`

const NOISE =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
    )

function themeBlocks() {
    const base = THEME_MODE === "dark" ? palette.dark : palette.light
    let css = `:root{${tokens(base)}--el-sans:${fonts.sans};--el-mono:${fonts.mono};--el-gutter:clamp(16px,3.4vw,52px);--el-ease:cubic-bezier(.16,1,.3,1);${THEME_MODE === "dark" ? "color-scheme:dark;" : ""}}`
    if (THEME_MODE === "auto") {
        css += `@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${tokens(palette.dark)}color-scheme:dark}}`
        css += `:root[data-theme="dark"]{${tokens(palette.dark)}color-scheme:dark}`
    }
    return css
}

export const GLOBAL_CSS =
    themeBlocks() +
    `
/* Base rules use :where() so they have zero specificity: every component class wins,
   even when several Elastic components each render this stylesheet. */
:where(.el){font-family:var(--el-sans);color:var(--el-ink);font-size:17px;line-height:1.5;font-variation-settings:"wdth" 100;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-kerning:normal;text-rendering:optimizeLegibility}
:where(.el) *,:where(.el) *::before,:where(.el) *::after{box-sizing:border-box}
:where(.el) :where(h1,h2,h3,h4,p,ul,ol,figure,dl,dd,blockquote){margin:0}
:where(.el) :where(ul,ol){padding:0;list-style:none}
:where(.el) :where(a){color:inherit;text-decoration:none}
:where(.el) :where(button){font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
:where(.el) :where(img){display:block;max-width:100%}
:where(.el) :focus-visible{outline:2px solid var(--el-accent);outline-offset:4px;border-radius:2px}
.el-label{font-family:var(--el-mono);font-size:12px;line-height:1.35;letter-spacing:.06em;text-transform:uppercase;font-variant-numeric:tabular-nums}
.el-muted{color:var(--el-muted)}
.el-balance{text-wrap:balance}
.el-grain{position:relative;isolation:isolate}
.el-grain::after{content:"";position:absolute;inset:0;pointer-events:none;background-image:url("${NOISE}");background-size:180px;opacity:.26;mix-blend-mode:overlay;z-index:2}
.el-flex{display:inline-grid;vertical-align:bottom}
.el-flex>span{grid-area:1/1;white-space:nowrap}
.el-flex--wrap>span{white-space:normal}
.el-flex__size{visibility:hidden;font-variation-settings:"wdth" var(--w1),"wght" var(--g1)}
.el-flex__text{font-variation-settings:"wdth" var(--w0),"wght" var(--g0);transition:font-variation-settings .6s var(--el-ease)}
.el-hover:hover .el-flex__text,.el-hover:focus-visible .el-flex__text,.el-hover[data-active="true"] .el-flex__text{font-variation-settings:"wdth" var(--w1),"wght" var(--g1)}
.el-elastic{position:relative;container-type:inline-size;font-weight:560;line-height:.92;letter-spacing:-.005em;white-space:nowrap;display:block}
.el-elastic__line{display:block;overflow:hidden;padding:0 .05em .16em;margin:0 -.05em -.16em}
.el-elastic__letter{display:inline-block}
.el-elastic__measure{position:absolute;left:0;top:0;visibility:hidden;white-space:pre;font-size:100px;pointer-events:none}
/* Underline draws in from the left and leaves to the right. */
.el-uline{background:linear-gradient(currentColor,currentColor) 100% 100%/0% 1px no-repeat;transition:background-size .55s var(--el-ease)}
.el-hover:focus-visible .el-uline{background-size:100% 1px;background-position:0 100%}
/* Hairline that draws from the left when revealed. Its parent needs position:relative. */
.el-rule{position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--el-line);transform-origin:0 50%;pointer-events:none}
.el-rule--top{top:0;bottom:auto}
/* Label whose letters roll up one after another, replaced by a copy from below (text-shadow). */
.el-roll{position:relative;display:inline-block;overflow:hidden;vertical-align:top;line-height:1.3;height:1.3em;white-space:nowrap}
.el-roll__c{display:inline-block;white-space:pre;text-shadow:0 1.3em currentColor;transition:transform .55s var(--el-ease)}
.el-hover:focus-visible .el-roll__c{transform:translateY(-1.3em)}
/* Arrow that leaves along its direction while a second one arrives behind it. */
.el-arrow{position:relative;display:inline-grid;overflow:hidden;flex:none;vertical-align:middle}
.el-arrow>span{grid-area:1/1;display:block;transition:transform .5s var(--el-ease)}
.el-arrow svg{display:block}
.el-arrow>span+span{transform:translate(calc(var(--ax) * -110%),calc(var(--ay) * -110%))}
.el-hover:focus-visible .el-arrow>span:first-child{transform:translate(calc(var(--ax) * 110%),calc(var(--ay) * 110%))}
.el-hover:focus-visible .el-arrow>span+span{transform:none;transition-delay:.06s}
/* Tactile press. Uses the scale property so it composes with motion transforms.
   Declared before .el-fill so a filled button keeps its colour transitions. */
.el-press{transition:scale .3s var(--el-ease)}
.el-press:active{scale:.96;transition-duration:.12s}
/* Fill that grows from where the pointer enters and shrinks to where it leaves (see trackFill). */
@property --el-fr{syntax:"<length>";inherits:false;initial-value:0px}
.el-fill{position:relative;isolation:isolate;transition:color .4s var(--el-ease),border-color .4s var(--el-ease),scale .3s var(--el-ease)}
.el-fill::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;pointer-events:none;--el-fr:0px;background:radial-gradient(circle var(--el-fr) at var(--el-fx,50%) var(--el-fy,50%),var(--el-fill-bg,var(--el-ink)) calc(100% - .5px),transparent 100%);transition:--el-fr .6s var(--el-ease)}
.el-fill:focus-visible::before,.el-hover:focus-visible .el-fill::before{--el-fr:var(--el-fd,240px)}
.el-fill:not(.el-fill--tint):focus-visible,.el-hover:focus-visible .el-fill:not(.el-fill--tint){color:var(--el-fill-fg,var(--el-bg));border-color:var(--el-fill-bg,var(--el-ink))}
.el-fill--tint{--el-fill-bg:color-mix(in srgb,var(--el-ink) 7%,transparent)}
/* Hover states only for real hover, so taps on touch screens don't leave them stuck on. */
@media (hover: hover){
  .el-hover:hover .el-uline{background-size:100% 1px;background-position:0 100%}
  .el-hover:hover .el-roll__c{transform:translateY(-1.3em)}
  .el-hover:hover .el-arrow>span:first-child{transform:translate(calc(var(--ax) * 110%),calc(var(--ay) * 110%))}
  .el-hover:hover .el-arrow>span+span{transform:none;transition-delay:.06s}
  .el-fill:hover::before,.el-hover:hover .el-fill::before{--el-fr:var(--el-fd,240px)}
  .el-fill:not(.el-fill--tint):hover,.el-hover:hover .el-fill:not(.el-fill--tint){color:var(--el-fill-fg,var(--el-bg));border-color:var(--el-fill-bg,var(--el-ink))}
}
.el-dot{position:relative;display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--el-accent);flex:none}
.el-dot::after{content:"";position:absolute;inset:0;border-radius:50%;background:inherit;animation:el-pulse 2.2s var(--el-ease) infinite}
.el-scroll-x{overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.el-scroll-x::-webkit-scrollbar{display:none}
.el-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@keyframes el-pulse{0%{transform:scale(1);opacity:.55}100%{transform:scale(2.8);opacity:0}}
@keyframes el-spin{to{transform:rotate(360deg)}}
@keyframes el-drift{0%,100%{transform:translateX(0)}50%{transform:translateX(var(--drift,12px))}}
@media (prefers-reduced-motion: reduce){:where(.el) *,:where(.el) *::before,:where(.el) *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
`

/** Renders the font link and global CSS. Every Elastic component includes it. */
export function ThemeStyles() {
    return (
        <>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link rel="stylesheet" href={fonts.href} />
            <style data-elastic="">{GLOBAL_CSS}</style>
        </>
    )
}

/* ------------------------------------------------------------------ */
/*  Environment helpers                                                 */
/* ------------------------------------------------------------------ */

/** True on the Framer canvas, thumbnails and exports, where motion should rest. */
export function isStaticTarget() {
    const t = RenderTarget.current()
    return t === RenderTarget.canvas || t === RenderTarget.thumbnail || t === RenderTarget.export
}

export const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

export function useMounted() {
    const [mounted, setMounted] = useState(false)
    useIsoLayoutEffect(() => setMounted(true), [])
    return mounted
}

export function useMedia(query: string, fallback = false) {
    const [matches, setMatches] = useState(fallback)
    useEffect(() => {
        const mq = window.matchMedia(query)
        const update = () => setMatches(mq.matches)
        update()
        mq.addEventListener("change", update)
        return () => mq.removeEventListener("change", update)
    }, [query])
    return matches
}

export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)")
export const useReducedMotionPref = () => useMedia("(prefers-reduced-motion: reduce)")

/** Local time for a IANA zone, refreshed every 20s. Renders "--:--" on the server. */
export function useLocalTime(timeZone: string) {
    const [time, setTime] = useState("--:--")
    useEffect(() => {
        const fmt = () => {
            try {
                return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date())
            } catch {
                return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date())
            }
        }
        setTime(fmt())
        const id = window.setInterval(() => setTime(fmt()), 20000)
        return () => window.clearInterval(id)
    }, [timeZone])
    return time
}

/** Smooth-scrolls to an in-page anchor (#work). Returns false for normal links. */
export function scrollToAnchor(href: string | undefined, offset = 0) {
    if (!href || !href.startsWith("#") || href.length < 2) return false
    const target = document.getElementById(href.slice(1))
    if (!target) return false
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const top = target.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" })
    return true
}

/* ------------------------------------------------------------------ */
/*  Intro hand-off between Preloader and Hero                           */
/* ------------------------------------------------------------------ */

const INTRO_EVENT = "elastic:intro"

export function holdIntro() {
    ;(window as any).__elIntroHeld = true
}

export function releaseIntro() {
    ;(window as any).__elIntroHeld = false
    window.dispatchEvent(new Event(INTRO_EVENT))
}

/** False while the preloader is still covering the page. */
export function useIntroReady() {
    const [ready, setReady] = useState(false)
    useEffect(() => {
        if (!(window as any).__elIntroHeld) {
            setReady(true)
            return
        }
        const go = () => setReady(true)
        window.addEventListener(INTRO_EVENT, go, { once: true })
        const failsafe = window.setTimeout(go, 5000)
        return () => {
            window.removeEventListener(INTRO_EVENT, go)
            window.clearTimeout(failsafe)
        }
    }, [])
    return ready
}

/* ------------------------------------------------------------------ */
/*  Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

/**
 * Text whose width axis stretches when its `.el-hover` parent is hovered.
 * An invisible copy reserves the stretched width so nothing around it shifts.
 */
export function FlexText({
    children,
    rest = [100, 450],
    hover = [122, 620],
    wrap = false,
    className = "",
    style,
}: {
    children: string
    rest?: [number, number]
    hover?: [number, number]
    wrap?: boolean
    className?: string
    style?: React.CSSProperties
}) {
    const vars = { "--w0": rest[0], "--g0": rest[1], "--w1": hover[0], "--g1": hover[1] } as React.CSSProperties
    return (
        <span className={`el-flex ${wrap ? "el-flex--wrap" : ""} ${className}`} style={{ ...vars, ...style }}>
            <span className="el-flex__size" aria-hidden="true">
                {children}
            </span>
            <span className="el-flex__text">{children}</span>
        </span>
    )
}

/**
 * A heading that unfolds from condensed to its full width as it scrolls into view.
 */
export function UnfoldTitle({
    children,
    className = "",
    id,
    from = [62, 420],
    to = [100, 560],
}: {
    children: React.ReactNode
    className?: string
    id?: string
    from?: [number, number]
    to?: [number, number]
}) {
    const ref = useRef<HTMLHeadingElement>(null)
    const reduce = useReducedMotion()
    const still = useRef(false)
    still.current = !!reduce
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 40%"] })
    const settings = useTransform(scrollYProgress, (p) => {
        const e = still.current ? 1 : 1 - Math.pow(1 - p, 3)
        return `"wdth" ${(from[0] + (to[0] - from[0]) * e).toFixed(2)}, "wght" ${(from[1] + (to[1] - from[1]) * e).toFixed(0)}`
    })
    return (
        <motion.h2 ref={ref} id={id} className={className} style={{ fontVariationSettings: isStaticTarget() ? `"wdth" ${to[0]}, "wght" ${to[1]}` : settings }}>
            {children}
        </motion.h2>
    )
}

const ARROW_VECTOR = { ne: [1, -1], e: [1, 0], s: [0, 1], w: [-1, 0], n: [0, -1] } as const

/**
 * `swap` makes the arrow leave along its own direction when its `.el-hover`
 * parent is hovered, while a second arrow arrives from behind.
 */
export function Arrow({ dir = "ne", size = 14, stroke = 1.5, swap = false }: { dir?: "ne" | "e" | "w" | "s" | "n"; size?: number; stroke?: number; swap?: boolean }) {
    const rotate = { ne: 0, e: 45, s: 135, w: 225, n: -45 }[dir]
    const svg = (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ transform: `rotate(${rotate}deg)`, flex: "none" }}>
            <path d="M4 12L12 4M12 4H5.5M12 4V10.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="square" />
        </svg>
    )
    if (!swap) return svg
    const [ax, ay] = ARROW_VECTOR[dir]
    return (
        <span className="el-arrow" aria-hidden="true" style={{ "--ax": ax, "--ay": ay } as React.CSSProperties}>
            <span>{svg}</span>
            <span>{svg}</span>
        </span>
    )
}

/* ------------------------------------------------------------------ */
/*  Motion system                                                       */
/*  Images wipe in, text rises and fades, hairlines draw from the left, */
/*  lists cascade. Everything reveals once and uses the same easing.    */
/* ------------------------------------------------------------------ */

export const REVEAL_VIEWPORT = { once: true, margin: "0px 0px -10% 0px" }

/** Fade-and-rise for a block of text as it scrolls into view. */
export function revealProps(still: boolean, delay = 0) {
    return {
        initial: still ? false : ({ opacity: 0, y: 20 } as const),
        whileInView: { opacity: 1, y: 0 },
        viewport: REVEAL_VIEWPORT,
        transition: { duration: 0.9, ease: EASE_OUT, delay },
    }
}

/** Parent of a cascading list: its `itemReveal` children follow one another. */
export function listReveal(still: boolean, delay = 0, stagger = 0.07) {
    return {
        initial: still ? (false as const) : "hidden",
        whileInView: "show",
        viewport: REVEAL_VIEWPORT,
        variants: { hidden: {}, show: { transition: { delayChildren: delay, staggerChildren: stagger } } },
    }
}

export const itemReveal = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
}

export const ruleReveal = {
    hidden: { scaleX: 0 },
    show: { scaleX: 1, transition: { duration: 1.1, ease: EASE_IN_OUT } },
}

/** A hairline that draws in with its parent's variants (inside a `listReveal`). */
export function Rule({ top = false }: { top?: boolean }) {
    return <motion.span aria-hidden="true" className={`el-rule ${top ? "el-rule--top" : ""}`} variants={ruleReveal} />
}

/** A hairline that draws in on its own when it scrolls into view. */
export function RevealRule({ still, top = false, delay = 0 }: { still: boolean; top?: boolean; delay?: number }) {
    return (
        <motion.span
            aria-hidden="true"
            className={`el-rule ${top ? "el-rule--top" : ""}`}
            initial={still ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: 1.1, ease: EASE_IN_OUT, delay }}
        />
    )
}

/**
 * A short label whose letters roll up in a quick wave when its `.el-hover`
 * parent is hovered. Screen readers get the plain text.
 */
export function RollText({ children }: { children: string }) {
    const chars = Array.from(children)
    // Long labels ripple faster so the whole wave stays under ~0.3s.
    const step = Math.min(18, 300 / Math.max(1, chars.length))
    return (
        <span className="el-roll">
            <span className="el-sr">{children}</span>
            <span aria-hidden="true">
                {chars.map((c, i) => (
                    <span key={i} className="el-roll__c" style={{ transitionDelay: `${Math.round(i * step)}ms` }}>
                        {c}
                    </span>
                ))}
            </span>
        </span>
    )
}

/**
 * Pointer handler for `.el-fill` buttons: records where the pointer entered
 * (or left) so the fill grows from, and shrinks back to, that point.
 * Put it on the element with `.el-fill`, or on a parent that contains one.
 */
export function trackFill(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType === "touch") return
    const host = e.currentTarget
    const el = host.classList.contains("el-fill") ? host : host.querySelector<HTMLElement>(".el-fill")
    if (!el) return
    const now = performance.now()
    // A quick pass-through keeps its entry point, so the circle never jumps mid-grow.
    if (e.type === "pointerleave" && now - Number(el.dataset.fillAt || 0) < 320) return
    if (e.type === "pointerenter") el.dataset.fillAt = String(now)
    const r = el.getBoundingClientRect()
    el.style.setProperty("--el-fx", `${(e.clientX - r.left).toFixed(1)}px`)
    el.style.setProperty("--el-fy", `${(e.clientY - r.top).toFixed(1)}px`)
    el.style.setProperty("--el-fd", `${Math.ceil(Math.hypot(r.width, r.height)) + 2}px`)
}

/**
 * Pulls an element toward the pointer while it moves over it (mouse only),
 * and springs it back on leave. Spread `x`/`y` into the element's style.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.3, spring = { stiffness: 170, damping: 13, mass: 0.5 }) {
    const fine = useFinePointer()
    const reduce = !!useReducedMotion()
    const ref = useRef<T>(null)
    const tx = useMotionValue(0)
    const ty = useMotionValue(0)
    const x = useSpring(tx, spring)
    const y = useSpring(ty, spring)
    const onPointerMove = (e: React.PointerEvent) => {
        const el = ref.current
        if (!el || !fine || reduce || e.pointerType === "touch") return
        const r = el.getBoundingClientRect()
        // Measure from the resting centre, not wherever the spring has carried it.
        tx.set((e.clientX - (r.left + r.width / 2 - x.get())) * strength)
        ty.set((e.clientY - (r.top + r.height / 2 - y.get())) * strength)
    }
    const onPointerLeave = () => {
        tx.set(0)
        ty.set(0)
    }
    return { ref, x, y, onPointerMove, onPointerLeave }
}

export function Cross({ size = 14, stroke = 1.5 }: { size?: number; stroke?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flex: "none" }}>
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth={stroke} strokeLinecap="square" />
        </svg>
    )
}

/* ------------------------------------------------------------------ */
/*  ElasticText — full-width text whose letters stretch near the cursor */
/* ------------------------------------------------------------------ */

export type ElasticMode = "cursor" | "scroll" | "off"

const EL_BASE_W = 92
const EL_BASE_G = 560
const EL_START_W = 62
const EL_AMP_W = 56
const EL_AMP_G = 300
const EL_STIFF = 0.085
const EL_DAMP = 0.8

/**
 * The line is sized to fill its container at the resting width. Letters near
 * the pointer widen and gain weight while the others give up the same amount,
 * so the line keeps its length. Springs give the motion a slight overshoot.
 */
export function ElasticText({
    text,
    play,
    instant,
    mode,
    areaRef,
    scrollRange = [0.4, 0.9],
    as = "div",
    className = "",
}: {
    text: string
    play: boolean
    instant: boolean
    mode: ElasticMode
    areaRef: React.RefObject<HTMLElement>
    /** Portion of the area's pass through the viewport (0–1) over which the scroll sweep runs. */
    scrollRange?: [number, number]
    as?: "h1" | "h2" | "div" | "span"
    className?: string
}) {
    const letters = Array.from(text.replace(/ /g, " "))
    const n = letters.length
    const measureRef = useRef<HTMLSpanElement>(null)
    const spans = useRef<(HTMLSpanElement | null)[]>([])
    const [ratio, setRatio] = useState(n * 0.6)
    const fine = useFinePointer()
    const sim = useRef({
        w: letters.map(() => EL_START_W),
        vw: letters.map(() => 0),
        g: letters.map(() => EL_BASE_G),
        vg: letters.map(() => 0),
        tw: letters.map(() => EL_START_W),
        tg: letters.map(() => EL_BASE_G),
        raf: 0,
        pointer: null as null | { x: number; y: number },
        entered: false,
    })

    useIsoLayoutEffect(() => {
        const m = measureRef.current
        if (!m) return
        const measure = () => {
            const w = m.getBoundingClientRect().width
            if (w > 0) setRatio(w / 100)
        }
        measure()
        const fonts = (document as any).fonts
        fonts?.ready?.then(measure)
        fonts?.addEventListener?.("loadingdone", measure)
        return () => fonts?.removeEventListener?.("loadingdone", measure)
    }, [text])

    const write = () => {
        const s = sim.current
        for (let i = 0; i < n; i++) {
            const el = spans.current[i]
            if (el) el.style.fontVariationSettings = `"wdth" ${s.w[i].toFixed(2)}, "wght" ${s.g[i].toFixed(0)}`
        }
    }

    // Weighted by each letter's rendered width, so what the wide letters gain
    // the others give back in pixels, not just in axis units.
    const bump = (g: number[], amount: number, widths?: number[]) => {
        const s = sim.current
        const w = widths ?? g.map(() => 1)
        const total = w.reduce((a, b) => a + b, 0) || 1
        const mean = g.reduce((a, gi, i) => a + gi * w[i], 0) / total
        for (let i = 0; i < n; i++) {
            s.tw[i] = EL_BASE_W + EL_AMP_W * amount * (g[i] - mean)
            s.tg[i] = EL_BASE_G + EL_AMP_G * amount * (g[i] - mean)
        }
    }

    const fromPointer = () => {
        const s = sim.current
        const area = areaRef.current
        const p = s.pointer
        if (!p || !area) return false
        const bounds = area.getBoundingClientRect()
        if (p.y < bounds.top || p.y > bounds.bottom) return false
        const g: number[] = []
        const widths: number[] = []
        for (let i = 0; i < n; i++) {
            const r = spans.current[i]?.getBoundingClientRect()
            if (!r) return false
            const size = r.height || 100
            const dx = (p.x - (r.left + r.width / 2)) / (size * 0.62)
            const vy = Math.max(0, Math.min(1, 1 - Math.abs(p.y - (r.top + r.height / 2)) / (size * 1.5)))
            g.push(Math.exp(-(dx * dx) / 2.9) * vy)
            widths.push(r.width)
        }
        bump(g, 1, widths)
        return true
    }

    const tick = () => {
        const s = sim.current
        if (s.entered && mode === "cursor" && fine && !fromPointer()) {
            s.tw.fill(EL_BASE_W)
            s.tg.fill(EL_BASE_G)
        }
        let moving = false
        for (let i = 0; i < n; i++) {
            s.vw[i] = (s.vw[i] + (s.tw[i] - s.w[i]) * EL_STIFF) * EL_DAMP
            s.w[i] += s.vw[i]
            s.vg[i] = (s.vg[i] + (s.tg[i] - s.g[i]) * EL_STIFF) * EL_DAMP
            s.g[i] += s.vg[i]
            if (Math.abs(s.vw[i]) > 0.01 || Math.abs(s.tw[i] - s.w[i]) > 0.05 || Math.abs(s.tg[i] - s.g[i]) > 0.5) moving = true
        }
        write()
        s.raf = moving ? requestAnimationFrame(tick) : 0
    }

    const kick = () => {
        if (!sim.current.raf) sim.current.raf = requestAnimationFrame(tick)
    }

    // Entrance: letters unfold one after another from condensed to resting width.
    useEffect(() => {
        if (!play) return
        const s = sim.current
        if (instant) {
            s.w.fill(EL_BASE_W)
            s.tw.fill(EL_BASE_W)
            s.entered = true
            write()
            return
        }
        const timers = letters.map((_, i) =>
            window.setTimeout(() => {
                s.tw[i] = EL_BASE_W
                kick()
            }, 140 + i * 60)
        )
        const done = window.setTimeout(() => (s.entered = true), 140 + n * 60 + 500)
        return () => {
            timers.forEach(clearTimeout)
            clearTimeout(done)
        }
    }, [play, instant])

    useEffect(() => {
        if (instant || mode !== "cursor" || !fine) return
        const onMove = (e: PointerEvent) => {
            sim.current.pointer = { x: e.clientX, y: e.clientY }
            kick()
        }
        const onLeave = () => {
            sim.current.pointer = null
            kick()
        }
        window.addEventListener("pointermove", onMove, { passive: true })
        document.documentElement.addEventListener("pointerleave", onLeave)
        return () => {
            window.removeEventListener("pointermove", onMove)
            document.documentElement.removeEventListener("pointerleave", onLeave)
        }
    }, [instant, mode, fine])

    // Scroll mode, and the touch-screen fallback for cursor mode.
    useEffect(() => {
        if (instant || mode === "off" || (mode === "cursor" && fine)) return
        const onScroll = () => {
            const s = sim.current
            const area = areaRef.current
            if (!s.entered || !area) return
            const r = area.getBoundingClientRect()
            const vh = window.innerHeight
            const p = (vh - r.top) / (vh + r.height)
            const t = (p - scrollRange[0]) / (scrollRange[1] - scrollRange[0])
            const pos = -1.5 + t * (n + 3)
            bump(
                letters.map((_, i) => Math.exp(-((i - pos) * (i - pos)) / 2.4)),
                t > 0 && t < 1 ? 0.9 : 0
            )
            kick()
        }
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [instant, mode, fine, n])

    useEffect(() => () => cancelAnimationFrame(sim.current.raf), [])

    const Tag = as as any
    const MotionLetter = motion.span
    return (
        <Tag className={`el-elastic ${className}`}>
            <span className="el-sr">{text}</span>
            <span className="el-elastic__measure" aria-hidden="true" ref={measureRef} style={{ fontVariationSettings: `"wdth" ${EL_BASE_W}, "wght" ${EL_BASE_G}` }}>
                {letters.join("")}
            </span>
            <span className="el-elastic__line" aria-hidden="true" style={{ fontSize: `calc(100cqw / ${(ratio * 1.035).toFixed(4)})` }}>
                {letters.map((ch, i) => (
                    <MotionLetter
                        key={i}
                        ref={(el: HTMLSpanElement | null) => (spans.current[i] = el)}
                        className="el-elastic__letter"
                        style={{ fontVariationSettings: `"wdth" ${EL_START_W}, "wght" ${EL_BASE_G}` }}
                        initial={{ y: "112%" }}
                        animate={play ? { y: "0%" } : undefined}
                        transition={instant ? { duration: 0 } : { duration: 1.15, ease: EASE_OUT, delay: 0.05 + i * 0.06 }}
                    >
                        {ch}
                    </MotionLetter>
                ))}
            </span>
        </Tag>
    )
}

/** Canvas stand-in for components that only exist as overlays on the live site. */
export function CanvasNote({ title, note }: { title: string; note: string }) {
    return (
        <div className="el" style={{ padding: 16, background: "var(--el-ink)", color: "var(--el-bg)", borderRadius: 8, width: "100%" }}>
            <ThemeStyles />
            <div className="el-label">{title}</div>
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>{note}</div>
        </div>
    )
}
