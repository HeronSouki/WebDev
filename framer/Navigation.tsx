// Elastic — Navigation
// Fixed top bar with a live local clock, availability status and links whose
// width stretches on hover. Hides while scrolling down, returns on scroll up.
// On phones it becomes a full-screen menu.

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, MotionConfig, useScroll, useMotionValueEvent } from "framer-motion"
import { ThemeStyles, FlexText, RollText, EASE_OUT, EASE_IN_OUT, isStaticTarget, scrollToAnchor, trackFill, useIntroReady, useLocalTime, useMounted, useMedia } from "./Theme.tsx"

const CSS = `
.el-nav{position:fixed;top:0;left:0;right:0;z-index:900;pointer-events:none}
.el-nav--static{position:relative}
.el-nav__bar{position:relative;z-index:2;pointer-events:auto;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:24px;padding:calc(14px + env(safe-area-inset-top,0px)) var(--el-gutter) 14px;font-size:15px;line-height:1.2;transition:background-color .5s var(--el-ease),box-shadow .5s var(--el-ease),backdrop-filter .5s}
.el-nav__bar[data-scrolled="true"]{background:color-mix(in srgb,var(--el-bg) 78%,transparent);-webkit-backdrop-filter:blur(14px) saturate(1.3);backdrop-filter:blur(14px) saturate(1.3);box-shadow:0 1px 0 var(--el-line)}
.el-nav__brand{justify-self:start;font-weight:640;letter-spacing:-.01em;display:inline-flex;align-items:center;gap:10px}
.el-nav__mid{display:flex;gap:18px;align-items:center;color:var(--el-muted)}
.el-nav__links{position:relative;justify-self:end;display:flex;align-items:center;gap:clamp(16px,2.2vw,32px)}
.el-nav__link{position:relative;display:inline-flex;align-items:center;gap:6px;padding:6px 0}
.el-nav__marker{position:absolute;left:-10px;top:50%;width:4px;height:4px;margin-top:-2px;border-radius:50%;background:var(--el-accent);pointer-events:none}
.el-nav__status{display:inline-flex;align-items:center;gap:10px;padding:8px 14px 8px 12px;border-radius:999px;border:1px solid var(--el-line);white-space:nowrap}
.el-nav__menu-btn{display:none;justify-self:end;padding:6px 0}
.el-nav__menu-label{position:relative;display:block;width:6ch;height:1.35em;overflow:hidden;text-align:right}
.el-nav__menu-label>span{position:absolute;right:0;top:0}
.el-menu{position:fixed;inset:0;z-index:1;background:var(--el-ink);color:var(--el-bg);display:flex;flex-direction:column;justify-content:space-between;padding:calc(88px + env(safe-area-inset-top,0px)) var(--el-gutter) calc(28px + env(safe-area-inset-bottom,0px));pointer-events:auto}
.el-menu__links{display:flex;flex-direction:column;gap:4px}
.el-menu__link{display:block;overflow:hidden;font-size:clamp(52px,15vw,120px);line-height:1;letter-spacing:-.02em;padding-bottom:.06em}
.el-menu__foot{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;opacity:.7}
@media (max-width: 809px){
  .el-nav__mid,.el-nav__links{display:none}
  .el-nav__bar{grid-template-columns:1fr auto}
  .el-nav__menu-btn{display:inline-flex}
  .el-nav__bar[data-open="true"]{background:transparent;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;color:var(--el-bg)}
}
`

interface NavLink {
    label: string
    href: string
}

interface Props {
    name: string
    role: string
    location: string
    timeZone: string
    links: NavLink[]
    status: string
    statusHref: string
    showStatus: boolean
    hideOnScroll: boolean
}

function useActiveSection(ids: string[]) {
    const [active, setActive] = useState<string | null>(null)
    useEffect(() => {
        const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
        if (!els.length) return
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActive(e.target.id)
                })
            },
            { rootMargin: "-45% 0px -50% 0px" }
        )
        els.forEach((el) => io.observe(el))
        return () => io.disconnect()
    }, [ids.join("|")])
    return active
}

const idOf = (href: string) => (href.includes("#") ? href.slice(href.indexOf("#") + 1) : "")

export default function Navigation(props: Props) {
    const { name, role, location, timeZone, links, status, statusHref, showStatus, hideOnScroll } = props
    const isStatic = isStaticTarget()
    const mounted = useMounted()
    const introReady = useIntroReady()
    const entered = isStatic || introReady
    const [settled, setSettled] = useState(false)
    const time = useLocalTime(timeZone)
    const phone = useMedia("(max-width: 809px)")
    const [hidden, setHidden] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [open, setOpen] = useState(false)
    const active = useActiveSection(links.map((l) => idOf(l.href)).filter(Boolean))
    const { scrollY } = useScroll()
    const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
    const [markerX, setMarkerX] = useState<number | null>(null)
    const activeIndex = links.findIndex((l) => active !== null && idOf(l.href) === active)

    // The active-section marker slides between links instead of jumping.
    useEffect(() => {
        const measure = () => {
            const el = linkRefs.current[activeIndex]
            if (el && el.offsetWidth) setMarkerX(el.offsetLeft)
        }
        measure()
        window.addEventListener("resize", measure)
        ;(document as any).fonts?.ready?.then(measure)
        return () => window.removeEventListener("resize", measure)
    }, [activeIndex, links.length])

    useMotionValueEvent(scrollY, "change", (y) => {
        const prev = scrollY.getPrevious() ?? 0
        setScrolled(y > 24)
        if (!hideOnScroll) return
        if (y > prev + 2 && y > 200) setHidden(true)
        else if (y < prev - 4) setHidden(false)
    })

    useEffect(() => {
        if (!phone) setOpen(false)
    }, [phone])

    useEffect(() => {
        if (!open) return
        const prev = document.documentElement.style.overflow
        document.documentElement.style.overflow = "hidden"
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
        window.addEventListener("keydown", onKey)
        return () => {
            document.documentElement.style.overflow = prev
            window.removeEventListener("keydown", onKey)
        }
    }, [open])

    const go = (href: string) => (e: React.MouseEvent) => {
        if (isStatic) return
        const hash = href.startsWith("/#") ? href.slice(1) : href
        if (scrollToAnchor(hash)) {
            e.preventDefault()
            setOpen(false)
        }
    }

    const bar = (
        <motion.div
            className="el-nav__bar"
            data-scrolled={scrolled && !open}
            data-open={open}
            initial={false}
            animate={{ y: (hidden || !entered) && !open ? "-110%" : "0%" }}
            // The first entrance is timed with the hero; after that the bar only hides and returns.
            transition={settled ? { duration: 0.6, ease: EASE_OUT } : { duration: 1.1, ease: EASE_OUT, delay: 0.35 }}
            onAnimationComplete={() => entered && !settled && setSettled(true)}
        >
            <a href="#top" className="el-nav__brand el-hover" onClick={go("#top")} aria-label={`${name}, back to top`}>
                <FlexText rest={[100, 640]} hover={[118, 700]}>
                    {name}
                </FlexText>
            </a>
            <div className="el-nav__mid el-label">
                <span>{role}</span>
                <span aria-label={`Local time in ${location}`}>
                    {location} {time}
                </span>
            </div>
            <nav className="el-nav__links" aria-label="Main">
                {links.map((l, i) => (
                    <a
                        key={l.label}
                        ref={(el) => (linkRefs.current[i] = el)}
                        href={l.href}
                        onClick={go(l.href)}
                        className="el-nav__link el-hover"
                        data-active={active === idOf(l.href)}
                    >
                        <FlexText rest={[100, 450]} hover={[122, 600]}>
                            {l.label}
                        </FlexText>
                    </a>
                ))}
                {markerX !== null && (
                    <motion.span
                        className="el-nav__marker"
                        aria-hidden="true"
                        initial={{ x: markerX, scale: 0 }}
                        animate={{ x: markerX, scale: activeIndex >= 0 ? 1 : 0 }}
                        transition={{ x: { type: "spring", stiffness: 320, damping: 26 }, scale: { duration: 0.4, ease: EASE_OUT } }}
                    />
                )}
                {showStatus && (
                    <a href={statusHref} onClick={go(statusHref)} onPointerEnter={trackFill} onPointerLeave={trackFill} className="el-nav__status el-label el-hover el-fill el-press">
                        <span className="el-dot" />
                        <RollText>{status}</RollText>
                    </a>
                )}
            </nav>
            <button className="el-nav__menu-btn el-label el-press" aria-label={open ? "Close menu" : "Menu"} aria-expanded={open} aria-controls="el-menu" onClick={() => setOpen((v) => !v)}>
                <span className="el-nav__menu-label">
                    <AnimatePresence initial={false}>
                        <motion.span key={open ? "close" : "menu"} initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }} transition={{ duration: 0.45, ease: EASE_OUT }}>
                            {open ? "Close" : "Menu"}
                        </motion.span>
                    </AnimatePresence>
                </span>
            </button>
        </motion.div>
    )

    const menu = (
        <AnimatePresence>
            {open && (
                <motion.div
                    id="el-menu"
                    className="el el-menu"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu"
                    initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
                    animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                    exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
                    transition={{ duration: 0.7, ease: EASE_IN_OUT }}
                >
                    <nav className="el-menu__links" aria-label="Menu">
                        {links.map((l, i) => (
                            <a key={l.label} href={l.href} onClick={go(l.href)} className="el-menu__link el-hover">
                                <motion.span
                                    style={{ display: "block" }}
                                    initial={{ y: "105%" }}
                                    animate={{ y: "0%" }}
                                    exit={{ y: "-105%" }}
                                    transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.25 + i * 0.07 }}
                                >
                                    <FlexText rest={[88, 520]} hover={[125, 700]}>
                                        {l.label}
                                    </FlexText>
                                </motion.span>
                            </a>
                        ))}
                    </nav>
                    <motion.div className="el-menu__foot el-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.5 }}>
                        <span>
                            {location} {time}
                        </span>
                        {showStatus && (
                            <a href={statusHref} onClick={go(statusHref)} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                                <span className="el-dot" /> {status}
                            </a>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    const tree = (
        <MotionConfig reducedMotion="user">
            <header className={`el el-nav ${isStatic ? "el-nav--static" : ""}`}>
                <ThemeStyles />
                <style>{CSS}</style>
                {menu}
                {bar}
            </header>
        </MotionConfig>
    )

    if (isStatic || !mounted) return tree
    return createPortal(tree, document.body)
}

addPropertyControls(Navigation, {
    name: { type: ControlType.String, title: "Name", defaultValue: "Noa Varga" },
    role: { type: ControlType.String, title: "Role", defaultValue: "Designer & art director" },
    location: { type: ControlType.String, title: "Location", defaultValue: "Lisbon" },
    timeZone: { type: ControlType.String, title: "Time zone", defaultValue: "Europe/Lisbon", description: "IANA name, e.g. Europe/Berlin" },
    links: {
        type: ControlType.Array,
        title: "Links",
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, title: "Label", defaultValue: "Link" },
                href: { type: ControlType.String, title: "Target", defaultValue: "#work", description: "#section-id or a URL" },
            },
        },
        defaultValue: [
            { label: "Work", href: "#work" },
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
        ],
    },
    showStatus: { type: ControlType.Boolean, title: "Status", defaultValue: true },
    status: { type: ControlType.String, title: "Status text", defaultValue: "Booking from November", hidden: (p: Props) => !p.showStatus },
    statusHref: { type: ControlType.String, title: "Status link", defaultValue: "#contact", hidden: (p: Props) => !p.showStatus },
    hideOnScroll: { type: ControlType.Boolean, title: "Hide on scroll", defaultValue: true },
})
