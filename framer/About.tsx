// Elastic — About
// A bio that lights up word by word as you scroll, a portrait with a slow
// parallax, and three short lists: services, clients and experience.

import * as React from "react"
import { useRef } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, MotionConfig, MotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ThemeStyles, EASE_IN_OUT, EASE_OUT, REVEAL_VIEWPORT, Rule, isStaticTarget, itemReveal, listReveal, revealProps } from "./Theme.tsx"

const CSS = `
.el-about{background:var(--el-bg);padding:clamp(88px,11vw,168px) var(--el-gutter)}
.el-about__grid{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(32px,5vw,96px);align-items:start}
.el-about__side{position:sticky;top:96px;display:grid;gap:12px}
.el-about__frame{position:relative;aspect-ratio:4/5;overflow:hidden;border-radius:3px;background:var(--el-surface)}
.el-about__inner{position:absolute;left:0;right:0;top:-8%;height:116%}
.el-about__inner>img,.el-about__inner>svg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.el-about__eyebrow{display:flex;justify-content:space-between;gap:16px;margin-bottom:clamp(20px,2.4vw,32px);color:var(--el-muted)}
.el-about__bio{font-size:clamp(26px,3.2vw,50px);line-height:1.12;letter-spacing:-.018em;font-weight:440}
.el-about__cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(24px,3vw,48px);margin-top:clamp(56px,7vw,112px)}
.el-about__col h3{position:relative;padding-bottom:14px;color:var(--el-muted);font-weight:400}
.el-about__col li{position:relative;padding:11px 0;font-size:16px;line-height:1.35}
.el-about__xp li{display:grid;grid-template-columns:minmax(84px,auto) 1fr;gap:16px;align-items:baseline}
.el-about__xp small{display:block;color:var(--el-muted);font-size:14px;margin-top:2px}
@media (max-width: 1023px){.el-about__cols{grid-template-columns:1fr 1fr}}
@media (max-width: 809px){
  .el-about__grid{grid-template-columns:1fr}
  .el-about__side{position:relative;top:0;max-width:360px}
  .el-about__cols{grid-template-columns:1fr}
}
`

interface Job {
    years: string
    role: string
    place: string
}

interface Props {
    label: string
    name: string
    bio: string
    portrait?: { src?: string; srcSet?: string; alt?: string }
    caption: string
    servicesTitle: string
    services: string[]
    clientsTitle: string
    clients: string[]
    experienceTitle: string
    experience: Job[]
}

function Word({ children, progress, range, still }: { children: string; progress: MotionValue<number>; range: [number, number]; still: React.MutableRefObject<boolean> }) {
    // Reads `still` from a ref so server and client render the same markup.
    const opacity = useTransform(progress, (v) => (still.current ? 1 : 0.16 + 0.84 * Math.min(1, Math.max(0, (v - range[0]) / (range[1] - range[0])))))
    return (
        <>
            <motion.span style={{ opacity }}>{children}</motion.span>{" "}
        </>
    )
}

function PortraitPlaceholder() {
    const onAccent = { fill: "var(--el-on-accent)" }
    const ink = { fill: "var(--el-ink)" }
    return (
        <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Portrait placeholder">
            <rect width="400" height="500" style={{ fill: "var(--el-accent)" }} />
            <circle cx="200" cy="214" r="132" style={onAccent} opacity="0.09" />
            <circle cx="200" cy="214" r="96" style={onAccent} opacity="0.08" />
            <circle cx="200" cy="206" r="62" style={ink} />
            <path d="M92 500V458C92 394 142 348 200 348S308 394 308 458V500Z" style={ink} />
            <g style={{ stroke: "var(--el-on-accent)" }} strokeWidth="1.5" fill="none" opacity="0.7">
                <path d="M60 84V64H80M340 64H320M340 64V84M60 436V456H80M340 456H320M340 456V436" />
            </g>
            <text x="92" y="80" fontSize="11" style={{ ...onAccent, fontFamily: "var(--el-mono)", letterSpacing: "0.08em" }}>
                PORTRAIT · 4:5
            </text>
        </svg>
    )
}

export default function About(props: Props) {
    const { label, name, bio, portrait, caption, servicesTitle, services, clientsTitle, clients, experienceTitle, experience } = props
    const isStatic = isStaticTarget()
    const reduce = !!useReducedMotion()
    const still = isStatic || reduce
    const stillRef = useRef(false)
    stillRef.current = still
    const bioRef = useRef<HTMLParagraphElement>(null)
    const frameRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress: bioProgress } = useScroll({ target: bioRef, offset: ["start 85%", "end 50%"] })
    const { scrollYProgress: frameProgress } = useScroll({ target: frameRef, offset: ["start end", "end start"] })
    const portraitY = useTransform(frameProgress, [0, 1], ["-6%", "6%"])

    const words = bio.split(/\s+/).filter(Boolean)
    // Columns start one after another; inside each, the heading and rows cascade with their rules.
    const column = (i: number) => listReveal(isStatic, i * 0.12, 0.06)

    return (
        <MotionConfig reducedMotion="user">
            <section id="about" className="el el-about">
                <ThemeStyles />
                <style>{CSS}</style>
                <div className="el-about__grid">
                    <div className="el-about__side">
                        {/* Same wipe as the project covers: the frame opens upward while the image settles. */}
                        <motion.div
                            className="el-about__frame el-grain"
                            ref={frameRef}
                            initial={isStatic ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
                            whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
                            viewport={REVEAL_VIEWPORT}
                            transition={{ duration: 1.15, ease: EASE_IN_OUT }}
                        >
                            <motion.div
                                className="el-about__inner"
                                style={{ y: still ? 0 : portraitY }}
                                initial={isStatic ? false : { scale: 1.25 }}
                                whileInView={{ scale: 1 }}
                                viewport={REVEAL_VIEWPORT}
                                transition={{ duration: 1.6, ease: EASE_OUT }}
                            >
                                {portrait?.src ? <img src={portrait.src} srcSet={portrait.srcSet} alt={portrait.alt || name} sizes="(max-width: 809px) 90vw, 33vw" loading="lazy" /> : <PortraitPlaceholder />}
                            </motion.div>
                        </motion.div>
                        {caption && (
                            <motion.span className="el-label el-muted" {...revealProps(isStatic, 0.45)}>
                                {caption}
                            </motion.span>
                        )}
                    </div>

                    <div>
                        <motion.div className="el-about__eyebrow el-label" {...revealProps(isStatic)}>
                            <span>{label}</span>
                            <span>{name}</span>
                        </motion.div>
                        <p ref={bioRef} className="el-about__bio">
                            {words.map((w, i) => (
                                <Word key={i} progress={bioProgress} range={[i / words.length, (i + 1) / words.length]} still={stillRef}>
                                    {w}
                                </Word>
                            ))}
                        </p>

                        <div className="el-about__cols">
                            <motion.div className="el-about__col" {...column(0)}>
                                <motion.h3 className="el-label" variants={itemReveal}>
                                    {servicesTitle}
                                    <Rule />
                                </motion.h3>
                                <ul>
                                    {services.map((s) => (
                                        <motion.li key={s} variants={itemReveal}>
                                            {s}
                                            <Rule />
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                            <motion.div className="el-about__col" {...column(1)}>
                                <motion.h3 className="el-label" variants={itemReveal}>
                                    {clientsTitle}
                                    <Rule />
                                </motion.h3>
                                <ul>
                                    {clients.map((c) => (
                                        <motion.li key={c} variants={itemReveal}>
                                            {c}
                                            <Rule />
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                            <motion.div className="el-about__col el-about__xp" {...column(2)}>
                                <motion.h3 className="el-label" variants={itemReveal}>
                                    {experienceTitle}
                                    <Rule />
                                </motion.h3>
                                <ul>
                                    {experience.map((job) => (
                                        <motion.li key={job.years + job.role} variants={itemReveal}>
                                            <span className="el-label el-muted">{job.years}</span>
                                            <span>
                                                {job.role}
                                                {job.place && <small>{job.place}</small>}
                                            </span>
                                            <Rule />
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </MotionConfig>
    )
}

addPropertyControls(About, {
    label: { type: ControlType.String, title: "Label", defaultValue: "About" },
    name: { type: ControlType.String, title: "Name", defaultValue: "Noa Varga" },
    bio: {
        type: ControlType.String,
        title: "Bio",
        displayTextArea: true,
        defaultValue:
            "I'm a designer and art director working across branding, motion and the web. For twelve years I've helped small teams with clear ideas look like themselves: radio stations, ceramicists, festivals, publishers. I work alone or with a small circle of collaborators, and I like projects where the identity has to move.",
    },
    portrait: { type: ControlType.ResponsiveImage, title: "Portrait" },
    caption: { type: ControlType.String, title: "Caption", defaultValue: "In the studio, Lisbon, 2026" },
    servicesTitle: { type: ControlType.String, title: "Services title", defaultValue: "Services" },
    services: {
        type: ControlType.Array,
        title: "Services",
        control: { type: ControlType.String },
        defaultValue: ["Brand identity", "Art direction", "Motion design", "Web design & Framer builds", "Editorial & print"],
    },
    clientsTitle: { type: ControlType.String, title: "Clients title", defaultValue: "Selected clients" },
    clients: {
        type: ControlType.Array,
        title: "Clients",
        control: { type: ControlType.String },
        defaultValue: ["Nocturne FM", "Aurora Pictures", "Halden Studio", "Outpost Press", "Museu da Forma", "Wavelength Festival"],
    },
    experienceTitle: { type: ControlType.String, title: "Experience title", defaultValue: "Experience" },
    experience: {
        type: ControlType.Array,
        title: "Experience",
        control: {
            type: ControlType.Object,
            controls: {
                years: { type: ControlType.String, title: "Years", defaultValue: "2026" },
                role: { type: ControlType.String, title: "Role", defaultValue: "Designer" },
                place: { type: ControlType.String, title: "Place", defaultValue: "" },
            },
        },
        defaultValue: [
            { years: "2022—Now", role: "Independent practice", place: "Lisbon" },
            { years: "2019—22", role: "Senior designer", place: "Studio Halvorsen, Oslo" },
            { years: "2016—19", role: "Motion designer", place: "Field Office, Berlin" },
            { years: "2014—16", role: "Junior designer", place: "Atelier Nord, Copenhagen" },
        ],
    },
})
