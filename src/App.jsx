import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import IntroScene from './intro/IntroScene';
import GalleryScene from './scene/GalleryScene';

export default function App() {
  return (
    <main className="relative min-h-[1900vh] bg-neutral-950 text-white">
      <div className="fixed inset-0">
        <Canvas
          shadows
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          camera={{ position: [0, 2.4, 14], fov: 60, near: 0.1, far: 160 }}
        >
          <GalleryScene />
        </Canvas>
      </div>

      <IntroScene />
      <Navbar />
      <CustomCursor />
    </main>
  );
}
