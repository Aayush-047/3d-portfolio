import React, { Suspense } from "react";
import CustomCursor from "./components/CustomCursor";
import MuseumLoader from "./components/MuseumLoader";
import Navbar from "./components/Navbar";

const GalleryCanvas = React.lazy(() => import("./components/GalleryCanvas"));
const IntroScene = React.lazy(() => import("./intro/IntroScene"));

export default function App() {
  return (
    <main className="relative min-h-[1900vh] bg-neutral-950 text-white">
      <div className="fixed inset-0">
        <Suspense fallback={<MuseumLoader label="Opening gallery" fixed />}>
          <GalleryCanvas />
        </Suspense>
      </div>

      <Suspense fallback={<MuseumLoader label="Lighting the entrance" fixed />}>
        <IntroScene />
      </Suspense>
      <Navbar />
      <CustomCursor />
    </main>
  );
}
