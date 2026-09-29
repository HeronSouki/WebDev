import * as React from "react"
import { createRoot } from "react-dom/client"
import { withDefaults } from "framer"
import PreloaderC from "../framer/Preloader.tsx"
import CursorC from "../framer/Cursor.tsx"
import NavigationC from "../framer/Navigation.tsx"
import HeroC from "../framer/Hero.tsx"
import WorkC from "../framer/Work.tsx"
import MarqueeC from "../framer/Marquee.tsx"
import AboutC from "../framer/About.tsx"
import ContactC from "../framer/Contact.tsx"

const Preloader = withDefaults(PreloaderC)
const Cursor = withDefaults(CursorC)
const Navigation = withDefaults(NavigationC)
const Hero = withDefaults(HeroC)
const Work = withDefaults(WorkC)
const Marquee = withDefaults(MarqueeC)
const About = withDefaults(AboutC)
const Contact = withDefaults(ContactC)

// The page stack, top to bottom, exactly as it would sit on a Framer page.
function Page() {
    return (
        <>
            <Preloader />
            <Cursor />
            <Navigation />
            <main>
                <Hero />
                <Work />
                <Marquee />
                <About />
                <Contact />
            </main>
        </>
    )
}

createRoot(document.getElementById("root")!).render(<Page />)
