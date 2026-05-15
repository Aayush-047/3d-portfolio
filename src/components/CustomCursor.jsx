import React, { useEffect, useRef, useState } from "react";

const CURSOR_EVENT = "portfolio-cursor";

function getCursorTarget(target) {
  return target instanceof Element ? target.closest("[data-cursor]") : null;
}

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);
  const trailRefs = useRef([]);
  const trail = useRef([]);
  const pointer = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const dot = useRef({ x: 0, y: 0 });
  const lastTrailPoint = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState({ active: false, label: "" });

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointer.matches || reducedMotion.matches) return undefined;

    function enableOnPointer(event) {
      if (event.pointerType && event.pointerType !== "mouse") return;
      pointer.current = { x: event.clientX, y: event.clientY };
      dot.current = { x: event.clientX, y: event.clientY };
      ring.current = { x: event.clientX, y: event.clientY };
      lastTrailPoint.current = { x: event.clientX, y: event.clientY };
      trail.current = Array.from({ length: 30 }, () => ({
        x: event.clientX,
        y: event.clientY,
        life: 0,
        size: 0
      }));
      setEnabled(true);
      document.documentElement.classList.add("custom-cursor-enabled");
      window.removeEventListener("pointermove", enableOnPointer);
    }

    function disableForKeyboard(event) {
      if (event.key === "Tab") {
        setEnabled(false);
        trail.current = [];
        document.documentElement.classList.remove("custom-cursor-enabled");
        setState({ active: false, label: "" });
        window.addEventListener("pointermove", enableOnPointer, { passive: true });
      }
    }

    function handlePointerMove(event) {
      pointer.current = { x: event.clientX, y: event.clientY };
      const dx = event.clientX - lastTrailPoint.current.x;
      const dy = event.clientY - lastTrailPoint.current.y;

      if (Math.hypot(dx, dy) > 3 && trail.current.length) {
        const particle = trail.current.pop();
        trail.current.unshift({
          ...particle,
          x: event.clientX,
          y: event.clientY,
          life: 1,
          size: state.active ? 24 : 18
        });
        lastTrailPoint.current = { x: event.clientX, y: event.clientY };
      }

      const target = getCursorTarget(event.target);
      setState({
        active: Boolean(target),
        label: target?.dataset.cursor ?? ""
      });
    }

    function handlePointerOut(event) {
      if (!event.relatedTarget) setState({ active: false, label: "" });
    }

    function handleCustomCursor(event) {
      setState({
        active: Boolean(event.detail?.active),
        label: event.detail?.label ?? ""
      });
    }

    function animate() {
      dot.current.x += (pointer.current.x - dot.current.x) * 0.5;
      dot.current.y += (pointer.current.y - dot.current.y) * 0.5;
      ring.current.x += (pointer.current.x - ring.current.x) * 0.18;
      ring.current.y += (pointer.current.y - ring.current.y) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.current.x}px, ${dot.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${ring.current.x + 18}px, ${ring.current.y + 16}px, 0)`;
      }
      trail.current.forEach((particle, index) => {
        particle.life *= 0.92;
        const element = trailRefs.current[index];
        if (!element) return;
        const scale = Math.max(particle.life, 0.001);
        element.style.opacity = `${particle.life * 0.9}`;
        element.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        element.style.width = `${particle.size}px`;
        element.style.height = `${particle.size}px`;
      });

      frame.current = requestAnimationFrame(animate);
    }

    window.addEventListener("pointermove", enableOnPointer, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("keydown", disableForKeyboard);
    window.addEventListener(CURSOR_EVENT, handleCustomCursor);
    frame.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame.current);
      document.documentElement.classList.remove("custom-cursor-enabled");
      window.removeEventListener("pointermove", enableOnPointer);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("keydown", disableForKeyboard);
      window.removeEventListener(CURSOR_EVENT, handleCustomCursor);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className={state.active ? "custom-cursor is-active" : "custom-cursor"} aria-hidden="true">
      {Array.from({ length: 30 }, (_, index) => (
        <div
          key={index}
          ref={(element) => {
            trailRefs.current[index] = element;
          }}
          className="custom-cursor__trail"
        />
      ))}
      <div ref={ringRef} className="custom-cursor__ring" />
      <div ref={dotRef} className="custom-cursor__dot" />
      <div ref={labelRef} className="custom-cursor__label">
        {state.label}
      </div>
    </div>
  );
}

export { CURSOR_EVENT };
