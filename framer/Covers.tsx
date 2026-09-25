// Elastic — project data, the shared project store, and cover art.
// Projects without images get generated cover art in the project's colours,
// so the template looks finished before you add your own work.

import * as React from "react"
import { useEffect, useId, useState } from "react"

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type ImageValue = { src?: string; srcSet?: string; alt?: string } | string | undefined | null

export type Motif = "orbit" | "slices" | "vessels" | "spread" | "contact" | "parallel" | "wave" | "seal"

export const MOTIF_OPTIONS: Motif[] = ["orbit", "slices", "vessels", "spread", "contact", "parallel", "wave", "seal"]
export const MOTIF_TITLES = ["Orbit", "Slices", "Vessels", "Book spread", "Contact sheet", "Parallel", "Waveform", "Seal"]

export interface Project {
    title: string
    category: string
    year: string
    client: string
    role: string
    services: string
    summary: string
    description: string
    color: string
    tone: string
    motif: Motif
    link?: string
    cover?: ImageValue
    gallery1?: ImageValue
    gallery2?: ImageValue
    gallery3?: ImageValue
}

/* ------------------------------------------------------------------ */
/*  Sample content                                                      */
/* ------------------------------------------------------------------ */

export const sampleProjects: Project[] = [
    {
        title: "Nocturne",
        category: "Branding",
        year: "2026",
        client: "Nocturne FM",
        role: "Identity, art direction",
        services: "Visual identity, Motion system, On-air graphics, Merchandise",
        summary: "An identity for a late-night radio station that only broadcasts between midnight and six.",
        description:
            "Nocturne FM plays slow music for people who are awake when the city isn't. The identity is built around a single sun that sets as the broadcast begins and rises when it signs off. Every asset, from the on-air clock to the tote bags, reads the time of night and shifts its palette to match.",
        color: "#17214D",
        tone: "#FF9E4F",
        motif: "orbit",
        link: "",
    },
    {
        title: "Soft Machines",
        category: "Motion",
        year: "2025",
        client: "Aurora Pictures",
        role: "Title design, motion direction",
        services: "Title sequence, Motion direction, Typography, Trailer graphics",
        summary: "Title sequence for a documentary about the people who repair old synthesizers.",
        description:
            "Each title card is sliced into scan lines that drift out of phase, the way a tired oscillator does. The whole sequence runs from one generative rig, so the editors could re-time every card to the score without waiting on a new render from me.",
        color: "#1D1933",
        tone: "#C9B8FF",
        motif: "slices",
        link: "",
    },
    {
        title: "Halden Ceramics",
        category: "Web",
        year: "2025",
        client: "Halden Studio",
        role: "Art direction, web design",
        services: "Art direction, E-commerce, Photography direction, Framer build",
        summary: "An online shop for a two-person ceramics studio that fires in small, numbered batches.",
        description:
            "Halden sells work in batches of forty. The shop is designed around the kiln schedule: each batch gets its own page, a countdown to the next firing, and a quiet grid of pieces photographed on the same shelf in the same north light.",
        color: "#D6CCBF",
        tone: "#5F7461",
        motif: "vessels",
        link: "",
    },
    {
        title: "Field Notes Vol. 3",
        category: "Print",
        year: "2024",
        client: "Outpost Press",
        role: "Editorial design",
        services: "Book design, Typesetting, Cover, Print production",
        summary: "A 240-page field guide to the urban plants of southern Europe.",
        description:
            "Volume three keeps the format of the first two: a flexible cover, a Swiss-bound spine that lies flat, and a strict two-column grid that leaves room for readers' own notes. Species plates were printed with a fifth spot colour so the greens stay true across the whole run.",
        color: "#23443A",
        tone: "#F0E6D2",
        motif: "spread",
        link: "",
    },
    {
        title: "Atlas of Small Things",
        category: "Photography",
        year: "2024",
        client: "Self-initiated",
        role: "Photography, sequencing",
        services: "Photography, Sequencing, Exhibition prints",
        summary: "Objects found in strangers' coat pockets, shot on a single roll of film per city.",
        description:
            "Thirty-six frames, one roll, one city. Strangers emptied their pockets onto a borrowed table and I photographed what came out. The series was shown as uncut contact sheets with the chosen frame circled in grease pencil, the way I first edited them.",
        color: "#EED24B",
        tone: "#141414",
        motif: "contact",
        link: "",
    },
    {
        title: "Parallel",
        category: "Branding",
        year: "2023",
        client: "Museu da Forma",
        role: "Exhibition identity",
        services: "Exhibition identity, Signage, Catalogue, Campaign",
        summary: "Identity for an exhibition pairing Portuguese and Japanese industrial design.",
        description:
            "Two collections, two slanted bars that never quite touch. The system runs on a single angle taken from the gallery floor plan, and it scales from ticket stubs to the eight-metre banners on the façade.",
        color: "#F1DAD2",
        tone: "#E0412E",
        motif: "parallel",
        link: "",
    },
    {
        title: "Wavelength",
        category: "Motion",
        year: "2023",
        client: "Wavelength Festival",
        role: "Generative identity",
        services: "Generative identity, Stage visuals, Social toolkit",
        summary: "A generative identity for an electronic music festival that listens to its line-up.",
        description:
            "Every artist on the bill gets a waveform drawn from their loudest track. Posters, stage visuals and wristbands all render from the same code, so the identity looked different for each of the 212 sets.",
        color: "#0B1027",
        tone: "#3DDCC6",
        motif: "wave",
        link: "",
    },
    {
        title: "Oda Coffee",
        category: "Packaging",
        year: "2022",
        client: "Oda Coffee Roasters",
        role: "Packaging, identity",
        services: "Packaging, Seal system, Illustration",
        summary: "Packaging for a small-batch roaster, sealed with a stamp that changes with every origin.",
        description:
            "The bags are plain kraft; the identity lives in a round seal applied by hand at the roastery. The seal's ring text carries the origin, altitude and roast date, so no two batches share a label.",
        color: "#A8BCAC",
        tone: "#3A2A1F",
        motif: "seal",
        link: "",
    },
]

/* ------------------------------------------------------------------ */
/*  Shared store: Work publishes its projects, Hero's reel reads them  */
/* ------------------------------------------------------------------ */

let sharedProjects: Project[] | null = null
const subscribers = new Set<() => void>()

export function publishProjects(projects: Project[]) {
    sharedProjects = projects
    subscribers.forEach((fn) => fn())
}

export function useSharedProjects() {
    const [projects, setProjects] = useState<Project[] | null>(null)
    useEffect(() => {
        const sync = () => setProjects(sharedProjects)
        sync()
        subscribers.add(sync)
        return () => {
            subscribers.delete(sync)
        }
    }, [])
    return projects
}

/** Lets other sections (the hero reel) open a case study owned by Work. */
type OpenRequest = { index: number; rect: DOMRect | null }
const openHandlers = new Set<(req: OpenRequest) => boolean>()

export function onOpenRequest(handler: (req: OpenRequest) => boolean) {
    openHandlers.add(handler)
    return () => {
        openHandlers.delete(handler)
    }
}

/** Returns false when no Work section is on the page to handle it. */
export function requestOpenProject(index: number, rect: DOMRect | null) {
    let handled = false
    openHandlers.forEach((fn) => {
        if (fn({ index, rect })) handled = true
    })
    return handled
}

/* ------------------------------------------------------------------ */
/*  Colour helpers                                                      */
/* ------------------------------------------------------------------ */

type RGB = [number, number, number]

/** Accepts hex, rgb()/rgba(), and Framer colour-style values like var(--token, rgb(...)). */
export function parseColor(input: string | undefined, fallback: RGB = [128, 128, 128]): RGB {
    if (!input) return fallback
    const s = String(input)
    const rgb = s.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i)
    if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
    const hex = s.match(/#([0-9a-f]{3,8})\b/i)
    if (hex) {
        let h = hex[1]
        if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split("").map((c) => c + c).join("")
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
    }
    return fallback
}

const toHex = ([r, g, b]: RGB) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase()

export function mix(a: string, b: string, t: number) {
    const A = parseColor(a)
    const B = parseColor(b)
    return toHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t])
}

export function luminance(color: string) {
    const [r, g, b] = parseColor(color).map((v) => {
        const c = v / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Readable text colour on top of `bg`. */
export const onColor = (bg: string) => (luminance(bg) > 0.33 ? "#111317" : "#F4F3EF")

interface ArtColors {
    bg: string
    fg: string
    light: string
    dark: string
}

function artColors(p: Project): ArtColors {
    const bg = toHex(parseColor(p.color, [23, 33, 77]))
    const fg = toHex(parseColor(p.tone, [255, 158, 79]))
    return { bg, fg, light: mix(bg, "#F6F4EF", 0.86), dark: mix(bg, "#0B0B0D", 0.84) }
}

/* ------------------------------------------------------------------ */
/*  Images                                                              */
/* ------------------------------------------------------------------ */

function toImage(v: ImageValue): { src: string; srcSet?: string; alt?: string } | null {
    if (!v) return null
    if (typeof v === "string") return v ? { src: v } : null
    return v.src ? { src: v.src, srcSet: v.srcSet, alt: v.alt } : null
}

export function hasOwnImages(p: Project) {
    return !!(toImage(p.cover) || toImage(p.gallery1) || toImage(p.gallery2) || toImage(p.gallery3))
}

/** Frames for the case study gallery: your images if you added any, generated art otherwise. */
export function galleryFrames(p: Project): number[] {
    if (!hasOwnImages(p)) return [1, 2, 3]
    return [1, 2, 3].filter((i) => toImage((p as any)[`gallery${i}`]))
}

/* ------------------------------------------------------------------ */
/*  Cover                                                               */
/* ------------------------------------------------------------------ */

export const ART_CSS = `
.el-cover{position:relative;overflow:hidden;width:100%;height:100%}
.el-cover>img,.el-cover>svg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.el-a-spin{animation:el-spin var(--dur,30s) linear infinite;animation-play-state:paused;transform-box:view-box}
.el-a-drift{animation:el-drift var(--dur,3s) ease-in-out infinite;animation-play-state:paused}
.el-a-eq{transform-box:fill-box;transform-origin:50% 50%;animation:el-eq var(--dur,1.1s) ease-in-out infinite;animation-play-state:paused}
.el-art-active .el-a-spin,.el-art-active .el-a-drift,.el-art-active .el-a-eq{animation-play-state:running}
.el-a-draw{stroke-dasharray:1;stroke-dashoffset:0}
.el-art-active .el-a-draw{animation:el-draw 1.3s cubic-bezier(.65,0,.35,1)}
.el-a-shift{transition:transform 1.1s var(--el-ease)}
.el-art-active .el-a-shift{transform:translate(var(--sx,0px),var(--sy,0px))}
@keyframes el-eq{0%,100%{transform:scaleY(1)}50%{transform:scaleY(var(--eq,.35))}}
@keyframes el-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
`

export function Cover({
    project,
    variant = 0,
    active = false,
    sizes,
    eager = false,
    className = "",
    style,
}: {
    project: Project
    /** 0 = cover, 1–3 = gallery frames */
    variant?: number
    active?: boolean
    sizes?: string
    eager?: boolean
    className?: string
    style?: React.CSSProperties
}) {
    const key = variant === 0 ? "cover" : `gallery${variant}`
    const img = toImage((project as any)[key])
    return (
        <div className={`el-cover el-grain ${active ? "el-art-active" : ""} ${className}`} style={{ background: project.color, ...style }}>
            {img ? (
                <img src={img.src} srcSet={img.srcSet} sizes={sizes} alt={img.alt || project.title} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
            ) : (
                <Art project={project} variant={variant} />
            )}
        </div>
    )
}

/* ------------------------------------------------------------------ */
/*  Generated art — each motif draws in a 400×400 box, cropped to fit  */
/* ------------------------------------------------------------------ */

const mono = { fontFamily: "var(--el-mono)", letterSpacing: "0.08em" } as React.CSSProperties

function Label({ x, y, children, fill, anchor = "start", size = 11, opacity = 0.85 }: { x: number; y: number; children: string; fill: string; anchor?: "start" | "end" | "middle"; size?: number; opacity?: number }) {
    return (
        <text x={x} y={y} fill={fill} fillOpacity={opacity} fontSize={size} textAnchor={anchor} style={mono}>
            {children}
        </text>
    )
}

type MotifFn = (c: ArtColors, id: string) => React.ReactNode

const MOTIFS: Record<Motif, MotifFn> = {
    orbit: (c, id) => (
        <>
            <defs>
                <radialGradient id={`${id}-sun`} cx="45%" cy="40%" r="65%">
                    <stop offset="0" stopColor={mix(c.fg, "#FFFFFF", 0.4)} />
                    <stop offset="1" stopColor={c.fg} />
                </radialGradient>
            </defs>
            <rect width="400" height="400" fill={c.bg} />
            <g fill="none" stroke={c.fg} strokeOpacity="0.28">
                {[108, 150, 192, 236].map((r) => (
                    <circle key={r} cx="250" cy="235" r={r} />
                ))}
            </g>
            <g className="el-a-spin" style={{ transformOrigin: "250px 235px", ["--dur" as any]: "26s" }}>
                <g transform="rotate(-130 250 235)">
                    <circle cx="400" cy="235" r="9" fill={c.light} />
                </g>
            </g>
            <circle cx="250" cy="235" r="62" fill={`url(#${id}-sun)`} />
            <rect y="268" width="400" height="132" fill={c.dark} />
            <g fill={c.fg}>
                {[
                    [282, 96],
                    [293, 66],
                    [303, 42],
                    [312, 22],
                ].map(([y, w]) => (
                    <rect key={y} x={250 - w / 2} y={y} width={w} height="2" fillOpacity="0.55" />
                ))}
            </g>
            <Label x={56} y={128} fill={c.fg}>
                FM 94.1
            </Label>
            <Label x={56} y={146} fill={c.fg} opacity={0.55}>
                00:00—06:00
            </Label>
        </>
    ),

    slices: (c) => {
        const r = 118
        const cy = 192
        const n = 13
        const step = (r * 2) / n
        return (
            <>
                <rect width="400" height="400" fill={c.bg} />
                {Array.from({ length: n }, (_, i) => {
                    const top = cy - r + i * step
                    const mid = top + step / 2
                    const half = Math.sqrt(Math.max(r * r - (mid - cy) * (mid - cy), 0))
                    const dx = Math.sin(i * 1.15) * 22
                    const fill = i < n / 2 ? mix(c.fg, "#FFFFFF", 0.35 - i * 0.05) : mix(c.fg, c.bg, (i - n / 2) * 0.08)
                    return (
                        <rect
                            key={i}
                            className="el-a-drift"
                            style={{ ["--drift" as any]: `${i % 2 ? 14 : -14}px`, ["--dur" as any]: `${2.2 + (i % 4) * 0.4}s`, animationDelay: `${-i * 0.23}s` }}
                            x={200 - half + dx}
                            y={top + 1.5}
                            width={half * 2}
                            height={step - 3}
                            rx={(step - 3) / 2}
                            fill={fill}
                        />
                    )
                })}
                <Label x={56} y={336} fill={c.fg}>
                    SOFT MACHINES
                </Label>
                <Label x={344} y={336} fill={c.fg} anchor="end" opacity={0.55}>
                    TC 01:12:08
                </Label>
            </>
        )
    },

    vessels: (c) => {
        const cream = mix(c.bg, "#FFFFFF", 0.62)
        const clay = mix(c.bg, "#1B1712", 0.78)
        return (
            <>
                <rect width="400" height="400" fill={c.bg} />
                <polygon className="el-a-drift" style={{ ["--drift" as any]: "18px", ["--dur" as any]: "6s" }} points="-40,60 120,-20 420,250 420,330" fill="#FFFFFF" fillOpacity="0.14" />
                <rect y="300" width="400" height="100" fill={mix(c.bg, clay, 0.1)} />
                <rect y="299" width="400" height="1.5" fill={clay} fillOpacity="0.3" />
                <g fill={clay} fillOpacity="0.2">
                    <ellipse cx="128" cy="301" rx="44" ry="5" />
                    <ellipse cx="222" cy="301" rx="50" ry="5" />
                    <ellipse cx="310" cy="301" rx="44" ry="5" />
                </g>
                <path d="M92 300V176A36 36 0 0 1 164 176V300Z" fill={c.fg} />
                <circle cx="222" cy="256" r="44" fill={cream} />
                <rect x="206" y="200" width="32" height="24" rx="3" fill={cream} />
                <rect x="200" y="194" width="44" height="8" rx="4" fill={mix(cream, clay, 0.12)} />
                <path d="M270 262H350A40 38 0 0 1 270 262Z" fill={clay} />
                <Label x={56} y={110} fill={clay}>
                    BATCH 14 / 40
                </Label>
                <Label x={344} y={110} fill={clay} anchor="end" opacity={0.55}>
                    NORTH LIGHT
                </Label>
            </>
        )
    },

    spread: (c, id) => {
        const ink = c.bg
        const mustard = "#D9A441"
        return (
            <>
                <defs>
                    <linearGradient id={`${id}-gutter`} x1="0" x2="1">
                        <stop offset="0" stopColor="#000" stopOpacity="0" />
                        <stop offset="0.5" stopColor="#000" stopOpacity="0.2" />
                        <stop offset="1" stopColor="#000" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <rect width="400" height="400" fill={c.bg} />
                <g className="el-a-shift" style={{ ["--sy" as any]: "-8px" }}>
                    <g transform="rotate(-5 200 200)">
                        <rect x="78" y="124" width="260" height="172" fill="#000" fillOpacity="0.3" />
                        <rect x="70" y="114" width="130" height="172" fill={c.fg} />
                        <rect x="200" y="114" width="130" height="172" fill={mix(c.fg, "#FFFFFF", 0.25)} />
                        <rect x="180" y="114" width="40" height="172" fill={`url(#${id}-gutter)`} />
                        <text x="84" y="176" fill={ink} fontSize="54" fontWeight="800" style={{ fontFamily: "var(--el-sans)", fontVariationSettings: '"wdth" 70' }}>
                            03
                        </text>
                        {Array.from({ length: 8 }, (_, i) => (
                            <rect key={i} x="84" y={196 + i * 9} width={i === 7 ? 58 : 100} height="3" fill={ink} fillOpacity="0.32" />
                        ))}
                        <rect x="214" y="128" width="102" height="72" fill={mustard} />
                        <ellipse cx="265" cy="164" rx="12" ry="28" transform="rotate(35 265 164)" fill={ink} />
                        <rect x="264" y="164" width="1.5" height="30" transform="rotate(35 265 164)" fill={ink} />
                        {Array.from({ length: 8 }, (_, i) => (
                            <g key={i} fill={ink} fillOpacity="0.32">
                                <rect x="214" y={212 + i * 8.5} width="46" height="3" />
                                <rect x="268" y={212 + i * 8.5} width={i === 7 ? 24 : 48} height="3" />
                            </g>
                        ))}
                    </g>
                </g>
            </>
        )
    },

    contact: (c) => {
        const red = "#E0452B"
        const film = c.fg
        return (
            <>
                <rect width="400" height="400" fill={c.bg} />
                {[0, 1, 2].map((row) => {
                    const y0 = 104 + row * 72
                    return (
                        <g key={row}>
                            <rect x="36" y={y0} width="328" height="64" fill={film} />
                            {Array.from({ length: 32 }, (_, k) => (
                                <g key={k} fill={c.bg} fillOpacity="0.5">
                                    <rect x={42 + k * 10} y={y0 + 3} width="5" height="3" rx="1" />
                                    <rect x={42 + k * 10} y={y0 + 58} width="5" height="3" rx="1" />
                                </g>
                            ))}
                            {[0, 1, 2, 3].map((col) => {
                                const x = 48 + col * 78
                                const t = 0.22 + (((row * 3 + col * 5) % 7) / 7) * 0.5
                                return (
                                    <g key={col}>
                                        <rect x={x} y={y0 + 10} width="72" height="44" fill={mix(c.light, "#2A2A2A", t)} />
                                        <circle cx={x + 20 + ((row + col * 2) % 4) * 9} cy={y0 + 32} r={6 + ((row * 2 + col) % 3) * 4} fill={mix(c.light, "#2A2A2A", t + 0.28)} />
                                    </g>
                                )
                            })}
                        </g>
                    )
                })}
                <ellipse className="el-a-draw" pathLength={1} cx="240" cy="208" rx="50" ry="33" transform="rotate(-6 240 208)" fill="none" stroke={red} strokeWidth="3.4" strokeLinecap="round" />
                <Label x={36} y={94} fill={film} opacity={0.7}>
                    ROLL 07 · LISBON
                </Label>
            </>
        )
    },

    parallel: (c) => {
        const ink = mix(c.fg, "#1A0E0B", 0.7)
        return (
            <>
                <rect width="400" height="400" fill={c.bg} />
                <g className="el-a-shift" style={{ ["--sx" as any]: "-10px" }}>
                    <polygon points="70,420 150,420 300,-20 220,-20" fill={c.fg} />
                </g>
                <g className="el-a-shift" style={{ ["--sx" as any]: "10px" }}>
                    <polygon points="186,420 266,420 416,-20 336,-20" fill={ink} />
                </g>
                <Label x={56} y={110} fill={ink}>
                    PARALLEL
                </Label>
                <Label x={56} y={128} fill={ink} opacity={0.6}>
                    12.03—30.04
                </Label>
            </>
        )
    },

    wave: (c, id) => {
        const violet = "#7B5CFF"
        const bars = 42
        return (
            <>
                <defs>
                    <radialGradient id={`${id}-a`}>
                        <stop offset="0" stopColor={c.fg} stopOpacity="0.85" />
                        <stop offset="1" stopColor={c.fg} stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id={`${id}-b`}>
                        <stop offset="0" stopColor={violet} stopOpacity="0.8" />
                        <stop offset="1" stopColor={violet} stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect width="400" height="400" fill={c.bg} />
                <circle cx="130" cy="150" r="190" fill={`url(#${id}-a)`} />
                <circle cx="300" cy="270" r="200" fill={`url(#${id}-b)`} />
                {Array.from({ length: bars }, (_, i) => {
                    const env = Math.sin((i / (bars - 1)) * Math.PI)
                    const h = 10 + 120 * env * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.37) + 0.25)
                    return (
                        <rect
                            key={i}
                            className="el-a-eq"
                            style={{ ["--dur" as any]: `${0.7 + (i % 5) * 0.13}s`, animationDelay: `${-i * 0.07}s` }}
                            x={58 + i * 6.9}
                            y={200 - h / 2}
                            width="3.2"
                            height={h}
                            rx="1.6"
                            fill="#FFFFFF"
                            fillOpacity="0.92"
                        />
                    )
                })}
                <Label x={56} y={110} fill="#FFFFFF">
                    WAVELENGTH
                </Label>
                <Label x={344} y={110} fill="#FFFFFF" anchor="end" opacity={0.6}>
                    26—28.06
                </Label>
                <Label x={56} y={300} fill="#FFFFFF" opacity={0.6}>
                    SET 118 / 212
                </Label>
            </>
        )
    },

    seal: (c, id) => {
        const cream = mix(c.bg, "#FFFDF6", 0.75)
        return (
            <>
                <defs>
                    <path id={`${id}-ring`} d="M200 102a98 98 0 1 1 0 196a98 98 0 1 1 0-196" />
                </defs>
                <rect width="400" height="400" fill={c.bg} />
                <circle cx="206" cy="208" r="124" fill="#000" fillOpacity="0.1" />
                <circle cx="200" cy="200" r="124" fill={cream} />
                <g className="el-a-spin" style={{ transformOrigin: "200px 200px", ["--dur" as any]: "22s" }}>
                    <circle cx="200" cy="200" r="114" fill="none" stroke={c.fg} strokeWidth="1.5" />
                    <circle cx="200" cy="200" r="82" fill="none" stroke={c.fg} strokeWidth="1.5" />
                    <text fill={c.fg} fontSize="12.5" style={mono}>
                        <textPath href={`#${id}-ring`} textLength="600" lengthAdjust="spacing">
                            ODA COFFEE ROASTERS · GUJI, ETHIOPIA · 2100 M · LOT 07 ·
                        </textPath>
                    </text>
                </g>
                <g transform="rotate(28 200 196)">
                    <ellipse cx="200" cy="196" rx="24" ry="34" fill={c.fg} />
                    <path d="M197 166C211 184 189 208 203 226" stroke={cream} strokeWidth="3.5" fill="none" strokeLinecap="round" />
                </g>
                <Label x={200} y={256} fill={c.fg} anchor="middle" size={10}>
                    ROASTED 14.09
                </Label>
            </>
        )
    },
}

/** Mounts the motif inside a nested SVG so it can be framed, cropped or zoomed. */
function Frame({ x, y, w, h, viewBox = "0 0 400 400", children }: { x: number; y: number; w: number; h: number; viewBox?: string; children: React.ReactNode }) {
    return (
        <svg x={x} y={y} width={w} height={h} viewBox={viewBox} preserveAspectRatio="xMidYMid slice" overflow="hidden">
            {children}
        </svg>
    )
}

export function Art({ project, variant = 0 }: { project: Project; variant?: number }) {
    const id = "el" + useId().replace(/[^a-zA-Z0-9_-]/g, "")
    const c = artColors(project)
    const motif = (MOTIFS[project.motif] ?? MOTIFS.orbit)(c, id)
    let content: React.ReactNode = motif

    if (variant === 1) {
        // Poster on a wall
        const wall = luminance(c.bg) < 0.25 ? mix(c.bg, "#E9E7E2", 0.8) : mix(c.fg, c.bg, 0.12)
        const text = onColor(wall)
        content = (
            <>
                <defs>
                    <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="9" />
                    </filter>
                </defs>
                <rect width="400" height="400" fill={wall} />
                <rect x="132" y="108" width="144" height="192" fill="#000" fillOpacity="0.28" filter={`url(#${id}-shadow)`} />
                <Frame x={128} y={96} w={144} h={192}>
                    {motif}
                </Frame>
                <Label x={128} y={308} fill={text} opacity={0.6} size={9}>
                    {project.title.toUpperCase()}
                </Label>
                <Label x={272} y={308} fill={text} opacity={0.6} size={9} anchor="end">
                    {project.year}
                </Label>
            </>
        )
    } else if (variant === 2) {
        // Detail crop
        content = (
            <Frame x={0} y={0} w={400} h={400} viewBox="118 108 172 172">
                {motif}
            </Frame>
        )
    } else if (variant === 3) {
        // Colour swatches, as in a brand guideline
        const third = luminance(c.bg) < 0.25 ? c.light : c.dark
        const swatches = [
            ["Primary", c.bg],
            ["Secondary", c.fg],
            [luminance(c.bg) < 0.25 ? "Paper" : "Ink", third],
        ] as const
        content = (
            <>
                {swatches.map(([name, color], i) => {
                    const x = (400 / 3) * i
                    const pad = i === 0 ? 52 : 14
                    const t = onColor(color)
                    const [r, g, b] = parseColor(color)
                    return (
                        <g key={name}>
                            <rect x={x} width={400 / 3 + 1} height="400" fill={color} />
                            <Label x={x + pad} y={120} fill={t} size={10}>
                                {`0${i + 1}`}
                            </Label>
                            <Label x={x + pad} y={262} fill={t} size={10}>
                                {name.toUpperCase()}
                            </Label>
                            <Label x={x + pad} y={280} fill={t} size={10} opacity={0.65}>
                                {toHex([r, g, b])}
                            </Label>
                            <Label x={x + pad} y={296} fill={t} size={10} opacity={0.65}>
                                {`${r} ${g} ${b}`}
                            </Label>
                        </g>
                    )
                })}
            </>
        )
    }

    return (
        <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${project.title} artwork`}>
            {content}
        </svg>
    )
}
