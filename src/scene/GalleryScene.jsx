import React from 'react';
import { Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import CameraRig from './CameraRig';
import ExhibitFrame from './ExhibitFrame';
import { exhibits } from '../data/exhibits';

function createStoneTexture(color, seed = 1, repeat = [1, 1]) {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  let value = seed;
  const random = () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };

  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 320; index += 1) {
    const tone = 210 + Math.floor(random() * 32);
    context.fillStyle = `rgba(${tone}, ${tone - 10}, ${tone - 26}, ${0.018 + random() * 0.035})`;
    context.fillRect(random() * 128, random() * 128, 0.7 + random() * 2.2, 0.7 + random() * 2.2);
  }

  for (let index = 0; index < 14; index += 1) {
    const y = random() * 128;
    context.strokeStyle = `rgba(117, 102, 80, ${0.018 + random() * 0.028})`;
    context.lineWidth = 0.5 + random() * 1.2;
    context.beginPath();
    context.moveTo(-20, y);
    context.bezierCurveTo(
      30,
      y + random() * 18 - 9,
      77,
      y + random() * 22 - 11,
      148,
      y + random() * 18 - 9
    );
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = 2;

  return texture;
}

function createLightMarbleTexture(seed = 17, repeat = [1, 1]) {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  let value = seed;
  const random = () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };

  const gradient = context.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#d2c2a6');
  gradient.addColorStop(0.52, '#eadcc2');
  gradient.addColorStop(1, '#bda98a');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);

  for (let index = 0; index < 420; index += 1) {
    const tone = 188 + Math.floor(random() * 44);
    context.fillStyle = `rgba(${tone}, ${tone - 12}, ${tone - 32}, ${0.018 + random() * 0.03})`;
    context.fillRect(random() * 256, random() * 256, 1 + random() * 2.8, 1 + random() * 2.8);
  }

  for (let index = 0; index < 12; index += 1) {
    const y = random() * 280 - 10;
    context.strokeStyle = `rgba(126, 103, 72, ${0.025 + random() * 0.035})`;
    context.lineWidth = 0.6 + random() * 1.2;
    context.beginPath();
    context.moveTo(-40, y);
    context.bezierCurveTo(
      60,
      y + random() * 48 - 24,
      163,
      y + random() * 62 - 31,
      276,
      y + random() * 54 - 27
    );
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = 4;

  return texture;
}

function LightMarbleFloorMaterial() {
  const marble = React.useMemo(() => createLightMarbleTexture(37, [1.25, 6.8]), []);

  React.useEffect(() => () => marble?.dispose(), [marble]);

  return (
    <meshStandardMaterial
      color="#e2d2b6"
      map={marble}
      roughness={0.34}
      metalness={0.015}
      envMapIntensity={0.34}
    />
  );
}

function StoneSurfaceMaterial({
  color = '#d8cbb8',
  roughness = 0.94,
  seed = 1,
  repeat = [1, 1],
  side,
}) {
  const [repeatX, repeatY] = repeat;
  const texture = React.useMemo(
    () => createStoneTexture(color, seed, [repeatX, repeatY]),
    [color, seed, repeatX, repeatY]
  );

  React.useEffect(() => () => texture?.dispose(), [texture]);

  return (
    <meshStandardMaterial
      color="#fffaf0"
      map={texture}
      bumpMap={texture}
      bumpScale={0.016}
      roughness={roughness}
      metalness={0.01}
      envMapIntensity={0.18}
      side={side}
    />
  );
}

function Wall({ position, scale, color = '#d4d4d4' }) {
  return (
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={scale} />
      <StoneSurfaceMaterial color={color} repeat={[2.4, 8.2]} seed={7} />
    </mesh>
  );
}

function PictureSideLamp({ side, z, intensity = 0.78 }) {
  return (
    <group
      position={[side * 5.68, 2.95, z]}
      rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
    >
      <mesh position={[0, 0, -0.018]} castShadow>
        <circleGeometry args={[0.24, 32]} />
        <meshStandardMaterial
          color="#2f251a"
          roughness={0.44}
          metalness={0.34}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, 0.018]} castShadow>
        <torusGeometry args={[0.205, 0.017, 10, 36]} />
        <BronzeMaterial color="#947247" roughness={0.34} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <torusGeometry args={[0.155, 0.012, 8, 28]} />
        <meshBasicMaterial color="#ffd18b" transparent opacity={0.36} />
      </mesh>
      <mesh position={[-0.105, 0.22, 0.058]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.03, 0.44, 0.012]} />
        <meshBasicMaterial color="#f4b45f" transparent opacity={0.16} />
      </mesh>
      <mesh position={[0.105, 0.22, 0.058]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[0.03, 0.44, 0.012]} />
        <meshBasicMaterial color="#f4b45f" transparent opacity={0.16} />
      </mesh>
      <mesh position={[-0.105, -0.22, 0.058]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[0.03, 0.44, 0.012]} />
        <meshBasicMaterial color="#f4b45f" transparent opacity={0.13} />
      </mesh>
      <mesh position={[0.105, -0.22, 0.058]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.03, 0.44, 0.012]} />
        <meshBasicMaterial color="#f4b45f" transparent opacity={0.13} />
      </mesh>
      <pointLight position={[0, 0, 0.42]} intensity={intensity} distance={3.4} color="#efba78" />
    </group>
  );
}

function BronzeMaterial({ color = '#5a432b', roughness = 0.42 }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0.42}
      envMapIntensity={0.34}
    />
  );
}

function createVaultRibShape() {
  const shape = new THREE.Shape();

  shape.moveTo(-5.82, 4.82);
  shape.quadraticCurveTo(-3.36, 6.32, 0, 6.5);
  shape.quadraticCurveTo(3.36, 6.32, 5.82, 4.82);
  shape.lineTo(5.42, 4.74);
  shape.quadraticCurveTo(3.08, 6.02, 0, 6.18);
  shape.quadraticCurveTo(-3.08, 6.02, -5.42, 4.74);
  shape.lineTo(-5.82, 4.82);

  return shape;
}

function Hallway() {
  const hallwayStartZ = 8.8;
  const hallwayEndZ = -42;
  const hallwayLength = hallwayStartZ - hallwayEndZ;
  const hallwayCenterZ = (hallwayStartZ + hallwayEndZ) / 2;
  const getWallLampZ = (side) => {
    const wallZ = exhibits
      .filter((exhibit) => exhibit.side === side)
      .map((exhibit) => exhibit.position[2])
      .sort((a, b) => b - a);
    const gap = wallZ.length > 1 ? Math.abs(wallZ[0] - wallZ[1]) : 6;

    return [
      wallZ[0] + gap / 2,
      ...wallZ.slice(0, -1).map((z, index) => (z + wallZ[index + 1]) / 2),
      wallZ[wallZ.length - 1] - gap / 2,
    ];
  };
  const leftLampZ = getWallLampZ('left');
  const rightLampZ = getWallLampZ('right');
  const vaultRibShape = createVaultRibShape();
  const vaultSegments = Array.from({ length: 15 }, (_, index) => {
    const progress = index / 14;
    const offset = progress * 2 - 1;
    const x = offset * 5.58;
    const curve = Math.sqrt(Math.max(0, 1 - offset * offset));
    return {
      x,
      y: 4.84 + curve * 1.34,
      rotation: -offset * 0.58,
      color: index % 2 === 0 ? '#d8cbb7' : '#d2c4ae',
    };
  });

  return (
    <group>
      <mesh position={[0, -0.08, hallwayCenterZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, hallwayLength]} />
        <LightMarbleFloorMaterial />
      </mesh>
      {[-4.5, -2.25, 0, 2.25, 4.5].map((x) => (
        <mesh key={`wood-long-${x}`} position={[x, -0.052, hallwayCenterZ]}>
          <boxGeometry args={[0.018, 0.01, hallwayLength - 0.4]} />
          <meshBasicMaterial color="#8b7658" transparent opacity={0.08} />
        </mesh>
      ))}
      {Array.from({ length: 22 }, (_, index) => -40.5 + index * 2.35).map((z) => (
        <mesh key={`wood-cross-${z}`} position={[0, -0.05, z]}>
          <boxGeometry args={[11.4, 0.01, 0.014]} />
          <meshBasicMaterial color="#8b7658" transparent opacity={0.065} />
        </mesh>
      ))}

      <Wall
        position={[-6.15, 2.78, hallwayCenterZ]}
        scale={[0.3, 5.76, hallwayLength]}
        color="#e6dbc8"
      />
      <Wall
        position={[6.15, 2.78, hallwayCenterZ]}
        scale={[0.3, 5.76, hallwayLength]}
        color="#e6dbc8"
      />
      {vaultSegments.map((segment, index) => (
        <mesh
          key={`vault-panel-${index}`}
          position={[segment.x, segment.y, hallwayCenterZ]}
          rotation={[0, 0, segment.rotation]}
          receiveShadow
        >
          <boxGeometry args={[0.92, 0.18, hallwayLength]} />
          <StoneSurfaceMaterial
            color={segment.color}
            roughness={0.95}
            repeat={[0.9, 7.4]}
            seed={19 + index}
          />
        </mesh>
      ))}

      {[-1, 1].map((side) => (
        <group key={`wall-detail-${side}`}>
          <mesh position={[side * 5.98, 0.78, hallwayCenterZ]}>
            <boxGeometry args={[0.035, 0.055, hallwayLength - 0.8]} />
            <BronzeMaterial color="#7a603a" roughness={0.5} />
          </mesh>
          <mesh position={[side * 5.98, 4.84, hallwayCenterZ]}>
            <boxGeometry args={[0.035, 0.06, hallwayLength - 0.8]} />
            <BronzeMaterial color="#8a7046" roughness={0.46} />
          </mesh>
          <mesh position={[side * 5.972, 4.18, hallwayCenterZ]}>
            <boxGeometry args={[0.016, 0.055, hallwayLength - 1.2]} />
            <meshBasicMaterial color="#2d2116" transparent opacity={0.16} depthWrite={false} />
          </mesh>
          <mesh position={[side * 5.965, 1.08, hallwayCenterZ]}>
            <boxGeometry args={[0.018, 0.12, hallwayLength - 1.2]} />
            <meshBasicMaterial color="#efbd72" transparent opacity={0.14} depthWrite={false} />
          </mesh>
          <mesh position={[side * 5.965, 4.26, hallwayCenterZ]}>
            <boxGeometry args={[0.018, 0.13, hallwayLength - 1.2]} />
            <meshBasicMaterial color="#efbd72" transparent opacity={0.18} depthWrite={false} />
          </mesh>
          <mesh position={[side * 5.955, 1.08, hallwayCenterZ]}>
            <boxGeometry args={[0.012, 0.38, hallwayLength - 1.2]} />
            <meshBasicMaterial color="#f4c987" transparent opacity={0.045} depthWrite={false} />
          </mesh>
          <mesh position={[side * 5.955, 4.26, hallwayCenterZ]}>
            <boxGeometry args={[0.012, 0.38, hallwayLength - 1.2]} />
            <meshBasicMaterial color="#f4c987" transparent opacity={0.065} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {Array.from({ length: 11 }, (_, index) => -39.5 + index * 4).map((z, index) => (
        <group key={`ceiling-bay-${z}`}>
          <mesh position={[0, 0, z - 0.08]} receiveShadow castShadow>
            <extrudeGeometry args={[vaultRibShape, { depth: 0.16, bevelEnabled: false }]} />
            <StoneSurfaceMaterial color="#c6b79f" roughness={0.93} repeat={[1.8, 0.7]} seed={43} />
          </mesh>
          <mesh position={[0, 0, z + 0.1]} receiveShadow>
            <extrudeGeometry args={[vaultRibShape, { depth: 0.035, bevelEnabled: false }]} />
            <meshBasicMaterial color="#f0cf8b" transparent opacity={0.045} />
          </mesh>
          <mesh position={[0, 4.5, z + 1.65]}>
            <cylinderGeometry args={[0.08, 0.12, 0.08, 22]} />
            <BronzeMaterial color="#4d3a25" roughness={0.38} />
          </mesh>
          {index % 2 === 0 ? (
            <pointLight
              position={[0, 5.2, z + 1.65]}
              intensity={0.34}
              distance={4.1}
              color="#e3ad69"
            />
          ) : null}
        </group>
      ))}

      {leftLampZ.map((z) => (
        <PictureSideLamp key={`left-ring-lamp-${z}`} side={-1} z={z} />
      ))}
      {rightLampZ.map((z) => (
        <PictureSideLamp key={`right-ring-lamp-${z}`} side={1} z={z} />
      ))}

      {/* Edit exhibit frame positions in src/data/exhibits.js. */}
      {exhibits.map((exhibit) => (
        <ExhibitFrame key={exhibit.id} exhibit={exhibit} />
      ))}
    </group>
  );
}

function FloatingContactPlaque({ position = [0, 3.15, 8.28] }) {
  const plaqueWidth = 3.84;
  const plaqueHeight = 3.55;
  const links = [
    { icon: 'mail', title: 'Email', href: 'mailto:aayush.khunger217@gmail.com' },
    {
      icon: 'linkedin',
      title: 'LinkedIn',
      href: 'https://www.linkedin.com/in/aayush-khunger-7024901b1/',
    },
    { icon: 'github', title: 'GitHub', href: 'https://github.com/Aayush-047' },
  ];

  const ICONS = {
    mail: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d9ad61" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>`,
    linkedin: `<svg width="26" height="26" viewBox="0 0 24 24" fill="#d9ad61"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
    github: `<svg width="26" height="26" viewBox="0 0 24 24" fill="#d9ad61"><path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.84 9.71.5.09.68-.22.68-.49v-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.33 9.33 0 0 1 12 6.94c.85 0 1.71.12 2.51.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.11 10.11 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z"/></svg>`,
  };

  // Refs for the overlay div and anchor group
  const overlayRef = React.useRef(null);
  const groupRef = React.useRef(null);
  const worldPosition = React.useRef(new THREE.Vector3());
  const cameraDirection = React.useRef(new THREE.Vector3());
  const cameraToPoint = React.useRef(new THREE.Vector3());

  // Build the overlay imperatively — zero JSX, zero R3F reconciler involvement
  React.useEffect(() => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

    const row = document.createElement('div');
    row.style.cssText =
      'position:absolute;transform:translate(-50%,-50%) scale(0);opacity:0;display:flex;gap:18px;align-items:center;justify-content:center;pointer-events:none;transition:none;';
    overlay.appendChild(row);

    links.forEach((link) => {
      const a = document.createElement('a');
      a.href = link.href;
      if (!link.href.startsWith('mailto:')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.setAttribute('aria-label', link.title);
      a.style.cssText = [
        'pointer-events:auto',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'width:60px',
        'height:60px',
        'border-radius:50%',
        'background:rgba(20,13,6,0.82)',
        'border:1.5px solid #c69a4e',
        'cursor:pointer',
        'text-decoration:none',
        'transition:background 0.18s,border-color 0.18s,transform 0.18s',
        'box-shadow:0 2px 16px rgba(0,0,0,0.5)',
      ].join(';');
      a.innerHTML = ICONS[link.icon];
      a.addEventListener('mouseenter', () => {
        a.style.background = 'rgba(198,154,78,0.22)';
        a.style.borderColor = '#f0c978';
        a.style.transform = 'scale(1.12)';
      });
      a.addEventListener('mouseleave', () => {
        a.style.background = 'rgba(20,13,6,0.82)';
        a.style.borderColor = '#c69a4e';
        a.style.transform = 'scale(1)';
      });
      row.appendChild(a);
    });

    // Store row ref so useFrame can reposition it
    overlayRef.current._row = row;

    return () => document.body.removeChild(overlay);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { camera, size } = useThree();

  useFrame(() => {
    if (!groupRef.current || !overlayRef.current?._row) return;

    const worldPos = worldPosition.current;
    groupRef.current.getWorldPosition(worldPos);

    const dist = camera.position.distanceTo(worldPos);

    // Scale: 0 at distance 12, full size at distance 4
    const near = 4;
    const far = 12;
    const t = THREE.MathUtils.clamp((far - dist) / (far - near), 0, 1);
    // Ease in with a curve so it feels natural
    const scale = t * t * (3 - 2 * t); // smoothstep

    overlayRef.current._row.style.transform = `translate(-50%, -50%) scale(${scale})`;
    overlayRef.current._row.style.opacity = String(scale);

    if (dist > far) {
      overlayRef.current._row.style.display = 'none';
      return;
    }

    // Cull if behind camera
    const camDir = cameraDirection.current;
    camera.getWorldDirection(camDir);
    const toPoint = cameraToPoint.current.copy(worldPos).sub(camera.position);
    if (toPoint.dot(camDir) <= 0) {
      overlayRef.current._row.style.display = 'none';
      return;
    }

    worldPos.project(camera);
    const x = (worldPos.x * 0.5 + 0.5) * size.width;
    const y = (worldPos.y * -0.5 + 0.5) * size.height;

    const margin = 200;
    if (x < -margin || x > size.width + margin || y < -margin || y > size.height + margin) {
      overlayRef.current._row.style.display = 'none';
      return;
    }

    overlayRef.current._row.style.display = 'flex';
    overlayRef.current._row.style.left = `${x}px`;
    overlayRef.current._row.style.top = `${y}px`;
  });

  return (
    <group position={position}>
      {/* Invisible anchor — getWorldPosition reads from here */}
      <group ref={groupRef} position={[0, -0.5, 0.14]} />

      {/* All original 3D geometry unchanged */}
      <mesh position={[0.1, -0.12, -0.08]}>
        <boxGeometry args={[plaqueWidth + 0.08, plaqueHeight + 0.08, 0.05]} />
        <meshBasicMaterial color="#050302" transparent opacity={0.34} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[plaqueWidth, plaqueHeight, 0.09]} />
        <meshPhysicalMaterial
          color="#e6c28b"
          transparent
          opacity={0.5}
          roughness={0.28}
          metalness={0.02}
          transmission={0.2}
          thickness={0.22}
          clearcoat={1}
          clearcoatRoughness={0.2}
          envMapIntensity={0.48}
        />
      </mesh>
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[plaqueWidth - 0.16, plaqueHeight - 0.16, 0.018]} />
        <meshPhysicalMaterial
          color="#fff2d6"
          transparent
          opacity={0.22}
          roughness={0.24}
          transmission={0.18}
          thickness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.2}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, plaqueHeight / 2 - 0.16, 0.055]}>
        <boxGeometry args={[plaqueWidth - 0.42, 0.018, 0.012]} />
        <BronzeMaterial color="#c69a4e" roughness={0.24} />
      </mesh>
      <mesh position={[0, -plaqueHeight / 2 + 0.16, 0.055]}>
        <boxGeometry args={[plaqueWidth - 0.42, 0.018, 0.012]} />
        <BronzeMaterial color="#c69a4e" roughness={0.26} />
      </mesh>
      <mesh position={[0, plaqueHeight / 2 - 0.02, 0.09]}>
        <boxGeometry args={[plaqueWidth + 0.12, 0.026, 0.016]} />
        <BronzeMaterial color="#d4a252" roughness={0.36} />
      </mesh>
      <mesh position={[0, -plaqueHeight / 2 + 0.02, 0.09]}>
        <boxGeometry args={[plaqueWidth + 0.12, 0.026, 0.016]} />
        <BronzeMaterial color="#d4a252" roughness={0.36} />
      </mesh>
      <mesh position={[-plaqueWidth / 2 - 0.06, 0, 0.09]}>
        <boxGeometry args={[0.026, plaqueHeight + 0.08, 0.016]} />
        <BronzeMaterial color="#d4a252" roughness={0.36} />
      </mesh>
      <mesh position={[plaqueWidth / 2 + 0.06, 0, 0.09]}>
        <boxGeometry args={[0.026, plaqueHeight + 0.08, 0.016]} />
        <BronzeMaterial color="#d4a252" roughness={0.36} />
      </mesh>
      <mesh position={[0, plaqueHeight / 2 - 0.18, 0.104]}>
        <boxGeometry args={[plaqueWidth - 0.26, 0.018, 0.014]} />
        <BronzeMaterial color="#f0c978" roughness={0.34} />
      </mesh>
      <mesh position={[0, -plaqueHeight / 2 + 0.18, 0.104]}>
        <boxGeometry args={[plaqueWidth - 0.26, 0.018, 0.014]} />
        <BronzeMaterial color="#f0c978" roughness={0.34} />
      </mesh>
      <mesh position={[-plaqueWidth / 2 + 0.18, 0, 0.104]}>
        <boxGeometry args={[0.018, plaqueHeight - 0.28, 0.014]} />
        <BronzeMaterial color="#f0c978" roughness={0.34} />
      </mesh>
      <mesh position={[plaqueWidth / 2 - 0.18, 0, 0.104]}>
        <boxGeometry args={[0.018, plaqueHeight - 0.28, 0.014]} />
        <BronzeMaterial color="#f0c978" roughness={0.34} />
      </mesh>
      {[
        [-1.68, 1.46],
        [1.68, 1.46],
        [-1.68, -1.46],
        [1.68, -1.46],
      ].map(([x, y]) => (
        <group key={`cm-${x}-${y}`} position={[x, y, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.045, 0.045, 0.012, 28]} />
            <meshStandardMaterial
              color="#201711"
              roughness={0.28}
              metalness={0.3}
              envMapIntensity={0.38}
            />
          </mesh>
        </group>
      ))}
      <Text
        position={[0, 0.74, 0.095]}
        fontSize={0.3}
        maxWidth={3.0}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#d9ad61"
        fontWeight={850}
      >
        Let's Connect
      </Text>
    </group>
  );
}

function ArchedContactNiche() {
  const upperTrimLift = 0.18;

  return (
    <group position={[0, 2.58, 8.45]}>
      <mesh position={[-2.5, 1.51 + upperTrimLift, 0.04]}>
        <boxGeometry args={[0.052, 1.98, 0.04]} />
        <BronzeMaterial color="#d4a252" roughness={0.36} />
      </mesh>
      <mesh position={[2.5, 1.51 + upperTrimLift, 0.04]}>
        <boxGeometry args={[0.052, 1.98, 0.04]} />
        <BronzeMaterial color="#d4a252" roughness={0.36} />
      </mesh>
      <mesh position={[0, 2.5 + upperTrimLift, 0.04]}>
        <boxGeometry args={[5.05, 0.052, 0.04]} />
        <BronzeMaterial color="#d4a252" roughness={0.36} />
      </mesh>
      <mesh position={[-2.22, 1.43 + upperTrimLift, 0.06]}>
        <boxGeometry args={[0.034, 1.92, 0.032]} />
        <BronzeMaterial color="#f0c978" roughness={0.34} />
      </mesh>
      <mesh position={[2.22, 1.43 + upperTrimLift, 0.06]}>
        <boxGeometry args={[0.034, 1.92, 0.032]} />
        <BronzeMaterial color="#f0c978" roughness={0.34} />
      </mesh>
      <mesh position={[0, 2.39 + upperTrimLift, 0.06]}>
        <boxGeometry args={[4.48, 0.034, 0.032]} />
        <BronzeMaterial color="#f0c978" roughness={0.34} />
      </mesh>

      <mesh position={[-2.5, -1.13, 0.04]}>
        <boxGeometry args={[0.052, 1.98, 0.04]} />
        <BronzeMaterial color="#d4a252" roughness={0.36} />
      </mesh>
      <mesh position={[2.5, -1.13, 0.04]}>
        <boxGeometry args={[0.052, 1.98, 0.04]} />
        <BronzeMaterial color="#d4a252" roughness={0.36} />
      </mesh>
      <mesh position={[0, -2.12, 0.04]}>
        <boxGeometry args={[5.05, 0.052, 0.04]} />
        <BronzeMaterial color="#d4a252" roughness={0.36} />
      </mesh>
      <mesh position={[0, -2.06, 0.07]}>
        <boxGeometry args={[4.72, 0.032, 0.026]} />
        <meshBasicMaterial color="#ffb85f" transparent opacity={0} />
      </mesh>
      <mesh position={[0, -1.98, 0.065]}>
        <boxGeometry args={[4.9, 0.14, 0.018]} />
        <meshBasicMaterial color="#ff9f3f" transparent opacity={0} depthWrite={false} />
      </mesh>
      <pointLight position={[0, -1.78, 0.42]} intensity={1.16} distance={3.6} color="#ffb15a" />

      <mesh position={[-2.22, -1.05, 0.06]}>
        <boxGeometry args={[0.034, 1.92, 0.032]} />
        <BronzeMaterial color="#f0c978" roughness={0.34} />
      </mesh>
      <mesh position={[2.22, -1.05, 0.06]}>
        <boxGeometry args={[0.034, 1.92, 0.032]} />
        <BronzeMaterial color="#f0c978" roughness={0.34} />
      </mesh>
      <mesh position={[0, -2.01, 0.06]}>
        <boxGeometry args={[4.48, 0.034, 0.032]} />
        <BronzeMaterial color="#f0c978" roughness={0.34} />
      </mesh>
    </group>
  );
}

function CentralDomeSculpture() {
  const sculptureRef = React.useRef(null);
  const spinBoost = React.useRef(0);
  const [hovered, setHovered] = React.useState(false);
  const { invalidate } = useThree();

  useFrame((state, delta) => {
    if (!sculptureRef.current) return;

    const targetSpeed = hovered ? 0.9 : 0.22;
    sculptureRef.current.rotation.y += delta * (targetSpeed + spinBoost.current);
    sculptureRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.045;

    if (spinBoost.current > 0) {
      spinBoost.current = Math.max(0, spinBoost.current - delta * 1.8);
      invalidate();
    } else if (hovered) {
      invalidate();
    }
  });

  return (
    <group
      position={[0, 0.48, 10.05]}
      scale={[0.45, 0.45, 0.45]}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        invalidate();
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
        invalidate();
      }}
      onClick={(event) => {
        event.stopPropagation();
        spinBoost.current = 2.8;
        invalidate();
      }}
    >
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.98, 1.12, 0.7, 32]} />
        <meshStandardMaterial color="#15100d" roughness={0.42} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.82, 0.92, 0.14, 32]} />
        <meshStandardMaterial color="#2a211b" roughness={0.36} metalness={0.24} />
      </mesh>
      <mesh position={[0, -0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.78, 0.18, 28]} />
        <meshStandardMaterial color="#0c0907" roughness={0.5} metalness={0.18} />
      </mesh>
      <Text
        position={[0, 0.46, 0.9]}
        fontSize={0.26}
        maxWidth={0.7}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#d7ad62"
        fontWeight={850}
      >
        AK
      </Text>
      <group ref={sculptureRef} position={[0, 0.56, 0]}>
        <mesh position={[0, 0.24, 0]} rotation={[0.4, 0.2, 0.2]} castShadow>
          <torusKnotGeometry args={[0.42, 0.045, 72, 10]} />
          <meshStandardMaterial
            color={hovered ? '#f0dfbd' : '#d8caa8'}
            roughness={0.52}
            metalness={0.08}
            envMapIntensity={0.36}
          />
        </mesh>
        <mesh position={[0, 0.82, 0]} rotation={[Math.PI / 2.8, 0.25, 0]} castShadow>
          <torusGeometry args={[0.62, 0.025, 10, 64]} />
          <meshStandardMaterial
            color={hovered ? '#f2e2bd' : '#e0d2ae'}
            roughness={0.5}
            metalness={0.08}
            envMapIntensity={0.34}
          />
        </mesh>
        <mesh position={[0, 0.82, 0]} rotation={[Math.PI / 2.8, 0.25, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.48, 0.022, 10, 56]} />
          <meshStandardMaterial
            color="#c9a360"
            roughness={0.32}
            metalness={0.5}
            envMapIntensity={0.42}
          />
        </mesh>
        <mesh position={[0, 0.82, 0]} castShadow>
          <sphereGeometry args={[0.12, 20, 12]} />
          <meshStandardMaterial
            color="#c79b4f"
            roughness={0.24}
            metalness={0.62}
            envMapIntensity={0.48}
          />
        </mesh>
      </group>
    </group>
  );
}

function Atrium() {
  return (
    <group position={[0, 0, -50]}>
      <ArchedContactNiche />
      <FloatingContactPlaque />
      <CentralDomeSculpture />

      <mesh position={[0, 0.075, 10.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.55, 48]} />
        <meshBasicMaterial color="#efba6b" transparent opacity={0.07} depthWrite={false} />
      </mesh>

      <spotLight
        position={[0, 4.95, 9.65]}
        intensity={2.25}
        angle={0.36}
        penumbra={0.9}
        distance={7.5}
        color="#f0c27a"
        castShadow
      />
      <spotLight
        position={[0, 3.05, 9.25]}
        intensity={0.65}
        angle={0.5}
        penumbra={0.92}
        distance={4.8}
        color="#e5a95f"
      />
      <pointLight position={[-2.2, 2.6, 8.62]} intensity={0.32} distance={3.2} color="#d79b55" />
      <pointLight position={[2.2, 2.6, 8.62]} intensity={0.32} distance={3.2} color="#d79b55" />
      <pointLight position={[0, 1.1, 10.18]} intensity={0.28} distance={2.6} color="#f1bd73" />
    </group>
  );
}

export default function GalleryScene() {
  return (
    <>
      <color attach="background" args={['#17100b']} />
      <fog attach="fog" args={['#b9a686', 18, 76]} />

      <ambientLight intensity={0.33} />

      <Hallway />
      <Atrium />

      <CameraRig />
    </>
  );
}
