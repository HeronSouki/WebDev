// Elastic — Cursor
// A small dot that inverts whatever is under it, grows over links, and turns
// into a labelled bubble over anything with a data-cursor attribute
// (projects say "View", the hero reel says "Open"). Mouse and trackpad only.
// Drop one instance anywhere on the page.

import * as React from "react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, useMotionValue, useReducedMotion, useSpring } from "framer-motion"
import { ThemeStyles, CanvasNote, EASE_OUT, isStaticTarget, useFinePointer, useMounted } from "./Theme.tsx"

const CSS = `
.el-cursor-hide-native,.el-cursor-hide-native *{cursor:none!important}
.el-cursor{position:fixed;top:0;left:0;z-index:2147483001;pointer-events:none;width:0;height:0}
.el-cursor--blend{mix-blend-mode:difference}
.el-cursor__dot{position:absolute;left:0;top:0;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:#fff}
.el-cursor__bubble{position:absolute;left:0;top:0;width:92px;height:92px;margin:-46px 0 0 -46px;border-radius:50%;background:var(--el-accent);color:var(--el-on-accent);display:grid;place-items:center;font-family:var(--el-mono);font-size:12px;letter-spacing:.06em;text-transform:uppercase}
`

interface Props {
    hideNative: boolean
    bubbleSize: number
}

function CursorLayer({ hideNative, bubbleSize }: Props) {
    const reduce = !!useReducedMotion()
    const x = useMotionValue(-200)
    const y = useMotionValue(-200)
    const spring = reduce ? { stiffness: 2000, damping: 100 } : { stiffness: 420, damping: 34, mass: 0.6 }
    const bx = useSpring(x, spring)
    const by = useSpring(y, spring)
    const [label, setLabel] = useState<string | null>(null)
    const [hot, setHot] = useState(false)
    const [hide, setHide] = useState(false)
    const [down, setDown] = useState(false)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const root = document.documentElement
        if (hideNative) root.classList.add("el-cursor-hide-native")
        const last = { x: -200, y: -200 }
        const read = (target: Element | null) => {
            const labelled = target?.closest?.("[data-cursor]")
            setLabel(labelled?.getAttribute("data-cursor") || null)
            setHot(!!target?.closest?.("a,button,[role='button'],label,summary,input,select,textarea"))
            setHide(!!target?.closest?.("[data-cursor-hide]"))
        }
        // Re-read what's under the pointer when the page changes without the mouse moving
        // (scrolling, or a case study opening under the cursor).
        let frame = 0
        const refresh = () => {
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(() => read(document.elementFromPoint(last.x, last.y)))
        }
        const onMove = (e: PointerEvent) => {
            if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return
            last.x = e.clientX
            last.y = e.clientY
            x.set(e.clientX)
            y.set(e.clientY)
            setVisible(true)
            read(e.target as Element | null)
        }
        const onLeave = (e: MouseEvent) => {
            if (!e.relatedTarget) setVisible(false)
        }
        const onDown = () => setDown(true)
        const onUp = () => {
            setDown(false)
            window.setTimeout(refresh, 120)
            window.setTimeout(refresh, 900)
        }
        window.addEventListener("pointermove", onMove, { passive: true })
        window.addEventListener("pointerdown", onDown)
        window.addEventListener("pointerup", onUp)
        window.addEventListener("scroll", refresh, { passive: true, capture: true })
        window.addEventListener("keyup", refresh)
        document.addEventListener("mouseout", onLeave)
        return () => {
            cancelAnimationFrame(frame)
            root.classList.remove("el-cursor-hide-native")
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerdown", onDown)
            window.removeEventListener("pointerup", onUp)
            window.removeEventListener("scroll", refresh, { capture: true })
            window.removeEventListener("keyup", refresh)
            document.removeEventListener("mouseout", onLeave)
        }
    }, [hideNative])

    const dotScale = !visible || label || hide ? 0 : hot ? 3.6 : down ? 0.6 : 1

    return (
        <>
            <style>{CSS}</style>
            {/* The blend mode sits on the fixed layer itself so it mixes with the page below. */}
            <div className="el el-cursor el-cursor--blend" aria-hidden="true">
                <motion.div style={{ x, y, position: "absolute" }}>
                    <motion.div className="el-cursor__dot" animate={{ scale: dotScale }} transition={{ duration: 0.35, ease: EASE_OUT }} />
                </motion.div>
            </div>
            <div className="el el-cursor" aria-hidden="true">
                <motion.div style={{ x: bx, y: by, position: "absolute" }}>
                    <AnimatePresence>
                        {visible && label && !hide && (
                            <motion.div
                                key="bubble"
                                className="el-cursor__bubble"
                                style={{ width: bubbleSize, height: bubbleSize, margin: `${-bubbleSize / 2}px 0 0 ${-bubbleSize / 2}px` }}
                                initial={{ scale: 0 }}
                                animate={{ scale: down ? 0.88 : 1 }}
                                exit={{ scale: 0 }}
                                transition={{ duration: 0.45, ease: EASE_OUT }}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.span key={label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                                        {label}
                                    </motion.span>
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </>
    )
}

export default function Cursor(props: Props) {
    const isStatic = isStaticTarget()
    const fine = useFinePointer()
    const mounted = useMounted()
    if (isStatic) return <CanvasNote title="Cursor" note="Custom cursor for mouse and trackpad. Add data-cursor=&quot;Label&quot; to any element to show a label." />
    if (!mounted || !fine) return null
    return createPortal(
        <>
            <ThemeStyles />
            <CursorLayer {...props} />
        </>,
        document.body
    )
}

addPropertyControls(Cursor, {
    hideNative: { type: ControlType.Boolean, title: "Hide system", defaultValue: true },
    bubbleSize: { type: ControlType.Number, title: "Bubble", defaultValue: 92, min: 56, max: 160, step: 2, unit: "px" },
})
