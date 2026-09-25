// Elastic — Marquee
// A band of words that drifts on its own, speeds up with scroll velocity,
// and stretches wider the faster you scroll.

import * as React from "react"
import { useRef } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion"
import { ThemeStyles, isStaticTarget } from "./Theme.tsx"

const CSS = `
.el-marquee{position:relative;overflow:hidden;padding:clamp(18px,2.6vw,36px) 0;border-block:1px solid var(--el-line)}
.el-marquee[data-tone="ink"]{background:var(--el-ink);color:var(--el-bg);border-color:transparent}
.el-marquee[data-tone="accent"]{background:var(--el-accent);color:var(--el-on-accent);border-color:transparent}
.el-marquee[data-tone="plain"]{background:var(--el-bg)}
.el-marquee__track{display:flex;width:max-content;will-change:transform}
.el-marquee__group{display:flex;align-items:center;flex:none}
.el-marquee__item{display:inline-flex;align-items:center;gap:clamp(20px,3vw,48px);padding-right:clamp(20px,3vw,48px);font-size:clamp(40px,7.4vw,120px);line-height:1;letter-spacing:-.02em;white-space:nowrap}
.el-marquee__star{width:.42em;height:.42em;flex:none;animation:el-spin 9s linear infinite}
`

interface Props {
    items: string[]
    speed: number
    direction: "left" | "right"
    tone: "ink" | "accent" | "plain"
}

function Star() {
    return (
        <svg className="el-marquee__star" viewBox="0 0 40 40" aria-hidden="true" fill="currentColor">
            {[0, 45, 90, 135].map((a) => (
                <rect key={a} x="17.5" y="0" width="5" height="40" rx="2.5" transform={`rotate(${a} 20 20)`} />
            ))}
        </svg>
    )
}

export default function Marquee({ items, speed, direction, tone }: Props) {
    const isStatic = isStaticTarget()
    const reduce = !!useReducedMotion()
    const trackRef = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const { scrollY } = useScroll()
    const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
    const boost = useTransform(velocity, [-2500, 0, 2500], [-4, 0, 4], { clamp: false })
    const stretch = useTransform(velocity, (v) => {
        const k = Math.min(1, Math.abs(v) / 2200)
        return `"wdth" ${(88 + 37 * k).toFixed(1)}, "wght" ${(520 + 180 * k).toFixed(0)}`
    })
    const dir = useRef(direction === "left" ? -1 : 1)

    useAnimationFrame((_, delta) => {
        if (isStatic || reduce) return
        const track = trackRef.current
        if (!track) return
        const width = track.scrollWidth / 2
        if (!width) return
        // Scrolling up reverses the drift, scrolling down restores it.
        const b = boost.get()
        if (b < -0.2) dir.current = direction === "left" ? 1 : -1
        else if (b > 0.2) dir.current = direction === "left" ? -1 : 1
        const move = dir.current * (speed / 1000) * delta * (1 + Math.abs(b))
        let next = x.get() + move
        if (next <= -width) next += width
        if (next > 0) next -= width
        x.set(next)
    })

    const list = items.length ? items : ["Add some words"]
    const group = (copy: number) => (
        <div className="el-marquee__group" aria-hidden={copy > 0 || undefined} key={copy}>
            {list.map((item, i) => (
                <span className="el-marquee__item" key={i}>
                    {item}
                    <Star />
                </span>
            ))}
        </div>
    )

    return (
        <section className="el el-marquee" data-tone={tone}>
            <ThemeStyles />
            <style>{CSS}</style>
            <span className="el-sr">{list.join(", ")}</span>
            <motion.div ref={trackRef} className="el-marquee__track" aria-hidden="true" style={{ x, fontVariationSettings: isStatic ? '"wdth" 88, "wght" 520' : stretch }}>
                {group(0)}
                {group(1)}
                {group(2)}
                {group(3)}
            </motion.div>
        </section>
    )
}

addPropertyControls(Marquee, {
    items: {
        type: ControlType.Array,
        title: "Words",
        control: { type: ControlType.String },
        defaultValue: ["Brand identity", "Motion design", "Art direction", "Websites", "Editorial"],
    },
    speed: { type: ControlType.Number, title: "Speed", defaultValue: 60, min: 10, max: 300, step: 5, unit: "px/s" },
    direction: { type: ControlType.Enum, title: "Direction", options: ["left", "right"], optionTitles: ["Left", "Right"], defaultValue: "left", displaySegmentedControl: true },
    tone: { type: ControlType.Enum, title: "Tone", options: ["ink", "accent", "plain"], optionTitles: ["Ink", "Accent", "Plain"], defaultValue: "ink" },
})
