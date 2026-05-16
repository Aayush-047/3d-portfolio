import React, { Suspense } from "react";
import { Html } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import MuseumLoader from "./MuseumLoader";

const GalleryScene = React.lazy(() => import("../scene/GalleryScene"));

export default function GalleryCanvas() {
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace
      }}
      camera={{ position: [0, 2.4, 14], fov: 60, near: 0.2, far: 95 }}
    >
      <Suspense
        fallback={
          <Html fullscreen>
            <MuseumLoader label="Arranging exhibits" />
          </Html>
        }
      >
        <GalleryScene />
      </Suspense>
    </Canvas>
  );
}
