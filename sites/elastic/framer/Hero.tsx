// Elastic — Hero
// The name fills the full width. Letters near the cursor stretch wider and
// heavier while the rest condense, so the line keeps its length.
// On touch screens the stretch travels through the name as you scroll.
// A small reel cycles through your projects; clicking it opens the case study.

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion"
import { ThemeStyles, Arrow, ElasticText, ElasticMode, EASE_OUT, EASE_IN_OUT, isStaticTarget, scrollToAnchor, useIntroReady } from "./Theme.tsx"
import { ART_CSS, Cover, Project, requestOpenProject, sampleProjects, useSharedProjects } from "./Covers.tsx"

const CSS = `
.el-hero{position:relative;overflow:hidden;background:var(--el-bg);padding:clamp(104px,14vh,156px) var(--el-gutter) clamp(18px,2.4vw,32px)}
.el-hero__top{display:flex;justify-content:space-between;align-items:flex-end;gap:clamp(24px,5vw,96px)}
.el-hero__statement{font-size:clamp(26px,3.3vw,50px);line-height:1.06;letter-spacing:-.02em;font-weight:430;max-width:20ch}
.el-mask{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.12em;margin-bottom:-.12em}
.el-mask>span{display:inline-block}
.el-hero__reel{flex:none;width:clamp(150px,17vw,250px);display:flex;flex-direction:column;gap:12px}
.el-hero__frame{position:relative;display:block;width:100%;aspect-ratio:4/5;overflow:hidden;border-radius:3px;background:var(--el-surface)}
.el-hero__slide{position:absolute;inset:0}
.el-hero__caption{display:grid;grid-template-columns:1fr auto;gap:4px 12px;align-items:baseline;min-width:0}
.el-hero__cap-title{grid-column:1/-1;position:relative;display:block;font-size:15px;font-weight:560;line-height:1.3;height:1.3em;overflow:hidden}
.el-hero__cap-title>span{position:absolute;left:0;top:0;white-space:nowrap}
.el-hero__name{margin-top:clamp(36px,6.5vw,96px)}
.el-hero__meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px 24px;border-top:1px solid var(--el-line);padding-top:14px;margin-top:clamp(22px,3vw,44px)}
.el-hero__scroll{justify-self:end;display:inline-flex;gap:8px;align-items:center}
@keyframes el-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}
.el-hero__bob{display:inline-flex;animation:el-bob 1.6s ease-in-out infinite}
@media (max-width: 809px){
  .el-hero__top{flex-direction:column;align-items:stretch}
  .el-hero__reel{width:100%;flex-direction:row;align-items:flex-end;gap:16px}
  .el-hero__frame{width:38%;max-width:190px;flex:none}
  .el-hero__caption{flex:1}
  .el-hero__meta{grid-template-columns:1fr 1fr}
  .el-hero__scroll{justify-self:start}
}
`

/* Reel --------------------------------------------------------------- */

function Reel({ projects, label, play, instant }: { projects: Project[] | null; label: string; play: boolean; instant: boolean }) {
    const [tick, setTick] = useState(0)
    const [hover, setHover] = useState(false)
    const frameRef = useRef<HTMLButtonElement>(null)
    const count = projects?.length ?? 0
    const index = count ? tick % count : 0
    const project = projects?.[index]
    const previous = tick > 0 && count ? projects?.[(tick - 1) % count] : undefined

    useEffect(() => {
        if (!play || instant || hover || count < 2) return
        const id = window.setInterval(() => setTick((t) => t + 1), 2600)
        return () => window.clearInterval(id)
    }, [play, instant, hover, count])

    const open = () => {
        const rect = frameRef.current?.getBoundingClientRect() ?? null
        if (!requestOpenProject(index, rect)) scrollToAnchor("#work")
    }

    return (
        <motion.div
            className="el-hero__reel"
            initial={{ opacity: 0, y: 28 }}
            animate={play ? { opacity: 1, y: 0 } : undefined}
            transition={instant ? { duration: 0 } : { duration: 1.2, ease: EASE_OUT, delay: 0.55 }}
        >
            <button
                ref={frameRef}
                className="el-hero__frame"
                onClick={open}
                onPointerEnter={() => setHover(true)}
                onPointerLeave={() => setHover(false)}
                onFocus={() => setHover(true)}
                onBlur={() => setHover(false)}
                data-cursor="Open"
                aria-label={project ? `Open ${project.title}` : "Selected work"}
            >
                {/* The previous slide stays underneath while the next one wipes in over it. */}
                {previous && (
                    <div className="el-hero__slide" style={{ zIndex: 0 }}>
                        <Cover project={previous} sizes="250px" />
                    </div>
                )}
                {project && (
                    <motion.div
                        key={tick}
                        className="el-hero__slide"
                        style={{ zIndex: 1 }}
                        initial={tick === 0 ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
                        animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                        transition={{ duration: 0.95, ease: EASE_IN_OUT }}
                    >
                        <motion.div style={{ position: "absolute", inset: 0 }} initial={tick === 0 ? false : { scale: 1.25 }} animate={{ scale: 1 }} transition={{ duration: 1.5, ease: EASE_OUT }}>
                            <Cover project={project} active={hover} eager sizes="250px" />
                        </motion.div>
                    </motion.div>
                )}
            </button>
            <div className="el-hero__caption">
                <span className="el-label el-muted">{label}</span>
                <span className="el-label el-muted">{count ? `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}` : ""}</span>
                <span className="el-hero__cap-title">
                    <AnimatePresence initial={false}>
                        {project && (
                            <motion.span key={tick} initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }} transition={{ duration: 0.7, ease: EASE_OUT }}>
                                {project.title} <span className="el-muted">{project.year}</span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </span>
            </div>
        </motion.div>
    )
}

/* Hero --------------------------------------------------------------- */

interface Props {
    name: string
    statement: string
    discipline: string
    location: string
    availability: string
    scrollLabel: string
    scrollTarget: string
    showReel: boolean
    reelLabel: string
    elastic: ElasticMode
}

export default function Hero(props: Props) {
    const { name, statement, discipline, location, availability, scrollLabel, scrollTarget, showReel, reelLabel, elastic } = props
    const isStatic = isStaticTarget()
    const reduce = !!useReducedMotion()
    const instant = isStatic || reduce
    const introReady = useIntroReady()
    const play = isStatic || introReady
    const sectionRef = useRef<HTMLElement>(null)

    const shared = useSharedProjects()
    const [fallback, setFallback] = useState(false)
    useEffect(() => {
        const t = window.setTimeout(() => setFallback(true), 50)
        return () => window.clearTimeout(t)
    }, [])
    const projects = shared?.length ? shared : isStatic || fallback ? sampleProjects : null

    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
    const nameY = useTransform(scrollYProgress, [0, 1], ["0%", "46%"])
    const topY = useTransform(scrollYProgress, [0, 1], [0, -60])

    const words = statement.split(/\s+/).filter(Boolean)
    const meta = [discipline, location, availability].filter(Boolean)
    const fade = (delay: number) => ({
        initial: { opacity: 0, y: 14 },
        animate: play ? { opacity: 1, y: 0 } : undefined,
        transition: instant ? { duration: 0 } : { duration: 1, ease: EASE_OUT, delay },
    })

    return (
        <section ref={sectionRef} id="top" className="el el-hero">
            <ThemeStyles />
            <style>{CSS + ART_CSS}</style>

            <motion.div className="el-hero__top" style={instant ? undefined : { y: topY }}>
                <p className="el-hero__statement">
                    {words.map((w, i) => (
                        <React.Fragment key={i}>
                            <span className="el-mask">
                                <motion.span
                                    initial={{ y: "110%" }}
                                    animate={play ? { y: "0%" } : undefined}
                                    transition={instant ? { duration: 0 } : { duration: 1, ease: EASE_OUT, delay: 0.3 + i * 0.024 }}
                                >
                                    {w}
                                </motion.span>
                            </span>{" "}
                        </React.Fragment>
                    ))}
                </p>
                {showReel && <Reel projects={projects} label={reelLabel} play={play} instant={instant} />}
            </motion.div>

            <motion.div style={instant ? undefined : { y: nameY }}>
                <ElasticText as="h1" className="el-hero__name" text={name} play={play} instant={instant} mode={elastic} areaRef={sectionRef} scrollRange={[0.45, 0.9]} />
            </motion.div>

            <motion.div className="el-hero__meta el-label" {...fade(0.75)}>
                {meta.map((m) => (
                    <span key={m}>{m}</span>
                ))}
                <a
                    href={scrollTarget}
                    className="el-hero__scroll el-hover"
                    onClick={(e) => {
                        if (scrollToAnchor(scrollTarget)) e.preventDefault()
                    }}
                >
                    <span className="el-uline">{scrollLabel}</span>
                    <span className="el-hero__bob">
                        <Arrow dir="s" size={12} />
                    </span>
                </a>
            </motion.div>
        </section>
    )
}

addPropertyControls(Hero, {
    name: { type: ControlType.String, title: "Name", defaultValue: "Noa Varga" },
    statement: {
        type: ControlType.String,
        title: "Statement",
        displayTextArea: true,
        defaultValue: "Independent designer and art director. I build identities, motion systems and websites for record labels, studios and cultural spaces.",
    },
    discipline: { type: ControlType.String, title: "Line 1", defaultValue: "Branding, motion & web" },
    location: { type: ControlType.String, title: "Line 2", defaultValue: "Lisbon, working worldwide" },
    availability: { type: ControlType.String, title: "Line 3", defaultValue: "Booking from November 2026" },
    scrollLabel: { type: ControlType.String, title: "Scroll label", defaultValue: "Selected work" },
    scrollTarget: { type: ControlType.String, title: "Scroll target", defaultValue: "#work" },
    showReel: { type: ControlType.Boolean, title: "Reel", defaultValue: true },
    reelLabel: { type: ControlType.String, title: "Reel label", defaultValue: "Now showing", hidden: (p: Props) => !p.showReel },
    elastic: {
        type: ControlType.Enum,
        title: "Stretch",
        options: ["cursor", "scroll", "off"],
        optionTitles: ["Follows cursor", "On scroll", "Off"],
        defaultValue: "cursor",
    },
})
