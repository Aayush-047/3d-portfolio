import React, { useEffect, useState } from "react";
import { CAMERA_NAV_JUMP_EVENT, getCameraNavTargets } from "../scene/CameraRig";

const cameraTargets = getCameraNavTargets();
const navItems = [
  { label: "Who Am I", progress: cameraTargets["who-am-i"] },
  { label: "Skills", progress: cameraTargets.skills },
  { label: "Experience", progress: cameraTargets["reach-vantage"] },
  { label: "Contact", progress: cameraTargets.contact }
];
const navTargets = [{ label: "AK", progress: cameraTargets.home }, ...navItems];

function scrollToProgress(progress) {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({
    top: Math.max(0, maxScroll * progress),
    behavior: "auto"
  });
  window.dispatchEvent(new CustomEvent(CAMERA_NAV_JUMP_EVENT, { detail: { progress } }));
}

export default function Navbar() {
  const [active, setActive] = useState(navTargets[0].label);

  useEffect(() => {
    let frame = 0;

    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        const current = navTargets.reduce((best, item) => {
          return Math.abs(item.progress - progress) < Math.abs(best.progress - progress)
            ? item
            : best;
        }, navTargets[0]);
        setActive(current.label);
      });
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <nav className="portfolio-nav" aria-label="Portfolio sections">
      <button
        type="button"
        className={active === "AK" ? "portfolio-nav__brand is-active" : "portfolio-nav__brand"}
        onClick={() => scrollToProgress(cameraTargets.home)}
        aria-label="Back to intro"
        data-cursor="Go"
      >
        AK
      </button>
      {navItems.map((item) => (
        <button
          key={item.label}
          type="button"
          className={active === item.label ? "portfolio-nav__item is-active" : "portfolio-nav__item"}
          onClick={() => scrollToProgress(item.progress)}
          data-cursor="Go"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
