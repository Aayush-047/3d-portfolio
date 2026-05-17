import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CURSOR_EVENT } from "../components/CustomCursor";

function createStoneTexture(base = [242, 237, 228], vein = [206, 201, 190]) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const image = context.createImageData(canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const index = (y * canvas.width + x) * 4;
      const wave =
        Math.sin((x + y * 0.68) * 0.07) * 0.5 +
        Math.sin((x * 0.4 - y) * 0.052) * 0.32;
      const grain = (Math.random() - 0.5) * 10;
      const veinMix = Math.max(0, wave - 0.5) * 0.16;

      image.data[index] = base[0] + grain + (vein[0] - base[0]) * veinMix;
      image.data[index + 1] = base[1] + grain + (vein[1] - base[1]) * veinMix;
      image.data[index + 2] = base[2] + grain + (vein[2] - base[2]) * veinMix;
      image.data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 2.2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSoftShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 63);

  gradient.addColorStop(0, "rgba(255,255,255,0.28)");
  gradient.addColorStop(0.52, "rgba(255,255,255,0.08)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function InteractiveSculpture({ progress }) {
  const group = useRef();
  const ring = useRef();
  const dragging = useRef(false);
  const previousX = useRef(0);
  const dragRotation = useRef(0);
  const hovered = useRef(false);
  const stoneTexture = useMemo(() => createStoneTexture(), []);
  const pedestalTexture = useMemo(
    () => createStoneTexture([241, 235, 224], [204, 197, 183]),
    []
  );
  const shadowTexture = useMemo(() => createSoftShadowTexture(), []);

  useEffect(() => {
    return () => {
      stoneTexture.dispose();
      pedestalTexture.dispose();
      shadowTexture.dispose();
    };
  }, [pedestalTexture, shadowTexture, stoneTexture]);

  useFrame(({ clock }) => {
    if (!group.current) return;

    const breathe = Math.sin(clock.elapsedTime * 1.12) * 0.035;
    const baseScale = 0.44;
    const hoverScale = hovered.current ? 1.025 : 1;

    group.current.rotation.y = clock.elapsedTime * 0.28 + dragRotation.current + progress * 0.75;
    group.current.position.y = 0.12 + breathe - progress * 1.05;
    group.current.position.z = progress * -0.75;
    group.current.scale.setScalar(baseScale * hoverScale * (1 - progress * 0.12));

    if (ring.current) {
      ring.current.rotation.x = Math.PI / 2 + Math.sin(clock.elapsedTime * 0.55) * 0.1;
      ring.current.rotation.z = clock.elapsedTime * 0.16;
    }
  });

  function handlePointerDown(event) {
    event.stopPropagation();
    dragging.current = true;
    previousX.current = event.clientX;
    event.target.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!dragging.current) return;
    const delta = event.clientX - previousX.current;
    previousX.current = event.clientX;
    dragRotation.current += delta * 0.01;
  }

  function handlePointerUp(event) {
    dragging.current = false;
    event.target.releasePointerCapture?.(event.pointerId);
  }

  function handlePointerOver(event) {
    event.stopPropagation();
    hovered.current = true;
    window.dispatchEvent(new CustomEvent(CURSOR_EVENT, { detail: { active: true, label: "Drag" } }));
  }

  function handlePointerOut(event) {
    hovered.current = false;
    window.dispatchEvent(new CustomEvent(CURSOR_EVENT, { detail: { active: false, label: "" } }));
  }

  return (
    <group
      ref={group}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <mesh position={[0, -1.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.92, 64]} />
        <meshBasicMaterial
          color="#241b13"
          alphaMap={shadowTexture}
          transparent
          opacity={0.026}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -1.34, 0]}>
        <cylinderGeometry args={[0.64, 0.76, 0.1, 48]} />
        <meshStandardMaterial
          color="#f1eadf"
          map={pedestalTexture}
          bumpMap={pedestalTexture}
          bumpScale={0.01}
          roughness={0.86}
          metalness={0.02}
        />
      </mesh>
      <mesh position={[0, -1.17, 0]}>
        <cylinderGeometry args={[0.36, 0.48, 0.26, 48]} />
        <meshStandardMaterial
          color="#f3ece0"
          map={pedestalTexture}
          bumpMap={pedestalTexture}
          bumpScale={0.009}
          roughness={0.84}
          metalness={0.02}
        />
      </mesh>
      <mesh rotation={[0.3, -0.18, 0.12]}>
        <torusKnotGeometry args={[0.72, 0.18, 112, 14, 2, 3]} />
        <meshStandardMaterial
          color="#f2eadf"
          map={stoneTexture}
          bumpMap={stoneTexture}
          bumpScale={0.014}
          roughness={0.88}
          metalness={0.005}
        />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.96, 0.014, 12, 96]} />
        <meshStandardMaterial color="#4c3825" roughness={0.4} metalness={0.76} />
      </mesh>
      <mesh position={[0.44, 0.24, 0.45]}>
        <sphereGeometry args={[0.18, 24, 16]} />
        <meshStandardMaterial color="#bf8738" roughness={0.32} metalness={0.9} />
      </mesh>
    </group>
  );
}

export default function IntroSculptureCanvas({ progress }) {
  const opacity = 1 - THREE.MathUtils.smoothstep(progress, 0.76, 0.98);

  return (
    <div className="intro-sculpture" style={{ opacity, touchAction: "none" }}>
      <Canvas
        camera={{ position: [0, 0.1, 5.35], fov: 38, near: 0.2, far: 14 }}
        shadows={false}
        dpr={[1, 1.15]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <ambientLight intensity={0.48} color="#f3dfc1" />
        <directionalLight position={[-3, 4, 4]} intensity={1.08} color="#f6d3a4" />
        <spotLight
          position={[2.7, 3.4, 2.5]}
          angle={0.46}
          penumbra={0.72}
          intensity={1.48}
          color="#eecb93"
        />
        <InteractiveSculpture progress={progress} />
      </Canvas>
    </div>
  );
}
