import { NAV } from "@/content";
import LiquidGradient from "@/components/fx/liquid-gradient";
import Cursor from "@/components/fx/cursor";
import ScrollRail from "@/components/fx/scroll-rail";
import { Skiper19 as River } from "@/components/ui/svg-follow-scroll";
import { Nav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { Statement } from "@/components/site/statement";
import { Experience } from "@/components/site/experience";
import { Projects } from "@/components/site/projects";
import { Record, Skills } from "@/components/site/details";
import { Contact } from "@/components/site/contact";

const RAIL = [{ id: "top", label: "Start" }, ...NAV];

export default function App() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <LiquidGradient />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main id="main" tabIndex={-1} className="relative">
        <Hero />
        {/* the valley: the river runs behind every chapter, down to the pond */}
        <div className="valley relative">
          <River />
          <div className="relative z-10">
            <Statement />
            <Experience />
            <Projects />
            <Skills />
            <Record />
          </div>
        </div>
        <Contact />
      </main>
      <ScrollRail sections={RAIL} />
      <Cursor />
    </>
  );
}
