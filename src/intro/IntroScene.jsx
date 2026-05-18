import React, { Suspense, useEffect, useRef, useState } from "react";

const IntroSculptureCanvas = React.lazy(() => import("./IntroSculptureCanvas"));

const introText = {
  name: "Aayush Khunger",
  role: "Software Engineer",
  action: "Enter Portfolio Gallery"
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(value, min, max) {
  const t = clamp((value - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t);
}

function useIntroProgress() {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  useEffect(() => {
    let frame = 0;

    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const distance = window.innerHeight * 2.1;
        const nextProgress = clamp(window.scrollY / distance, 0, 1);

        if (Math.abs(progressRef.current - nextProgress) > 0.002) {
          progressRef.current = nextProgress;
          setProgress(nextProgress);
        }
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

  return progress;
}

function useDeferredSculptureLoad(progress) {
  const [loadSculpture, setLoadSculpture] = useState(false);

  useEffect(() => {
    if (loadSculpture) return undefined;

    let idleId = 0;
    let timeoutId = 0;

    function load() {
      setLoadSculpture(true);
    }

    if (progress > 0.03) {
      load();
      return undefined;
    }

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(load, { timeout: 2600 });
    } else {
      timeoutId = window.setTimeout(load, 2000);
    }

    return () => {
      if (idleId) window.cancelIdleCallback(idleId);
      window.clearTimeout(timeoutId);
    };
  }, [loadSculpture, progress]);

  return loadSculpture;
}

const StaticPortalBackground = React.memo(({ progress }) => {
  const scale = 1 + progress * 0.075;
  const opacity = 1 - smoothstep(progress, 0.76, 1);
  const glow = smoothstep(progress, 0.34, 0.78);

  return (
    <div className="intro-background" style={{ opacity }}>
      <div
        className="intro-background__image"
        style={{
          transform: `scale(${scale}) translateY(${progress * -1.5}%)`
        }}
      />
      <div className="intro-background__shade" />
      <div
        className="intro-background__portal-glow"
        style={{ opacity: 0.18 + glow * 0.48 }}
      />
    </div>
  );
});

const IntroCaption = React.memo(({ progress }) => {
  const opacity = 1 - smoothstep(progress, 0.58, 0.92);

  return (
    <div
      className="intro-caption"
      style={{
        opacity,
        transform: `translateX(-50%) translateY(${-progress * 32}px)`
      }}
    >
      <h1>{introText.name}</h1>
      <p>{introText.role}</p>
      <button
        className="intro-caption__button"
        type="button"
        data-cursor="Enter"
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight * 2.15,
            behavior: "smooth"
          });
        }}
      >
        {introText.action}
      </button>
    </div>
  );
});

const RisingFog = React.memo(({ progress }) => {
  const rise = smoothstep(progress, 0.24, 0.9);
  const opacity = 0.22 + rise * 0.62;

  return (
    <div
      className="intro-fog"
      style={{
        opacity,
        transform: `translate3d(0, ${(1 - rise) * 46}%, 0) scale(${1 + rise * 0.14})`
      }}
    >
      <div className="intro-fog__bank intro-fog__bank--one" />
      <div className="intro-fog__bank intro-fog__bank--two" />
    </div>
  );
});

const PortalTransition = React.memo(({ progress }) => {
  const opacity = smoothstep(progress, 0.72, 1);

  return <div className="intro-transition" style={{ opacity }} />;
});

export default function IntroScene() {
  const progress = useIntroProgress();
  const loadSculpture = useDeferredSculptureLoad(progress);
  const hidden = progress >= 0.995;

  if (hidden) return null;

  return (
    <section
      className="intro-scene"
      aria-hidden={false}
      style={{
        opacity: 1,
        pointerEvents: "auto"
      }}
    >
      <StaticPortalBackground progress={progress} />
      {loadSculpture && progress < 0.98 ? (
        <Suspense fallback={null}>
          <IntroSculptureCanvas progress={progress} />
        </Suspense>
      ) : null}
      <IntroCaption progress={progress} />
      <RisingFog progress={progress} />
      <PortalTransition progress={progress} />
    </section>
  );
}
