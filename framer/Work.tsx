// Elastic — Work
// Filterable projects in two views: an editorial Grid and a type-led Index
// with a cursor-following preview. Selecting a project expands its cover into
// a full case study (Esc closes, ← → move between projects).

import * as React from "react"
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, MotionConfig, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion"
import {
    ThemeStyles,
    Arrow,
    Cross,
    FlexText,
    RollText,
    UnfoldTitle,
    EASE_IN_OUT,
    EASE_OUT,
    isStaticTarget,
    itemReveal,
    listReveal,
    revealProps,
    scrollToAnchor,
    trackFill,
    useFinePointer,
    useIsoLayoutEffect,
    useMagnetic,
} from "./Theme.tsx"
import { ART_CSS, Cover, MOTIF_OPTIONS, MOTIF_TITLES, Project, galleryFrames, onOpenRequest, publishProjects, sampleProjects } from "./Covers.tsx"

const CSS = `
.el-work{position:relative;background:var(--el-bg);padding:clamp(88px,11vw,168px) var(--el-gutter) clamp(88px,10vw,160px);transition:background-color .9s var(--el-ease)}
.el-work__head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:20px 48px;align-items:end;margin-bottom:clamp(28px,4vw,56px)}
.el-work__title{font-size:clamp(52px,10vw,168px);line-height:.88;letter-spacing:-.025em;white-space:nowrap}
.el-work__title sup{font-family:var(--el-mono);font-size:max(12px,.1em);letter-spacing:.04em;vertical-align:top;position:relative;top:.5em;margin-left:.25em;font-variation-settings:normal;font-weight:400;color:var(--el-muted)}
.el-work__intro{color:var(--el-muted);max-width:32ch;text-wrap:pretty}
.el-work__bar{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:clamp(28px,3.4vw,52px)}
.el-work__filters{display:flex;gap:8px;min-width:0;margin:-4px;padding:4px}
.el-chip{position:relative;display:inline-flex;align-items:baseline;gap:7px;padding:9px 16px;border-radius:999px;border:1px solid var(--el-line);white-space:nowrap;font-size:14px;line-height:1.2;transition:color .35s var(--el-ease),border-color .35s}
@media (hover: hover){.el-chip:hover{border-color:var(--el-ink)}}
.el-chip[aria-pressed="true"]{color:var(--el-bg);border-color:var(--el-ink)}
.el-chip__pill{position:absolute;inset:-1px;border-radius:inherit;background:var(--el-ink)}
.el-chip>span:not(.el-chip__pill){position:relative}
.el-chip__count{font-family:var(--el-mono);font-size:10px;opacity:.6}
.el-work__views{display:inline-flex;padding:4px;border-radius:999px;border:1px solid var(--el-line);flex:none}
.el-view{position:relative;display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;font-size:14px;line-height:1.2;transition:color .35s var(--el-ease)}
.el-view[aria-pressed="true"]{color:var(--el-bg)}
.el-view>span:not(.el-chip__pill),.el-view>svg{position:relative}

.el-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(48px,6vw,104px) clamp(16px,2vw,28px);align-items:start}
.el-card{min-width:0}
.el-card__btn{display:flex;flex-direction:column;gap:16px;width:100%;text-align:left}
.el-card__media{position:relative;width:100%;border-radius:3px;overflow:hidden;background:var(--el-surface)}
.el-card__reveal{position:absolute;inset:0}
.el-card__img{position:absolute;inset:0;transition:transform 1.3s var(--el-ease)}
.el-card__btn:hover .el-card__img,.el-card__btn:focus-visible .el-card__img{transform:scale(1.04)}
.el-card__tag{position:absolute;left:14px;bottom:14px;z-index:3;display:inline-flex;gap:8px;align-items:center;padding:9px 14px;border-radius:999px;background:var(--el-bg);color:var(--el-ink);transform:translateY(calc(100% + 24px));transition:transform .7s var(--el-ease)}
.el-card__btn:hover .el-card__tag,.el-card__btn:focus-visible .el-card__tag{transform:none}
.el-card__meta{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:16px;align-items:baseline}
.el-card__title{font-size:clamp(20px,1.75vw,28px);line-height:1.08;letter-spacing:-.01em}

.el-index{position:relative}
.el-index__head,.el-row__btn{display:grid;grid-template-columns:52px minmax(0,1fr) minmax(0,150px) minmax(0,190px) 56px 18px;gap:24px;align-items:center}
.el-index__head{padding-bottom:12px}
.el-row{position:relative}
.el-row__line{position:absolute;left:0;right:0;top:0;height:1px;background:var(--el-line);transform-origin:0 50%}
.el-index>ul>.el-row:last-child::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--el-line)}
.el-row{transition:opacity .5s var(--el-ease)}
.el-row__btn{width:100%;text-align:left;padding:clamp(16px,1.7vw,24px) 0}
.el-index[data-hovering="true"] .el-row:not([data-active="true"]){opacity:.3}
.el-row__num{color:var(--el-muted);transition:color .4s}
.el-row__btn[data-active="true"] .el-row__num{color:var(--el-accent)}
.el-row__title{font-size:clamp(30px,4vw,60px);line-height:1;letter-spacing:-.015em;min-width:0}
.el-row__sub{display:none}
.el-row__arrow{opacity:0;transform:translateX(-10px);transition:opacity .5s var(--el-ease),transform .5s var(--el-ease)}
.el-row__btn[data-active="true"] .el-row__arrow{opacity:1;transform:none}
.el-row__thumb{display:none}
.el-preview{position:absolute;top:0;left:0;width:clamp(240px,24vw,340px);aspect-ratio:4/3;pointer-events:none;z-index:4}
.el-preview__clip{position:absolute;inset:0;overflow:hidden;border-radius:3px;box-shadow:0 30px 60px -30px rgba(0,0,0,.45)}
.el-preview__slide{position:absolute;inset:0}

@media (max-width: 1199px){
  .el-card{grid-column:span 6!important}
  .el-card__media{aspect-ratio:4/5!important}
  .el-index__head,.el-row__btn{grid-template-columns:44px minmax(0,1fr) minmax(0,140px) 52px 18px}
  .el-row__client{display:none}
}
@media (max-width: 809px){
  .el-work__head{grid-template-columns:1fr}
  .el-work__title{white-space:normal}
  .el-work__bar{flex-direction:column;align-items:stretch}
  .el-work__filters{margin:-4px calc(-1 * var(--el-gutter));padding:4px var(--el-gutter)}
  .el-work__views{align-self:flex-start}
  .el-card{grid-column:1/-1!important}
  .el-index__head{display:none}
  .el-row__btn{grid-template-columns:76px minmax(0,1fr) auto;gap:16px}
  .el-row__num,.el-row__client,.el-row__cat,.el-row__arrow{display:none}
  .el-row__thumb{display:block;position:relative;width:76px;aspect-ratio:1;border-radius:2px;overflow:hidden}
  .el-row__title{font-size:clamp(24px,7vw,34px)}
  .el-row__sub{display:block;margin-top:6px}
  .el-index[data-hovering="true"] .el-row:not([data-active="true"]){opacity:1}
}

.el-case{position:fixed;inset:0;z-index:1000;overflow-y:auto;overscroll-behavior:contain;background:var(--el-bg);color:var(--el-ink)}
.el-case__bar{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;padding:calc(12px + env(safe-area-inset-top,0px)) var(--el-gutter) 12px;background:color-mix(in srgb,var(--el-bg) 82%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.el-case__close{justify-self:start;display:inline-flex;gap:10px;align-items:center;padding:8px 0}
.el-case__pager{justify-self:end;display:flex;gap:8px}
.el-round{width:42px;height:42px;border-radius:50%;border:1px solid var(--el-line);display:grid;place-items:center}
.el-case__close .el-round svg{transition:transform .6s var(--el-ease)}
.el-case__close:focus-visible .el-round svg{transform:rotate(90deg)}
@media (hover: hover){.el-case__close:hover .el-round svg{transform:rotate(90deg)}}
.el-case__hero{position:relative;margin:0 var(--el-gutter);height:clamp(300px,68vh,860px);border-radius:3px;overflow:hidden;background:var(--el-surface)}
.el-case__hero>div{position:absolute;inset:0}
.el-case__head{padding:clamp(40px,6vw,96px) var(--el-gutter) 0;display:grid;gap:clamp(22px,2.6vw,36px)}
.el-case__eyebrow{display:flex;gap:18px;color:var(--el-muted)}
.el-case__title{font-size:clamp(48px,9.2vw,160px);line-height:.94;letter-spacing:-.025em;text-wrap:balance}
.el-case__word{display:inline-block;overflow:hidden;white-space:nowrap;vertical-align:top;padding-bottom:.12em;margin-bottom:-.12em}
.el-case__char{display:inline-block;transform:translateY(108%);font-variation-settings:"wdth" 62,"wght" 460}
.el-case__title[data-in="true"] .el-case__char{animation:el-char-in 1.2s var(--el-ease) var(--d,0s) both}
@keyframes el-char-in{from{transform:translateY(108%);font-variation-settings:"wdth" 62,"wght" 460}to{transform:none;font-variation-settings:"wdth" 100,"wght" 560}}
.el-case__summary{font-size:clamp(22px,2.4vw,36px);line-height:1.18;letter-spacing:-.012em;max-width:30ch;text-wrap:balance}
.el-case__body{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(32px,6vw,120px);padding:clamp(40px,5vw,80px) var(--el-gutter)}
.el-case__facts{display:grid;grid-template-columns:auto minmax(0,1fr);gap:14px 28px;align-content:start;border-top:1px solid var(--el-line);padding-top:18px;font-size:16px;line-height:1.45}
.el-case__facts dt{padding-top:3px}
.el-case__text{display:grid;gap:28px;align-content:start;border-top:1px solid var(--el-line);padding-top:18px;font-size:clamp(17px,1.3vw,20px);line-height:1.62;max-width:62ch}
.el-case__link{display:inline-flex;gap:10px;align-items:center;justify-self:start;padding:12px 18px;border-radius:999px;border:1px solid var(--el-ink);font-size:15px}
.el-case__gallery{display:grid;grid-template-columns:1fr 1fr;gap:clamp(12px,1.6vw,24px);padding:0 var(--el-gutter)}
.el-case__frame{position:relative;overflow:hidden;border-radius:3px;aspect-ratio:4/5;background:var(--el-surface)}
.el-case__frame--wide{grid-column:1/-1;aspect-ratio:16/9}
.el-case__frame>div{position:absolute;inset:0}
.el-case__frame>.el-case__para{inset:-7% 0}
.el-case__cta{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;margin:clamp(56px,8vw,120px) var(--el-gutter) 0;padding:22px 0;border-top:1px solid var(--el-line);border-bottom:1px solid var(--el-line);font-size:clamp(18px,1.6vw,24px)}
.el-case__cta a{display:inline-flex;gap:10px;align-items:center}
.el-case__next{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,34%);gap:clamp(20px,4vw,64px);align-items:end;width:100%;text-align:left;padding:clamp(40px,6vw,96px) var(--el-gutter) calc(clamp(40px,6vw,96px) + env(safe-area-inset-bottom,0px))}
.el-case__next-text{display:grid;gap:14px;min-width:0}
.el-case__next-title{font-size:clamp(44px,8vw,136px);line-height:.92;letter-spacing:-.025em}
.el-case__next-thumb{position:relative;display:block;aspect-ratio:4/3;border-radius:3px;overflow:hidden}
.el-case__next-thumb>div{position:absolute;inset:0;transition:transform 1.2s var(--el-ease)}
.el-case__next:hover .el-case__next-thumb>div{transform:scale(1.05)}
.el-case__flight{position:fixed;z-index:1001;overflow:hidden;border-radius:3px;pointer-events:none}
@media (max-width: 809px){
  .el-case__body{grid-template-columns:1fr}
  .el-case__gallery{grid-template-columns:1fr}
  .el-case__frame--wide{aspect-ratio:4/3}
  .el-case__count{display:none}
  .el-case__bar{grid-template-columns:1fr auto}
  .el-case__next{grid-template-columns:1fr}
  .el-case__hero{height:clamp(280px,56vh,560px)}
}
`

/* Helpers ------------------------------------------------------------ */

type Rect = { top: number; left: number; width: number; height: number }
const toRect = (r: DOMRect | Rect): Rect => ({ top: r.top, left: r.left, width: r.width, height: r.height })
const pad = (n: number) => String(n).padStart(2, "0")

function normalize(p: Partial<Project> | undefined): Project {
    return {
        title: p?.title || "Untitled",
        category: p?.category || "Work",
        year: p?.year || "",
        client: p?.client || "",
        role: p?.role || "",
        services: p?.services || "",
        summary: p?.summary || "",
        description: p?.description || "",
        color: p?.color || "#17214D",
        tone: p?.tone || "#FF9E4F",
        motif: p?.motif || "orbit",
        link: p?.link || "",
        cover: p?.cover,
        gallery1: p?.gallery1,
        gallery2: p?.gallery2,
        gallery3: p?.gallery3,
    }
}

/** Editorial rhythm: wide/narrow pairs that swap sides each row; three-up or full-width for odd counts. */
function gridLayout(n: number) {
    const out: { span: number; ratio: string }[] = []
    let left = n
    let row = 0
    while (left > 0) {
        if (left === 1) {
            out.push({ span: 12, ratio: "21 / 9" })
            left -= 1
        } else if (left === 3) {
            for (let k = 0; k < 3; k++) out.push({ span: 4, ratio: "3 / 4" })
            left -= 3
        } else {
            const wide = { span: 7, ratio: "4 / 3" }
            const tall = { span: 5, ratio: "4 / 5" }
            out.push(...(row % 2 === 0 ? [wide, tall] : [tall, wide]))
            left -= 2
        }
        row++
    }
    return out
}

type Item = { project: Project; index: number }

/* Grid --------------------------------------------------------------- */

function GridView({ items, still, hovered, setHovered, onOpen, cursorLabel }: { items: Item[]; still: boolean; hovered: number | null; setHovered: (i: number | null) => void; onOpen: (i: number, el: HTMLElement | null) => void; cursorLabel: string }) {
    const layout = gridLayout(items.length)
    return (
        <ul className="el-grid">
            {items.map(({ project, index }, k) => (
                <GridCard
                    key={index}
                    project={project}
                    index={index}
                    number={index + 1}
                    span={layout[k].span}
                    ratio={layout[k].ratio}
                    delay={layout[k].span === 4 ? (k % 3) * 0.1 : (k % 2) * 0.12}
                    still={still}
                    active={hovered === index}
                    setHovered={setHovered}
                    onOpen={onOpen}
                    cursorLabel={cursorLabel}
                />
            ))}
        </ul>
    )
}

function GridCard({ project, index, number, span, ratio, delay, still, active, setHovered, onOpen, cursorLabel }: { project: Project; index: number; number: number; span: number; ratio: string; delay: number; still: boolean; active: boolean; setHovered: (i: number | null) => void; onOpen: (i: number, el: HTMLElement | null) => void; cursorLabel: string }) {
    const mediaRef = useRef<HTMLDivElement>(null)
    const view = { once: true, margin: "0px 0px -12% 0px" }
    return (
        <li className="el-card" style={{ gridColumn: `span ${span}` }}>
            <button
                className="el-card__btn el-hover"
                data-cursor={cursorLabel}
                onClick={() => onOpen(index, mediaRef.current)}
                onPointerEnter={() => setHovered(index)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                aria-label={`${project.title}, ${project.category} ${project.year}. Open case study`}
            >
                <motion.div
                    ref={mediaRef}
                    data-el-cover={index}
                    className="el-card__media"
                    style={{ aspectRatio: ratio }}
                    initial={still ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
                    whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
                    viewport={view}
                    transition={{ duration: 1.15, ease: EASE_IN_OUT, delay }}
                >
                    <motion.div className="el-card__reveal" initial={still ? false : { scale: 1.3 }} whileInView={{ scale: 1 }} viewport={view} transition={{ duration: 1.6, ease: EASE_OUT, delay }}>
                        <div className="el-card__img">
                            <Cover project={project} active={active} sizes={`(max-width: 809px) 100vw, (max-width: 1199px) 50vw, ${Math.round((span / 12) * 100)}vw`} />
                        </div>
                    </motion.div>
                    <span className="el-card__tag el-label" aria-hidden="true">
                        View case study <Arrow size={12} />
                    </span>
                </motion.div>
                <motion.div
                    className="el-card__meta"
                    initial={still ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={view}
                    transition={{ duration: 0.9, ease: EASE_OUT, delay: delay + 0.35 }}
                >
                    <span className="el-label el-muted">{pad(number)}</span>
                    <h3 className="el-card__title">
                        <FlexText wrap rest={[96, 520]} hover={[116, 640]}>
                            {project.title}
                        </FlexText>
                    </h3>
                    <span className="el-label el-muted">
                        {project.category} · {project.year}
                    </span>
                </motion.div>
            </button>
        </li>
    )
}

/* Index -------------------------------------------------------------- */

function IndexView({ items, projects, still, hovered, setHovered, onOpen, cursorLabel, previewRef }: { items: Item[]; projects: Project[]; still: boolean; hovered: number | null; setHovered: (i: number | null) => void; onOpen: (i: number, el: HTMLElement | null) => void; cursorLabel: string; previewRef: React.RefObject<HTMLDivElement> }) {
    const fine = useFinePointer()
    const wrapRef = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 })
    const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 })
    const vx = useVelocity(sx)
    const tilt = useSpring(useTransform(vx, [-1800, 0, 1800], [-9, 0, 9], { clamp: true }), { stiffness: 220, damping: 28 })
    const [inside, setInside] = useState(false)
    const showing = fine && inside && hovered !== null && items.some((it) => it.index === hovered)
    const lastHovered = useRef<number | null>(null)
    const [dir, setDir] = useState(1)

    useEffect(() => {
        if (hovered === null) return
        if (lastHovered.current !== null) setDir(hovered > lastHovered.current ? 1 : -1)
        lastHovered.current = hovered
    }, [hovered])

    const track = (e: React.PointerEvent) => {
        const wrap = wrapRef.current
        const preview = previewRef.current
        if (!wrap || !preview) return
        const r = wrap.getBoundingClientRect()
        const pw = preview.offsetWidth
        const ph = preview.offsetHeight
        const px = e.clientX - r.left
        const py = e.clientY - r.top
        // Float above and to the right of the pointer so the hovered title stays readable.
        const nx = Math.min(Math.max(px + 24, 0), r.width - pw)
        const ny = py - ph - 44
        x.set(nx)
        y.set(ny)
        if (!showing) {
            sx.jump(nx)
            sy.jump(ny)
        }
    }

    return (
        <div
            ref={wrapRef}
            className="el-index"
            data-hovering={fine && hovered !== null}
            onPointerMove={fine ? track : undefined}
            onPointerEnter={() => setInside(true)}
            onPointerLeave={() => {
                setInside(false)
                setHovered(null)
            }}
        >
            <div className="el-index__head el-label el-muted" aria-hidden="true">
                <span>No.</span>
                <span>Project</span>
                <span className="el-row__cat">Discipline</span>
                <span className="el-row__client">Client</span>
                <span>Year</span>
                <span />
            </div>
            <ul>
                {items.map(({ project, index }, k) => (
                    <IndexRow
                        key={index}
                        project={project}
                        index={index}
                        k={k}
                        still={still}
                        active={hovered === index}
                        setHovered={setHovered}
                        onOpen={(i, thumb) => onOpen(i, thumb ?? (showing ? previewRef.current : null))}
                        cursorLabel={cursorLabel}
                    />
                ))}
            </ul>
            {fine && (
                <motion.div
                    ref={previewRef}
                    className="el-preview"
                    aria-hidden="true"
                    style={{ x: sx, y: sy, rotate: tilt }}
                    initial={false}
                    animate={{ opacity: showing ? 1 : 0, scale: showing ? 1 : 0.55 }}
                    transition={{ duration: 0.5, ease: EASE_OUT }}
                >
                    <div className="el-preview__clip">
                        <AnimatePresence initial={false} custom={dir}>
                            {hovered !== null && projects[hovered] && (
                                <motion.div
                                    key={hovered}
                                    className="el-preview__slide"
                                    custom={dir}
                                    variants={{
                                        enter: (d: number) => ({ y: d > 0 ? "100%" : "-100%" }),
                                        center: { y: "0%" },
                                        exit: (d: number) => ({ y: d > 0 ? "-100%" : "100%" }),
                                    }}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.6, ease: EASE_OUT }}
                                >
                                    <Cover project={projects[hovered]} active eager sizes="340px" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

function IndexRow({ project, index, k, still, active, setHovered, onOpen, cursorLabel }: { project: Project; index: number; k: number; still: boolean; active: boolean; setHovered: (i: number | null) => void; onOpen: (i: number, el: HTMLElement | null) => void; cursorLabel: string }) {
    const thumbRef = useRef<HTMLSpanElement>(null)
    const view = { once: true, margin: "0px 0px -8% 0px" }
    return (
        <li className="el-row" data-active={active}>
            <motion.span className="el-row__line" initial={still ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={view} transition={{ duration: 1.2, ease: EASE_IN_OUT, delay: k * 0.05 }} />
            <motion.button
                className="el-row__btn el-hover"
                data-active={active}
                data-cursor={cursorLabel}
                initial={still ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={view}
                transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.1 + k * 0.05 }}
                onPointerEnter={() => setHovered(index)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                onClick={() => {
                    const thumb = thumbRef.current
                    onOpen(index, thumb && thumb.offsetWidth ? thumb : null)
                }}
                aria-label={`${project.title}, ${project.category} ${project.year}. Open case study`}
            >
                <span className="el-row__num el-label">{pad(index + 1)}</span>
                <span className="el-row__thumb" ref={thumbRef} data-el-cover={index}>
                    <Cover project={project} sizes="76px" />
                </span>
                <span className="el-row__title">
                    <FlexText wrap rest={[78, 380]} hover={[108, 620]}>
                        {project.title}
                    </FlexText>
                    <span className="el-row__sub el-label el-muted">
                        {project.category} · {project.client}
                    </span>
                </span>
                <span className="el-row__cat">{project.category}</span>
                <span className="el-row__client el-muted">{project.client}</span>
                <span className="el-label">{project.year}</span>
                <span className="el-row__arrow">
                    <Arrow size={16} />
                </span>
            </motion.button>
        </li>
    )
}

/* Case study --------------------------------------------------------- */

type Flight = { key: number; project: Project; from: Rect; to: Rect | null; back?: boolean }

/** Round arrow button: leans toward the pointer, fills from where it's entered. */
function PagerButton({ dir, onClick, label }: { dir: "w" | "e"; onClick: () => void; label: string }) {
    const magnet = useMagnetic<HTMLButtonElement>(0.35)
    return (
        <motion.button
            ref={magnet.ref}
            className="el-round el-fill el-hover el-press"
            style={{ x: magnet.x, y: magnet.y }}
            onClick={onClick}
            onPointerMove={magnet.onPointerMove}
            onPointerEnter={trackFill}
            onPointerLeave={(e) => {
                trackFill(e)
                magnet.onPointerLeave()
            }}
            aria-label={label}
        >
            <Arrow dir={dir} swap />
        </motion.button>
    )
}

/** Gallery image that wipes open, then drifts slightly slower than the page as you read. */
function GalleryFrame({ project, variant, wide, reduce, root }: { project: Project; variant: number; wide: boolean; reduce: boolean; root: React.RefObject<HTMLDivElement> }) {
    const ref = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({ container: root, target: ref, offset: ["start end", "end start"] })
    const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"])
    return (
        <motion.figure
            ref={ref}
            className={`el-case__frame ${wide ? "el-case__frame--wide" : ""}`}
            initial={reduce ? false : { clipPath: "inset(12% 8% 12% 8%)", opacity: 0 }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
            viewport={{ root, once: true, amount: 0.1 }}
            transition={{ duration: 1.2, ease: EASE_OUT }}
        >
            <motion.div className="el-case__para" style={reduce ? undefined : { y }}>
                <Cover project={project} variant={variant} active sizes={wide ? "100vw" : "50vw"} />
            </motion.div>
        </motion.figure>
    )
}

function Title({ text, show }: { text: string; show: boolean }) {
    let n = 0
    return (
        <h2 className="el-case__title" data-in={show} id="el-case-title">
            <span className="el-sr">{text}</span>
            <span aria-hidden="true">
                {text.split(" ").map((word, w) => (
                    <React.Fragment key={w}>
                        <span className="el-case__word">
                            {Array.from(word).map((ch, c) => (
                                <span key={c} className="el-case__char" style={{ ["--d" as any]: `${0.04 + n++ * 0.028}s` }}>
                                    {ch}
                                </span>
                            ))}
                        </span>{" "}
                    </React.Fragment>
                ))}
            </span>
        </h2>
    )
}

function CaseStudy({
    projects,
    order,
    start,
    origin,
    getReturnRect,
    onClosed,
    ctaText,
    ctaLabel,
    ctaHref,
}: {
    projects: Project[]
    order: number[]
    start: number
    origin: Rect | null
    getReturnRect: (index: number) => Rect | null
    onClosed: (after?: () => void) => void
    ctaText: string
    ctaLabel: string
    ctaHref: string
}) {
    const reduce = !!useReducedMotion()
    const scrollRef = useRef<HTMLDivElement>(null)
    const slotRef = useRef<HTMLDivElement>(null)
    const closeRef = useRef<HTMLButtonElement>(null)
    const nextThumbRef = useRef<HTMLSpanElement>(null)
    const flightKey = useRef(0)

    const [pos, setPos] = useState(start)
    const [flight, setFlight] = useState<Flight | null>(origin && !reduce ? { key: 0, project: projects[order[start]], from: origin, to: null } : null)
    const [slot, setSlot] = useState<"hidden" | "shown" | "wipe">(origin && !reduce ? "hidden" : "wipe")
    const [reveal, setReveal] = useState(false)
    const [leaving, setLeaving] = useState(false)
    const [busy, setBusy] = useState(true)

    const index = order[pos]
    const project = projects[index]
    const next = projects[order[(pos + 1) % order.length]]
    const frames = galleryFrames(project)

    // After every article mount: reset scroll, then fly the cover into place or wipe it in.
    useIsoLayoutEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0
        const target = slotRef.current?.getBoundingClientRect()
        if (flight && !flight.to && target) {
            setFlight({ ...flight, to: toRect(target) })
        } else {
            setReveal(true)
            setBusy(false)
        }
    }, [pos])

    useEffect(() => {
        closeRef.current?.focus({ preventScroll: true })
    }, [])

    const landed = () => {
        if (!flight?.to) return
        if (flight.back) {
            onClosed()
            return
        }
        setSlot("shown")
        setFlight(null)
        setReveal(true)
        setBusy(false)
    }

    const go = (to: number, fromEl?: HTMLElement | null) => {
        if (busy || leaving || order.length < 2) return
        const nextPos = (to + order.length) % order.length
        const rect = fromEl && !reduce ? toRect(fromEl.getBoundingClientRect()) : null
        setBusy(true)
        setReveal(false)
        if (rect) setFlight({ key: ++flightKey.current, project: projects[order[nextPos]], from: rect, to: null })
        window.setTimeout(
            () => {
                setSlot(rect ? "hidden" : "wipe")
                setPos(nextPos)
            },
            reduce ? 0 : 380
        )
    }

    const close = (after?: () => void) => {
        if (leaving) return
        setLeaving(true)
        setReveal(false)
        const slotRect = slotRef.current?.getBoundingClientRect()
        const back = getReturnRect(index)
        const slotOnScreen = slotRect && slotRect.bottom > 80 && slotRect.top < window.innerHeight
        if (!after && back && slotRect && slotOnScreen && !reduce && !flight) {
            setSlot("hidden")
            setFlight({ key: ++flightKey.current, project, from: toRect(slotRect), to: back, back: true })
        } else {
            window.setTimeout(() => onClosed(after), reduce ? 0 : 450)
        }
    }

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault()
                close()
            } else if (e.key === "ArrowRight") go(pos + 1)
            else if (e.key === "ArrowLeft") go(pos - 1)
            else if (e.key === "Tab") {
                const root = scrollRef.current
                if (!root) return
                const focusables = Array.from(root.querySelectorAll<HTMLElement>("a[href],button:not([disabled])"))
                if (!focusables.length) return
                const first = focusables[0]
                const last = focusables[focusables.length - 1]
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault()
                    last.focus()
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault()
                    first.focus()
                } else if (!root.contains(document.activeElement)) {
                    e.preventDefault()
                    first.focus()
                }
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    })

    const content = {
        initial: { opacity: 0, y: 28 },
        animate: reveal ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 },
    }
    const t = (delay: number) => ({ duration: reveal ? 1 : 0.3, ease: EASE_OUT, delay: reveal ? delay : 0 })
    const facts = [
        ["Client", project.client],
        ["Role", project.role],
        ["Year", project.year],
        ["Services", project.services],
    ].filter(([, v]) => v)

    return (
        <div className="el">
            <motion.div
                ref={scrollRef}
                className="el-case"
                role="dialog"
                aria-modal="true"
                aria-labelledby="el-case-title"
                data-lenis-prevent=""
                initial={{ opacity: 0 }}
                animate={{ opacity: leaving ? 0 : 1 }}
                transition={{ duration: leaving ? 0.5 : 0.45, ease: EASE_OUT, delay: leaving && flight ? 0.15 : 0 }}
            >
                <div className="el-case__bar">
                    <button ref={closeRef} className="el-case__close el-label el-hover" data-cursor-quiet="" onClick={() => close()} onPointerEnter={trackFill} onPointerLeave={trackFill}>
                        <span className="el-round el-fill" aria-hidden="true">
                            <Cross />
                        </span>
                        <RollText>Close</RollText>
                    </button>
                    <span className="el-case__count el-label el-muted" aria-live="polite">
                        {pad(pos + 1)} / {pad(order.length)}
                    </span>
                    {order.length > 1 && (
                        <div className="el-case__pager">
                            <PagerButton dir="w" onClick={() => go(pos - 1)} label="Previous project" />
                            <PagerButton dir="e" onClick={() => go(pos + 1)} label="Next project" />
                        </div>
                    )}
                </div>

                <article key={index}>
                    <div className="el-case__hero" ref={slotRef}>
                        <motion.div
                            style={{ visibility: slot === "hidden" ? "hidden" : "visible" }}
                            initial={slot === "wipe" && !reduce ? { clipPath: "inset(100% 0% 0% 0%)" } : false}
                            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                            transition={{ duration: 1.05, ease: EASE_IN_OUT }}
                        >
                            <Cover project={project} active={reveal} eager sizes="100vw" />
                        </motion.div>
                    </div>

                    <header className="el-case__head">
                        <motion.div className="el-case__eyebrow el-label" {...content} transition={t(0)}>
                            <span>{project.category}</span>
                            <span>{project.year}</span>
                        </motion.div>
                        <Title text={project.title} show={reveal} />
                        {project.summary && (
                            <motion.p className="el-case__summary" {...content} transition={t(0.35)}>
                                {project.summary}
                            </motion.p>
                        )}
                    </header>

                    <div className="el-case__body">
                        <motion.dl className="el-case__facts" {...content} transition={t(0.45)}>
                            {facts.map(([k, v]) => (
                                <React.Fragment key={k}>
                                    <dt className="el-label el-muted">{k}</dt>
                                    <dd>{v}</dd>
                                </React.Fragment>
                            ))}
                        </motion.dl>
                        <motion.div className="el-case__text" {...content} transition={t(0.55)}>
                            {project.description.split(/\n{2,}/).map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                            {project.link && (
                                <a className="el-case__link el-hover el-fill el-press" href={project.link} target="_blank" rel="noopener noreferrer" onPointerEnter={trackFill} onPointerLeave={trackFill}>
                                    <FlexText rest={[100, 450]} hover={[116, 560]}>
                                        Visit the project
                                    </FlexText>
                                    <Arrow size={13} swap />
                                </a>
                            )}
                        </motion.div>
                    </div>

                    <div className="el-case__gallery">
                        {frames.map((f, i) => (
                            <GalleryFrame key={f} project={project} variant={f} wide={i === 0 || (i === frames.length - 1 && frames.length % 2 === 0)} reduce={reduce} root={scrollRef} />
                        ))}
                    </div>

                    {ctaLabel && (
                        <div className="el-case__cta">
                            <span className="el-muted">{ctaText}</span>
                            <a
                                href={ctaHref}
                                className="el-hover"
                                onClick={(e) => {
                                    if (!ctaHref.startsWith("#")) return
                                    e.preventDefault()
                                    close(() => scrollToAnchor(ctaHref))
                                }}
                            >
                                <FlexText rest={[100, 520]} hover={[122, 640]}>
                                    {ctaLabel}
                                </FlexText>
                                <Arrow dir="e" size={16} swap />
                            </a>
                        </div>
                    )}

                    {order.length > 1 && (
                        <button className="el-case__next el-hover" data-cursor="Next" onClick={() => go(pos + 1, nextThumbRef.current)} aria-label={`Next project: ${next.title}`}>
                            <span className="el-case__next-text">
                                <span className="el-label el-muted">Next project</span>
                                <span className="el-case__next-title">
                                    <FlexText wrap rest={[80, 480]} hover={[114, 660]}>
                                        {next.title}
                                    </FlexText>
                                </span>
                                <span className="el-label el-muted">
                                    {next.category} · {next.year}
                                </span>
                            </span>
                            <span className="el-case__next-thumb" ref={nextThumbRef}>
                                <div>
                                    <Cover project={next} sizes="34vw" />
                                </div>
                            </span>
                        </button>
                    )}
                </article>
            </motion.div>

            {flight && (
                <motion.div
                    key={flight.key}
                    className="el-case__flight"
                    initial={flight.from}
                    animate={flight.to ?? flight.from}
                    transition={{ duration: flight.back ? 0.85 : 1, ease: [0.72, 0, 0.18, 1] }}
                    onAnimationComplete={landed}
                >
                    <Cover project={flight.project} eager />
                </motion.div>
            )}
        </div>
    )
}

/* Work --------------------------------------------------------------- */

interface Props {
    title: string
    intro: string
    projects: Partial<Project>[]
    defaultView: "grid" | "index"
    showFilters: boolean
    allLabel: string
    showViewToggle: boolean
    tint: boolean
    cursorLabel: string
    ctaText: string
    ctaLabel: string
    ctaHref: string
}

export default function Work(props: Props) {
    const { title, intro, defaultView, showFilters, allLabel, showViewToggle, tint, cursorLabel, ctaText, ctaLabel, ctaHref } = props
    const isStatic = isStaticTarget()
    const uid = useId()
    const sectionRef = useRef<HTMLElement>(null)
    const previewRef = useRef<HTMLDivElement>(null)
    const lastFocus = useRef<HTMLElement | null>(null)

    const projects = useMemo(() => (props.projects?.length ? props.projects : sampleProjects).map(normalize), [props.projects])
    const categories = useMemo(() => {
        const seen: string[] = []
        projects.forEach((p) => !seen.includes(p.category) && seen.push(p.category))
        return seen
    }, [projects])

    const [filter, setFilter] = useState<string>(allLabel)
    const [view, setView] = useState<"grid" | "index">(defaultView)
    const [hovered, setHovered] = useState<number | null>(null)
    const [openState, setOpenState] = useState<{ order: number[]; start: number; origin: Rect | null; nonce: number } | null>(null)

    useEffect(() => setView(defaultView), [defaultView])
    useEffect(() => publishProjects(projects), [projects])

    const items: Item[] = useMemo(
        () => projects.map((project, index) => ({ project, index })).filter(({ project }) => filter === allLabel || project.category === filter),
        [projects, filter, allLabel]
    )

    const open = useCallback(
        (index: number, from: HTMLElement | DOMRect | Rect | null) => {
            if (isStatic) return
            lastFocus.current = document.activeElement as HTMLElement
            const inView = items.some((it) => it.index === index)
            const order = inView ? items.map((it) => it.index) : projects.map((_, i) => i)
            const rect = from instanceof HTMLElement ? from.getBoundingClientRect() : from
            setHovered(null)
            setOpenState({ order, start: Math.max(0, order.indexOf(index)), origin: rect && rect.width ? toRect(rect) : null, nonce: Date.now() })
        },
        [items, projects, isStatic]
    )

    // The hero reel asks Work to open a project.
    useEffect(() => onOpenRequest(({ index, rect }) => (open(index, rect), true)), [open])

    // Lock page scroll while a case study is open.
    useEffect(() => {
        if (!openState) return
        const html = document.documentElement
        const gap = window.innerWidth - html.clientWidth
        const prev = { overflow: html.style.overflow, paddingRight: html.style.paddingRight }
        html.style.overflow = "hidden"
        if (gap > 0) html.style.paddingRight = `${gap}px`
        return () => {
            html.style.overflow = prev.overflow
            html.style.paddingRight = prev.paddingRight
        }
    }, [!!openState])

    const getReturnRect = (index: number) => {
        const el = sectionRef.current?.querySelector<HTMLElement>(`[data-el-cover="${index}"]`)
        if (!el) return null
        const r = el.getBoundingClientRect()
        if (!r.width || r.bottom < 0 || r.top > window.innerHeight) return null
        return toRect(r)
    }

    const onClosed = (after?: () => void) => {
        setOpenState(null)
        requestAnimationFrame(() => {
            if (after) after()
            else lastFocus.current?.focus?.({ preventScroll: true })
        })
    }

    const hoveredColor = hovered !== null ? projects[hovered]?.color : null
    const background = tint && hoveredColor ? `color-mix(in srgb, var(--el-bg) 88%, ${hoveredColor})` : undefined
    const still = isStatic

    return (
        <MotionConfig reducedMotion="user">
        <section ref={sectionRef} id="work" className="el el-work" style={{ backgroundColor: background }}>
            <ThemeStyles />
            <style>{CSS + ART_CSS}</style>

            <div className="el-work__head">
                <UnfoldTitle className="el-work__title">
                    {title}
                    <sup>({pad(projects.length)})</sup>
                </UnfoldTitle>
                {intro && (
                    <motion.p className="el-work__intro" {...revealProps(still, 0.15)}>
                        {intro}
                    </motion.p>
                )}
            </div>

            {(showFilters || showViewToggle) && (
                <div className="el-work__bar">
                    {showFilters ? (
                        <motion.div className="el-work__filters el-scroll-x" layoutScroll role="group" aria-label="Filter projects" {...listReveal(still, 0, 0.05)}>
                            {[allLabel, ...categories].map((c) => {
                                const count = c === allLabel ? projects.length : projects.filter((p) => p.category === c).length
                                const on = c === filter
                                return (
                                    <motion.button
                                        key={c}
                                        className="el-chip el-fill el-fill--tint"
                                        aria-pressed={on}
                                        onClick={() => setFilter(c)}
                                        onPointerEnter={trackFill}
                                        onPointerLeave={trackFill}
                                        variants={itemReveal}
                                    >
                                        {on && <motion.span layoutId={`${uid}-chip`} className="el-chip__pill" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                                        <span>{c}</span>
                                        <span className="el-chip__count">{pad(count)}</span>
                                    </motion.button>
                                )
                            })}
                        </motion.div>
                    ) : (
                        <span />
                    )}
                    {showViewToggle && (
                        <motion.div className="el-work__views" role="group" aria-label="Layout" {...revealProps(still, 0.2)}>
                            {(["grid", "index"] as const).map((v) => (
                                <button key={v} className="el-view el-fill el-fill--tint" aria-pressed={view === v} onClick={() => setView(v)} onPointerEnter={trackFill} onPointerLeave={trackFill}>
                                    {view === v && <motion.span layoutId={`${uid}-view`} className="el-chip__pill" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor">
                                        {v === "grid" ? (
                                            <>
                                                <rect x="0.5" y="0.5" width="5.5" height="5.5" />
                                                <rect x="8" y="0.5" width="5.5" height="5.5" />
                                                <rect x="0.5" y="8" width="5.5" height="5.5" />
                                                <rect x="8" y="8" width="5.5" height="5.5" />
                                            </>
                                        ) : (
                                            <>
                                                <rect x="0.5" y="1.5" width="13" height="1.4" />
                                                <rect x="0.5" y="6.3" width="13" height="1.4" />
                                                <rect x="0.5" y="11.1" width="13" height="1.4" />
                                            </>
                                        )}
                                    </svg>
                                    <span>{v === "grid" ? "Grid" : "Index"}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>
            )}

            <AnimatePresence mode="wait" initial={false}>
                <motion.div key={`${view}-${filter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: EASE_OUT }}>
                    {view === "grid" ? (
                        <GridView items={items} still={still} hovered={hovered} setHovered={setHovered} onOpen={open} cursorLabel={cursorLabel} />
                    ) : (
                        <IndexView items={items} projects={projects} still={still} hovered={hovered} setHovered={setHovered} onOpen={open} cursorLabel={cursorLabel} previewRef={previewRef} />
                    )}
                </motion.div>
            </AnimatePresence>

            {openState &&
                createPortal(
                    <CaseStudy
                        key={openState.nonce}
                        projects={projects}
                        order={openState.order}
                        start={openState.start}
                        origin={openState.origin}
                        getReturnRect={getReturnRect}
                        onClosed={onClosed}
                        ctaText={ctaText}
                        ctaLabel={ctaLabel}
                        ctaHref={ctaHref}
                    />,
                    document.body
                )}
        </section>
        </MotionConfig>
    )
}

/* Property controls -------------------------------------------------- */

const image = (title: string) => ({ type: ControlType.ResponsiveImage, title })

addPropertyControls(Work, {
    title: { type: ControlType.String, title: "Title", defaultValue: "Selected work" },
    intro: {
        type: ControlType.String,
        title: "Intro",
        displayTextArea: true,
        defaultValue: "Eight projects from the last four years. Select one to see how it came together.",
    },
    projects: {
        type: ControlType.Array,
        title: "Projects",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title", defaultValue: "New project" },
                category: { type: ControlType.String, title: "Category", defaultValue: "Branding" },
                year: { type: ControlType.String, title: "Year", defaultValue: "2026" },
                client: { type: ControlType.String, title: "Client", defaultValue: "" },
                role: { type: ControlType.String, title: "Role", defaultValue: "" },
                services: { type: ControlType.String, title: "Services", defaultValue: "" },
                summary: { type: ControlType.String, title: "Summary", displayTextArea: true, defaultValue: "" },
                description: { type: ControlType.String, title: "Description", displayTextArea: true, defaultValue: "" },
                cover: image("Cover"),
                gallery1: image("Gallery 1"),
                gallery2: image("Gallery 2"),
                gallery3: image("Gallery 3"),
                link: { type: ControlType.Link, title: "Live link" },
                color: { type: ControlType.Color, title: "Color", defaultValue: "#17214D" },
                tone: { type: ControlType.Color, title: "Accent", defaultValue: "#FF9E4F" },
                motif: { type: ControlType.Enum, title: "Placeholder", options: MOTIF_OPTIONS, optionTitles: MOTIF_TITLES, defaultValue: "orbit" },
            },
        },
        defaultValue: sampleProjects,
    },
    defaultView: { type: ControlType.Enum, title: "View", options: ["grid", "index"], optionTitles: ["Grid", "Index"], defaultValue: "grid", displaySegmentedControl: true },
    showViewToggle: { type: ControlType.Boolean, title: "View toggle", defaultValue: true },
    showFilters: { type: ControlType.Boolean, title: "Filters", defaultValue: true },
    allLabel: { type: ControlType.String, title: "All label", defaultValue: "All", hidden: (p: Props) => !p.showFilters },
    tint: { type: ControlType.Boolean, title: "Hover tint", defaultValue: true },
    cursorLabel: { type: ControlType.String, title: "Cursor label", defaultValue: "View" },
    ctaText: { type: ControlType.String, title: "CTA text", defaultValue: "Planning something like this?" },
    ctaLabel: { type: ControlType.String, title: "CTA label", defaultValue: "Start a project" },
    ctaHref: { type: ControlType.String, title: "CTA link", defaultValue: "#contact" },
})
