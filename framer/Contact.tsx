// Elastic — Contact
// Closing section: a full-width "Let's talk" that stretches toward the cursor,
// a magnetic copy-email button, social links, local time and a back-to-top link.

import * as React from "react"
import { useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, MotionConfig, useInView, useReducedMotion, useTransform } from "framer-motion"
import {
    ThemeStyles,
    Arrow,
    ElasticText,
    ElasticMode,
    FlexText,
    RevealRule,
    RollText,
    Rule,
    EASE_OUT,
    isStaticTarget,
    itemReveal,
    listReveal,
    revealProps,
    useFinePointer,
    useLocalTime,
    useMagnetic,
} from "./Theme.tsx"

const CSS = `
.el-contact{--el-muted:color-mix(in srgb,var(--el-bg) 60%,var(--el-ink));--el-line:color-mix(in srgb,var(--el-bg) 18%,transparent);position:relative;overflow:hidden;background:var(--el-ink);color:var(--el-bg);padding:clamp(88px,10vw,160px) var(--el-gutter) calc(24px + env(safe-area-inset-bottom,0px))}
.el-contact__top{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px 48px;align-items:end}
.el-contact__lead{font-size:clamp(22px,2.4vw,36px);line-height:1.15;letter-spacing:-.012em;max-width:24ch;justify-self:end;text-wrap:balance}
.el-contact__big{display:block;margin-top:clamp(28px,4vw,56px)}
.el-contact__row{position:relative;display:flex;justify-content:space-between;align-items:center;gap:24px 40px;flex-wrap:wrap;margin-top:clamp(24px,3vw,44px);padding-top:24px}
.el-contact__mail{display:grid;gap:8px;min-width:0}
.el-contact__addr{font-size:clamp(22px,2.6vw,40px);letter-spacing:-.015em;line-height:1.1;overflow-wrap:anywhere}
.el-magnet-zone{position:relative;padding:32px;margin:-32px}
.el-magnet__ring{position:absolute;inset:32px;border-radius:50%;border:1px solid var(--el-accent);pointer-events:none}
.el-magnet{position:relative;width:clamp(124px,12vw,168px);aspect-ratio:1;border-radius:50%;background:var(--el-accent);color:var(--el-on-accent);display:grid;place-items:center;font-size:15px;font-weight:560;overflow:hidden}
.el-magnet__label{position:relative;display:block;height:1.3em;line-height:1.3em;overflow:hidden;text-align:center;min-width:8em}
.el-magnet__label>span{position:absolute;left:0;right:0;top:0}
.el-contact__cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px clamp(24px,3vw,48px);width:calc(50% - 24px);margin:clamp(56px,7vw,112px) 0 0 auto}
.el-contact__cols h3{position:relative;padding-bottom:14px;color:var(--el-muted);font-weight:400}
.el-contact__cols li{position:relative}
.el-contact__cols li>a,.el-contact__cols li>span:not(.el-rule){display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 0;font-size:16px}
.el-contact__base{display:flex;justify-content:space-between;gap:12px 24px;flex-wrap:wrap;margin-top:clamp(56px,7vw,96px);color:var(--el-muted)}
.el-contact__base button{display:inline-flex;gap:8px;align-items:center;color:var(--el-bg)}
@media (max-width: 809px){
  .el-contact__top{grid-template-columns:1fr}
  .el-contact__lead{justify-self:start}
  .el-contact__cols{grid-template-columns:1fr;width:100%}
}
`

interface Social {
    label: string
    url: string
}

interface Props {
    label: string
    lead: string
    bigText: string
    email: string
    copyLabel: string
    socialsTitle: string
    socials: Social[]
    studioTitle: string
    location: string
    timeZone: string
    availability: string
    copyright: string
    elastic: ElasticMode
}

function Magnetic({ children, onClick, ariaLabel, success }: { children: React.ReactNode; onClick: () => void; ariaLabel: string; success: number }) {
    const fine = useFinePointer()
    const reduce = !!useReducedMotion()
    const magnet = useMagnetic<HTMLButtonElement>(0.28)
    // The label trails the button a little, which reads as depth.
    const ix = useTransform(magnet.x, (v) => v * 0.4)
    const iy = useTransform(magnet.y, (v) => v * 0.4)

    return (
        <div className="el-magnet-zone" onPointerMove={magnet.onPointerMove} onPointerLeave={magnet.onPointerLeave}>
            {/* A ring ripples out once each time the address is copied. */}
            <AnimatePresence>
                {success > 0 && !reduce && (
                    <motion.span
                        key={success}
                        className="el-magnet__ring"
                        aria-hidden="true"
                        style={{ x: magnet.x, y: magnet.y }}
                        initial={{ scale: 1, opacity: 0.9 }}
                        animate={{ scale: 1.7, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.1, ease: EASE_OUT }}
                    />
                )}
            </AnimatePresence>
            <motion.button
                ref={magnet.ref}
                className="el-magnet"
                style={{ x: magnet.x, y: magnet.y }}
                onClick={onClick}
                aria-label={ariaLabel}
                data-cursor-hide=""
                whileHover={fine && !reduce ? { scale: 1.06 } : undefined}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
            >
                <motion.span style={{ x: ix, y: iy }}>{children}</motion.span>
            </motion.button>
        </div>
    )
}

export default function Contact(props: Props) {
    const { label, lead, bigText, email, copyLabel, socialsTitle, socials, studioTitle, location, timeZone, availability, copyright, elastic } = props
    const isStatic = isStaticTarget()
    const reduce = !!useReducedMotion()
    const sectionRef = useRef<HTMLElement>(null)
    const bigRef = useRef<HTMLAnchorElement>(null)
    const addrRef = useRef<HTMLAnchorElement>(null)
    const inView = useInView(bigRef, { once: true, margin: "0px 0px -10% 0px" })
    const time = useLocalTime(timeZone)
    const [status, setStatus] = useState<"idle" | "copied" | "selected">("idle")
    const [copies, setCopies] = useState(0)

    const copy = () => {
        const done = (s: "copied" | "selected") => {
            setStatus(s)
            if (s === "copied") setCopies((n) => n + 1)
            window.setTimeout(() => setStatus("idle"), 2400)
        }
        const selectAddress = () => {
            const el = addrRef.current
            const sel = window.getSelection()
            if (el && sel) {
                const range = document.createRange()
                range.selectNodeContents(el)
                sel.removeAllRanges()
                sel.addRange(range)
            }
            done("selected")
        }
        try {
            navigator.clipboard.writeText(email).then(() => done("copied"), selectAddress)
        } catch {
            selectAddress()
        }
    }

    const labelText = status === "copied" ? "Copied" : status === "selected" ? "Selected" : copyLabel
    const reveal = (i: number) => revealProps(isStatic, i * 0.1)

    return (
        <MotionConfig reducedMotion="user">
            <footer ref={sectionRef} id="contact" className="el el-contact">
                <ThemeStyles />
                <style>{CSS}</style>

                <div className="el-contact__top">
                    <motion.span className="el-label el-muted" {...reveal(0)}>
                        {label}
                    </motion.span>
                    <motion.p className="el-contact__lead" {...reveal(1)}>
                        {lead}
                    </motion.p>
                </div>

                <a ref={bigRef} href={`mailto:${email}`} className="el-contact__big" data-cursor="Write" aria-label={`${bigText}: email ${email}`}>
                    <ElasticText as="span" text={bigText} play={isStatic || inView} instant={isStatic || reduce} mode={elastic} areaRef={sectionRef} scrollRange={[0.05, 0.5]} />
                </a>

                <div className="el-contact__row">
                    <RevealRule still={isStatic} top />
                    <motion.div className="el-contact__mail" {...reveal(0)}>
                        <span className="el-label el-muted">Email</span>
                        <a ref={addrRef} href={`mailto:${email}`} className="el-contact__addr el-hover">
                            <span className="el-uline">{email}</span>
                        </a>
                    </motion.div>
                    <motion.div {...reveal(1)}>
                        <Magnetic onClick={copy} ariaLabel={`Copy ${email}`} success={copies}>
                            <span className="el-magnet__label" aria-live="polite">
                                <AnimatePresence initial={false}>
                                    <motion.span key={labelText} initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }} transition={{ duration: 0.45, ease: EASE_OUT }}>
                                        {labelText}
                                    </motion.span>
                                </AnimatePresence>
                            </span>
                        </Magnetic>
                    </motion.div>
                </div>

                <div className="el-contact__cols">
                    <motion.div {...listReveal(isStatic, 0, 0.06)}>
                        <motion.h3 className="el-label" variants={itemReveal}>
                            {socialsTitle}
                            <Rule />
                        </motion.h3>
                        <ul>
                            {socials.map((s) => (
                                <motion.li key={s.label} variants={itemReveal}>
                                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="el-hover">
                                        <FlexText rest={[100, 450]} hover={[124, 600]}>
                                            {s.label}
                                        </FlexText>
                                        <Arrow size={13} swap />
                                    </a>
                                    <Rule />
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                    <motion.div {...listReveal(isStatic, 0.12, 0.06)}>
                        <motion.h3 className="el-label" variants={itemReveal}>
                            {studioTitle}
                            <Rule />
                        </motion.h3>
                        <ul>
                            <motion.li variants={itemReveal}>
                                <span>
                                    {location}
                                    <span className="el-label el-muted">{time}</span>
                                </span>
                                <Rule />
                            </motion.li>
                            <motion.li variants={itemReveal}>
                                <span>
                                    Availability
                                    <span className="el-label el-muted" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                                        <span className="el-dot" />
                                        {availability}
                                    </span>
                                </span>
                                <Rule />
                            </motion.li>
                        </ul>
                    </motion.div>
                </div>

                <motion.div className="el-contact__base el-label" {...revealProps(isStatic)} viewport={{ once: true }}>
                    <span>{copyright}</span>
                    <span>Set in Archivo &amp; Fragment Mono</span>
                    <button
                        className="el-hover"
                        onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
                    >
                        <RollText>Back to top</RollText>
                        <Arrow dir="n" size={12} swap />
                    </button>
                </motion.div>
            </footer>
        </MotionConfig>
    )
}

addPropertyControls(Contact, {
    label: { type: ControlType.String, title: "Label", defaultValue: "Contact" },
    lead: { type: ControlType.String, title: "Lead", displayTextArea: true, defaultValue: "Have a project in mind? I'm booking new work from November 2026." },
    bigText: { type: ControlType.String, title: "Big text", defaultValue: "Let’s talk" },
    email: { type: ControlType.String, title: "Email", defaultValue: "hello@noavarga.studio" },
    copyLabel: { type: ControlType.String, title: "Copy label", defaultValue: "Copy email" },
    socialsTitle: { type: ControlType.String, title: "Socials title", defaultValue: "Elsewhere" },
    socials: {
        type: ControlType.Array,
        title: "Socials",
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, title: "Label", defaultValue: "Instagram" },
                url: { type: ControlType.Link, title: "Link" },
            },
        },
        defaultValue: [
            { label: "Instagram", url: "https://www.instagram.com/" },
            { label: "Behance", url: "https://www.behance.net/" },
            { label: "LinkedIn", url: "https://www.linkedin.com/" },
            { label: "Are.na", url: "https://www.are.na/" },
        ],
    },
    studioTitle: { type: ControlType.String, title: "Studio title", defaultValue: "Studio" },
    location: { type: ControlType.String, title: "Location", defaultValue: "Lisbon, Portugal" },
    timeZone: { type: ControlType.String, title: "Time zone", defaultValue: "Europe/Lisbon" },
    availability: { type: ControlType.String, title: "Availability", defaultValue: "From Nov 2026" },
    copyright: { type: ControlType.String, title: "Copyright", defaultValue: "© 2026 Noa Varga" },
    elastic: {
        type: ControlType.Enum,
        title: "Stretch",
        options: ["cursor", "scroll", "off"],
        optionTitles: ["Follows cursor", "On scroll", "Off"],
        defaultValue: "cursor",
    },
})
