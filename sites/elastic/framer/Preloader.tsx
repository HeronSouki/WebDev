// Elastic — Preloader
// A counter that stretches from condensed to extended as it counts to 100,
// then lifts away. Plays once per browser session.
// Place it at the top level of the page (not inside a section).

import * as React from "react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { addPropertyControls, ControlType } from "framer"
import { motion, animate, useMotionValue, useTransform } from "framer-motion"
import { ThemeStyles, CanvasNote, EASE_IN_OUT, holdIntro, isStaticTarget, releaseIntro, useIsoLayoutEffect } from "./Theme.tsx"

const SEEN_KEY = "elastic:intro-seen"

// Runs before hydration, so returning visitors never see a flash of the preloader.
const GATE_SCRIPT = `try{var d=document.documentElement;if(sessionStorage.getItem("${SEEN_KEY}")||navigator.webdriver||matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("el-intro-skip")}else{window.__elIntroHeld=true}}catch(e){}`

const CSS = `
.el-preloader{position:fixed;inset:0;z-index:2147483000;background:var(--el-ink);color:var(--el-bg);display:flex;flex-direction:column;justify-content:space-between;padding:calc(var(--el-gutter) + env(safe-area-inset-top,0px)) var(--el-gutter) calc(var(--el-gutter) + env(safe-area-inset-bottom,0px));animation:el-pre-failsafe .4s 8s forwards}
.el-intro-skip .el-preloader{display:none}
.el-preloader__row{display:flex;justify-content:space-between;gap:24px}
.el-preloader__count{font-size:clamp(104px,26vw,360px);line-height:.78;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums;white-space:nowrap}
.el-preloader__bar{height:1px;position:relative;overflow:hidden;margin-top:20px;background:color-mix(in srgb,var(--el-bg) 22%,transparent)}
.el-preloader__bar>i{position:absolute;inset:0;background:var(--el-bg);transform-origin:0 50%}
@keyframes el-pre-failsafe{to{opacity:0;visibility:hidden}}
`

interface Props {
    name: string
    tagline: string
    duration: number
    oncePerSession: boolean
}

const stretchAt = (v: number) => `"wdth" ${62 + v * 0.63}, "wght" ${280 + v * 4.8}`

export default function Preloader({ name, tagline, duration, oncePerSession }: Props) {
    const isStatic = isStaticTarget()
    const [phase, setPhase] = useState<"server" | "run" | "lift" | "done">("server")
    const progress = useMotionValue(0)
    const count = useTransform(progress, (v) => String(Math.round(v)).padStart(3, "0"))
    const stretch = useTransform(progress, stretchAt)
    const bar = useTransform(progress, [0, 100], [0, 1])

    // Decide before the first paint whether the intro plays.
    useIsoLayoutEffect(() => {
        if (isStatic) return
        const root = document.documentElement
        let seen = false
        try {
            seen = oncePerSession && !!sessionStorage.getItem(SEEN_KEY)
        } catch {}
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (root.classList.contains("el-intro-skip") || seen || reduce || (navigator as any).webdriver) {
            root.classList.add("el-intro-skip")
            releaseIntro()
            setPhase("done")
            return
        }
        holdIntro()
        root.style.overflow = "hidden"
        setPhase("run")
    }, [])

    useEffect(() => {
        if (phase !== "run") return
        const controls = animate(progress, 100, {
            duration: Math.max(0.6, duration),
            ease: [0.65, 0, 0.35, 1],
            onComplete: () => window.setTimeout(() => setPhase("lift"), 160),
        })
        return () => controls.stop()
    }, [phase === "run"])

    useEffect(() => {
        if (phase !== "lift") return
        // Let the hero start rising while the panel is still lifting.
        const t = window.setTimeout(releaseIntro, 280)
        return () => window.clearTimeout(t)
    }, [phase])

    const finish = () => {
        try {
            if (oncePerSession) sessionStorage.setItem(SEEN_KEY, "1")
        } catch {}
        document.documentElement.style.overflow = ""
        setPhase("done")
    }

    useEffect(() => () => void (document.documentElement.style.overflow = ""), [])

    if (isStatic) return <CanvasNote title="Preloader" note="Plays on page load, once per session. Keep it at the top of the page." />
    if (phase === "done") return null

    const header = (
        <div className="el-preloader__row el-label">
            <span>{name}</span>
            <span style={{ opacity: 0.6 }}>{tagline}</span>
        </div>
    )

    // Server render: a static panel that covers the page from the first paint.
    if (phase === "server") {
        return (
            <>
                <script dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }} />
                <div className="el el-preloader" aria-hidden="true">
                    <ThemeStyles />
                    <style>{CSS}</style>
                    {header}
                    <div>
                        <div className="el-preloader__count" style={{ fontVariationSettings: stretchAt(0) }}>
                            000
                        </div>
                        <div className="el-preloader__bar" />
                    </div>
                </div>
            </>
        )
    }

    // Client: portal to <body> so no parent transform or stacking context can trap it.
    return createPortal(
        <motion.div
            className="el el-preloader"
            aria-hidden="true"
            initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
            animate={{ clipPath: phase === "lift" ? "inset(0% 0% 100% 0%)" : "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 0.95, ease: EASE_IN_OUT }}
            onAnimationComplete={() => {
                if (phase === "lift") finish()
            }}
        >
            <ThemeStyles />
            <style>{CSS}</style>
            {header}
            <motion.div animate={phase === "lift" ? { y: "-12vh", opacity: 0.4 } : { y: 0, opacity: 1 }} transition={{ duration: 0.95, ease: EASE_IN_OUT }}>
                <motion.div className="el-preloader__count" style={{ fontVariationSettings: stretch }}>
                    {count}
                </motion.div>
                <div className="el-preloader__bar">
                    <motion.i style={{ scaleX: bar }} />
                </div>
            </motion.div>
        </motion.div>,
        document.body
    )
}

addPropertyControls(Preloader, {
    name: { type: ControlType.String, title: "Name", defaultValue: "Noa Varga" },
    tagline: { type: ControlType.String, title: "Tagline", defaultValue: "Portfolio 2019—2026" },
    duration: { type: ControlType.Number, title: "Duration", defaultValue: 1.6, min: 0.6, max: 4, step: 0.1, unit: "s" },
    oncePerSession: { type: ControlType.Boolean, title: "Once per visit", defaultValue: true },
})
