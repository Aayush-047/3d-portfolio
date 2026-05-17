import React, { Suspense } from "react";
import CustomCursor from "./components/CustomCursor";
import MuseumLoader from "./components/MuseumLoader";
import Navbar from "./components/Navbar";

const GalleryCanvas = React.lazy(() => import("./components/GalleryCanvas"));
const IntroScene = React.lazy(() => import("./intro/IntroScene"));

function useDeferredGalleryLoad() {
  const [loadGallery, setLoadGallery] = React.useState(() => {
    return typeof window !== "undefined" && window.scrollY > 0;
  });

  React.useEffect(() => {
    if (loadGallery) return undefined;

    let idleId = 0;
    let timeoutId = 0;

    function load() {
      setLoadGallery(true);
    }

    function handleScroll() {
      if (window.scrollY > window.innerHeight * 0.2) load();
    }

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(load, { timeout: 2400 });
    } else {
      timeoutId = window.setTimeout(load, 1800);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (idleId) window.cancelIdleCallback(idleId);
      window.clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loadGallery]);

  return loadGallery;
}

export default function App() {
  const loadGallery = useDeferredGalleryLoad();

  return (
    <main className="relative min-h-[1900vh] bg-neutral-950 text-white">
      <div className="fixed inset-0">
        {loadGallery ? (
          <Suspense fallback={<MuseumLoader label="Opening gallery" fixed />}>
            <GalleryCanvas />
          </Suspense>
        ) : null}
      </div>

      <Suspense fallback={<MuseumLoader label="Lighting the entrance" fixed />}>
        <IntroScene />
      </Suspense>
      <Navbar />
      <CustomCursor />
    </main>
  );
}
