import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CURSOR_EVENT } from "../components/CustomCursor";

const introText = {
  name: "Aayush Khunger",
  role: "Software Engineer",
  action: "Enter Portfolio Gallery"
};

function createStoneTexture(base = [242, 237, 228], vein = [206, 201, 190]) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const image = context.createImageData(canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const index = (y * canvas.width + x) * 4;
      const wave =
        Math.sin((x + y * 0.68) * 0.035) * 0.5 +
        Math.sin((x * 0.4 - y) * 0.026) * 0.32;
      const grain = (Math.random() - 0.5) * 12;
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
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(128, 128, 8, 128, 128, 126);

  gradient.addColorStop(0, "rgba(255,255,255,0.28)");
  gradient.addColorStop(0.52, "rgba(255,255,255,0.08)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function useIntroProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const distance = window.innerHeight * 2.1;
        setProgress(THREE.MathUtils.clamp(window.scrollY / distance, 0, 1));
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

function StaticPortalBackground({ progress }) {
  const scale = 1 + progress * 0.075;
  const opacity = 1 - THREE.MathUtils.smoothstep(progress, 0.76, 1);
  const glow = THREE.MathUtils.smoothstep(progress, 0.34, 0.78);

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

  useFrame(({ clock }) => {
    if (!group.current) return;

    const fade = 1 - THREE.MathUtils.smoothstep(progress, 0.58, 0.94);
    const breathe = Math.sin(clock.elapsedTime * 1.12) * 0.035;
    const baseScale = 0.44;
    const hoverScale = hovered.current ? 1.025 : 1;

    group.current.rotation.y = clock.elapsedTime * 0.28 + dragRotation.current + progress * 0.75;
    group.current.position.y = 0.12 + breathe - progress * 1.05;
    group.current.position.z = progress * -0.75;
    group.current.scale.setScalar(baseScale * hoverScale * (1 - progress * 0.12));

    group.current.traverse((child) => {
      if (child.material && "opacity" in child.material) {
        child.material.opacity = fade;
        child.material.transparent = fade < 1;
      }
    });

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
      <mesh position={[0, -1.43, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.92, 96]} />
        <meshBasicMaterial
          color="#241b13"
          alphaMap={shadowTexture}
          transparent
          opacity={0.026}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -1.34, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.64, 0.76, 0.1, 96]} />
        <meshPhysicalMaterial
          color="#f1eadf"
          map={pedestalTexture}
          bumpMap={pedestalTexture}
          bumpScale={0.01}
          roughness={0.86}
          metalness={0.02}
          clearcoat={0}
          clearcoatRoughness={0.9}
        />
      </mesh>
      <mesh position={[0, -1.17, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.48, 0.26, 96]} />
        <meshPhysicalMaterial
          color="#f3ece0"
          map={pedestalTexture}
          bumpMap={pedestalTexture}
          bumpScale={0.009}
          roughness={0.84}
          metalness={0.02}
          clearcoat={0}
          clearcoatRoughness={0.9}
        />
      </mesh>
      <mesh castShadow receiveShadow rotation={[0.3, -0.18, 0.12]}>
        <torusKnotGeometry args={[0.72, 0.18, 190, 18, 2, 3]} />
        <meshPhysicalMaterial
          color="#f2eadf"
          map={stoneTexture}
          bumpMap={stoneTexture}
          bumpScale={0.014}
          roughness={0.88}
          metalness={0.005}
          clearcoat={0}
          clearcoatRoughness={0.92}
          sheen={0.03}
        />
      </mesh>
      <mesh ref={ring} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.96, 0.014, 18, 160]} />
        <meshPhysicalMaterial
          color="#4c3825"
          roughness={0.4}
          metalness={0.76}
          clearcoat={0.12}
          clearcoatRoughness={0.38}
        />
      </mesh>
      <mesh position={[0.44, 0.24, 0.45]} castShadow>
        <sphereGeometry args={[0.18, 48, 48]} />
        <meshPhysicalMaterial
          color="#bf8738"
          roughness={0.32}
          metalness={0.9}
          clearcoat={0.26}
          clearcoatRoughness={0.28}
        />
      </mesh>
    </group>
  );
}

function SculptureCanvas({ progress }) {
  const opacity = 1 - THREE.MathUtils.smoothstep(progress, 0.76, 0.98);

  return (
    <div className="intro-sculpture" style={{ opacity }}>
      <Canvas camera={{ position: [0, 0.1, 5.35], fov: 38 }} shadows dpr={[1, 1.75]}>
        <ambientLight intensity={0.46} color="#f3dfc1" />
        <directionalLight
          position={[-3, 4, 4]}
          intensity={1.12}
          color="#f6d3a4"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-radius={5}
        />
        <spotLight
          position={[2.7, 3.4, 2.5]}
          angle={0.46}
          penumbra={0.72}
          intensity={1.72}
          color="#eecb93"
          castShadow
          shadow-radius={6}
        />
        <InteractiveSculpture progress={progress} />
      </Canvas>
    </div>
  );
}

function IntroCaption({ progress }) {
  const opacity = 1 - THREE.MathUtils.smoothstep(progress, 0.58, 0.92);

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
}

function RisingFog({ progress }) {
  const rise = THREE.MathUtils.smoothstep(progress, 0.22, 0.94);
  const opacity = 0.28 + rise * 0.72;

  return (
    <div
      className="intro-fog"
      style={{
        opacity,
        transform: `translateY(${(1 - rise) * 54}%) scale(${1 + rise * 0.2})`
      }}
    >
      <div className="intro-fog__bank intro-fog__bank--one" />
      <div className="intro-fog__bank intro-fog__bank--two" />
      <div className="intro-fog__bank intro-fog__bank--three" />
    </div>
  );
}

function PortalTransition({ progress }) {
  const opacity = THREE.MathUtils.smoothstep(progress, 0.72, 1);

  return <div className="intro-transition" style={{ opacity }} />;
}

export default function IntroScene() {
  const progress = useIntroProgress();
  const hidden = progress >= 0.995;

  return (
    <section
      className="intro-scene"
      aria-hidden={hidden}
      style={{
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto"
      }}
    >
      <StaticPortalBackground progress={progress} />
      <SculptureCanvas progress={progress} />
      <IntroCaption progress={progress} />
      <RisingFog progress={progress} />
      <PortalTransition progress={progress} />
    </section>
  );
}
