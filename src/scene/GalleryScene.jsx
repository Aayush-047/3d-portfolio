import React from 'react';
import { Html, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import CameraRig from './CameraRig';
import ExhibitFrame from './ExhibitFrame';
import { exhibits } from '../data/exhibits';

function createStoneTexture(color, seed = 1, repeat = [1, 1]) {
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

  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 950; index += 1) {
    const tone = 210 + Math.floor(random() * 32);
    context.fillStyle = `rgba(${tone}, ${tone - 10}, ${tone - 26}, ${0.018 + random() * 0.035})`;
    context.fillRect(random() * 256, random() * 256, 0.7 + random() * 2.4, 0.7 + random() * 2.4);
  }

  for (let index = 0; index < 34; index += 1) {
    const y = random() * 256;
    context.strokeStyle = `rgba(117, 102, 80, ${0.018 + random() * 0.028})`;
    context.lineWidth = 0.5 + random() * 1.2;
    context.beginPath();
    context.moveTo(-20, y);
    context.bezierCurveTo(
      60,
      y + random() * 18 - 9,
      154,
      y + random() * 22 - 11,
      276,
      y + random() * 18 - 9
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

function createLightMarbleTexture(seed = 17, repeat = [1, 1]) {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  let value = seed;
  const random = () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };

  const gradient = context.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#d2c2a6');
  gradient.addColorStop(0.52, '#eadcc2');
  gradient.addColorStop(1, '#bda98a');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);

  for (let index = 0; index < 1100; index += 1) {
    const tone = 188 + Math.floor(random() * 44);
    context.fillStyle = `rgba(${tone}, ${tone - 12}, ${tone - 32}, ${0.018 + random() * 0.03})`;
    context.fillRect(random() * 512, random() * 512, 1 + random() * 3.2, 1 + random() * 3.2);
  }

  for (let index = 0; index < 26; index += 1) {
    const y = random() * 540 - 20;
    context.strokeStyle = `rgba(126, 103, 72, ${0.025 + random() * 0.035})`;
    context.lineWidth = 0.6 + random() * 1.2;
    context.beginPath();
    context.moveTo(-40, y);
    context.bezierCurveTo(
      120,
      y + random() * 48 - 24,
      326,
      y + random() * 62 - 31,
      552,
      y + random() * 54 - 27
    );
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = 8;

  return texture;
}

function LightMarbleFloorMaterial() {
  const marble = React.useMemo(() => createLightMarbleTexture(37, [1.25, 6.8]), []);

  return (
    <meshPhysicalMaterial
      color="#e2d2b6"
      map={marble}
      roughness={0.28}
      metalness={0.015}
      clearcoat={0.46}
      clearcoatRoughness={0.32}
      reflectivity={0.32}
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

function Wall({ position, scale, color = '#d4d4d4', textured = false }) {
  return (
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={scale} />
      {textured ? (
        <StoneSurfaceMaterial color={color} repeat={[2.4, 8.2]} seed={7} />
      ) : (
        <LimestoneMaterial color={color} />
      )}
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
        <circleGeometry args={[0.24, 48]} />
        <meshStandardMaterial
          color="#2f251a"
          roughness={0.44}
          metalness={0.34}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, 0.018]} castShadow>
        <torusGeometry args={[0.205, 0.017, 12, 56]} />
        <BronzeMaterial color="#947247" roughness={0.34} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <torusGeometry args={[0.155, 0.012, 10, 42]} />
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

function LimestoneMaterial({ color = '#d8cbb8', roughness = 0.92 }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0.015}
      envMapIntensity={0.22}
    />
  );
}

function SlateMaterial({ color = '#202124' }) {
  return (
    <meshStandardMaterial color={color} roughness={0.78} metalness={0.06} envMapIntensity={0.18} />
  );
}

function DarkWoodMaterial({ color = '#24170f' }) {
  return (
    <meshStandardMaterial color={color} roughness={0.58} metalness={0.035} envMapIntensity={0.26} />
  );
}

const facadeSpeckles = Array.from({ length: 90 }, (_, index) => {
  const column = index % 15;
  const row = Math.floor(index / 15);
  return {
    x: -6.65 + column * 0.95 + (row % 2) * 0.16,
    y: 0.68 + row * 0.88,
    scale: [0.12 + (index % 4) * 0.055, 0.008 + (index % 3) * 0.004, 0.004],
    opacity: 0.024 + (index % 5) * 0.008,
  };
});

const facadeJoints = [-5.7, -4.15, -2.8, -1.4, 0, 1.4, 2.8, 4.15, 5.7];

function createArchShape(width, springY, topY, bottomY) {
  const halfWidth = width / 2;
  const radius = halfWidth;
  const centerY = springY;
  const shape = new THREE.Shape();

  shape.moveTo(-halfWidth, bottomY);
  shape.lineTo(-halfWidth, springY);
  shape.absarc(0, centerY, radius, Math.PI, 0, false);
  shape.lineTo(halfWidth, bottomY);
  shape.lineTo(-halfWidth, bottomY);

  return shape;
}

function createFlatBottomArchShape(width, springY, bottomY) {
  const halfWidth = width / 2;
  const radius = halfWidth;
  const shape = new THREE.Shape();

  shape.moveTo(-halfWidth, bottomY);
  shape.lineTo(-halfWidth, springY);
  shape.absarc(0, springY, radius, Math.PI, 0, false);
  shape.lineTo(halfWidth, bottomY);
  shape.lineTo(-halfWidth, bottomY);

  return shape;
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

function createFacadeShape(width, springY, topY, bottomY) {
  const halfWidth = width / 2;
  const radius = halfWidth;
  const centerY = springY;
  const shape = new THREE.Shape();

  shape.moveTo(-halfWidth, bottomY);
  shape.lineTo(-halfWidth, springY);
  shape.absarc(0, centerY, radius, Math.PI, 0, false);
  shape.lineTo(halfWidth, bottomY);
  shape.lineTo(-halfWidth, bottomY);

  return shape;
}

function createPedimentShape(width, height) {
  const shape = new THREE.Shape();
  const halfWidth = width / 2;

  shape.moveTo(-halfWidth, 0);
  shape.lineTo(0, height);
  shape.lineTo(halfWidth, 0);
  shape.lineTo(-halfWidth, 0);

  return shape;
}

function StoneBlock({ position, scale, rotation = [0, 0, 0], color = '#aaa196' }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <LimestoneMaterial color={color} />
    </mesh>
  );
}

function Column({ x, height = 3.55 }) {
  return (
    <group position={[x, 2.34, 3.62]} castShadow receiveShadow>
      <mesh position={[0, -height / 2 - 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.34, 0.18, 32]} />
        <LimestoneMaterial color="#d5c8b4" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.22, height, 36]} />
        <LimestoneMaterial color="#e0d3bf" roughness={0.88} />
      </mesh>
      <mesh position={[0, height / 2 + 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.28, 0.18, 32]} />
        <LimestoneMaterial color="#cbbda9" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0, 0.04]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.018, height * 0.86, 0.018]} />
        <LimestoneMaterial color="#b9ab98" />
      </mesh>
    </group>
  );
}

function Dome({ x = 0, y = 6.34, radius = 1.26, color = '#cfc2ad' }) {
  return (
    <group position={[x, y, 2.9]}>
      <mesh position={[0, -0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius * 0.78, radius * 0.86, 0.34, 40]} />
        <meshStandardMaterial color="#b7aa96" roughness={0.86} metalness={0.03} />
      </mesh>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[radius, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.82} metalness={0.03} />
      </mesh>
      <mesh position={[0, radius + 0.08, 0]} castShadow>
        <sphereGeometry args={[0.08, 20, 10]} />
        <meshStandardMaterial color="#a89777" roughness={0.62} metalness={0.18} />
      </mesh>
    </group>
  );
}

function Rosette({ position, scale = 1, color = '#c8b99f' }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh>
        <circleGeometry args={[0.08, 24]} />
        <meshStandardMaterial color={color} roughness={0.84} />
      </mesh>
      {[0, Math.PI / 3, (Math.PI * 2) / 3].map((rotation) => (
        <mesh key={rotation} rotation={[0, 0, rotation]}>
          <boxGeometry args={[0.22, 0.028, 0.014]} />
          <meshStandardMaterial color="#b6a68e" roughness={0.86} />
        </mesh>
      ))}
    </group>
  );
}

function ScrollRelief({ x, y, flip = 1, scale = 1 }) {
  return (
    <group position={[x, y, 3.66]} scale={[flip * scale, scale, scale]}>
      <mesh rotation={[0, 0, 0.72]}>
        <torusGeometry args={[0.19, 0.018, 10, 32, Math.PI * 1.45]} />
        <meshStandardMaterial color="#b9aa91" roughness={0.86} />
      </mesh>
      <mesh position={[0.18, -0.1, 0]} rotation={[0, 0, -0.36]}>
        <boxGeometry args={[0.34, 0.032, 0.018]} />
        <meshStandardMaterial color="#b9aa91" roughness={0.86} />
      </mesh>
    </group>
  );
}

function Hedge({ x, z, width }) {
  return (
    <group position={[x, 0.14, z]}>
      <mesh position={[0, 0.18, 0]} scale={[width, 0.32, 0.36]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.62, 0.62]} />
        <meshStandardMaterial color="#4f5c48" roughness={0.98} />
      </mesh>
      {[-0.42, -0.16, 0.14, 0.4].map((offset) => (
        <mesh
          key={offset}
          position={[offset * width, 0.38, 0.03]}
          scale={[0.38, 0.22, 0.3]}
          castShadow
        >
          <sphereGeometry args={[0.22, 18, 10]} />
          <meshStandardMaterial color={offset > 0 ? '#56664f' : '#465541'} roughness={0.98} />
        </mesh>
      ))}
    </group>
  );
}

function CentralDormer() {
  const crown = createArchShape(1.86, 6.48, 7.4, 5.92);

  return (
    <group>
      <mesh position={[0, 0, 3.32]} castShadow receiveShadow>
        <shapeGeometry args={[crown]} />
        <LimestoneMaterial color="#d8cab4" roughness={0.88} />
      </mesh>
      <mesh position={[0, 6.48, 3.58]} scale={[1, 1, 1]}>
        <circleGeometry args={[0.5, 48]} />
        <LimestoneMaterial color="#c6b69d" roughness={0.88} />
      </mesh>
      <mesh position={[0, 6.48, 3.62]} scale={[1, 1, 1]}>
        <circleGeometry args={[0.34, 48]} />
        <meshPhysicalMaterial
          color="#34414a"
          transparent
          opacity={0.72}
          roughness={0.18}
          metalness={0.06}
          reflectivity={0.6}
          clearcoat={0.7}
        />
      </mesh>
      <mesh position={[0, 6.48, 3.65]}>
        <boxGeometry args={[0.025, 0.62, 0.012]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
      <mesh position={[0, 6.48, 3.65]}>
        <boxGeometry args={[0.62, 0.025, 0.012]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
      <Rosette position={[0, 7.08, 3.64]} scale={0.92} />
      <ScrollRelief x={-0.78} y={6.08} flip={-1} scale={0.9} />
      <ScrollRelief x={0.78} y={6.08} flip={1} scale={0.9} />
      <mesh position={[0, 5.82, 3.62]}>
        <boxGeometry args={[1.86, 0.12, 0.08]} />
        <LimestoneMaterial color="#bdae96" roughness={0.88} />
      </mesh>
    </group>
  );
}

function MansardRoof() {
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-6.85, 5.82);
  roofShape.lineTo(-5.95, 7.1);
  roofShape.lineTo(5.95, 7.1);
  roofShape.lineTo(6.85, 5.82);
  roofShape.lineTo(-6.85, 5.82);

  const centralRoof = new THREE.Shape();
  centralRoof.moveTo(-2.1, 5.92);
  centralRoof.lineTo(-1.48, 7.65);
  centralRoof.lineTo(1.48, 7.65);
  centralRoof.lineTo(2.1, 5.92);
  centralRoof.lineTo(-2.1, 5.92);

  return (
    <group>
      <mesh position={[0, 0, 2.96]} castShadow receiveShadow>
        <shapeGeometry args={[roofShape]} />
        <SlateMaterial color="#232426" />
      </mesh>
      <mesh position={[0, 0, 3.08]}>
        <shapeGeometry args={[centralRoof]} />
        <SlateMaterial color="#191a1c" />
      </mesh>
      {[-5.0, -3.05, 3.05, 5.0].map((x) => (
        <mesh key={x} position={[x, 6.34, 3.18]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.7, 0.72, 0.08]} />
          <LimestoneMaterial color="#d9cbb5" roughness={0.88} />
        </mesh>
      ))}
      {[-5.0, -3.05, 3.05, 5.0].map((x) => (
        <FrenchWindow key={`roof-${x}`} x={x} y={6.34} scale={0.58} />
      ))}
      <CentralDormer />
      {[-5.6, -4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2, 5.6].map((x) => (
        <mesh key={`slate-${x}`} position={[x, 6.46, 3.19]}>
          <boxGeometry args={[0.025, 1.1, 0.012]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.045} />
        </mesh>
      ))}
      {[-6.2, -5.25, -4.3, -3.35, -2.4, -1.45, -0.5, 0.5, 1.45, 2.4, 3.35, 4.3, 5.25, 6.2].map(
        (x, index) => (
          <mesh key={`slate-h-${x}`} position={[x, 6.08 + (index % 3) * 0.28, 3.2]}>
            <boxGeometry args={[0.66, 0.012, 0.01]} />
            <meshBasicMaterial color="#0e0f11" transparent opacity={0.32} />
          </mesh>
        )
      )}
    </group>
  );
}

function FrenchWindow({ x, y, scale = 1, balcony = false }) {
  const outer = createArchShape(0.72 * scale, 0.22 * scale, 0.58 * scale, -0.58 * scale);
  const inner = createArchShape(0.5 * scale, 0.16 * scale, 0.41 * scale, -0.42 * scale);

  return (
    <group position={[x, y, 3.49]}>
      <mesh position={[0, 0, -0.05]} castShadow receiveShadow>
        <shapeGeometry args={[outer]} />
        <LimestoneMaterial color="#d8cab4" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <shapeGeometry args={[inner]} />
        <meshStandardMaterial
          color="#111312"
          roughness={0.32}
          metalness={0.34}
          envMapIntensity={0.45}
        />
      </mesh>
      <mesh position={[0, -0.04 * scale, 0.025]}>
        <shapeGeometry args={[inner]} />
        <meshPhysicalMaterial
          color="#5e7884"
          transparent
          opacity={0.58}
          roughness={0.1}
          metalness={0.02}
          reflectivity={0.76}
          clearcoat={0.9}
          envMapIntensity={0.8}
        />
      </mesh>
      <mesh position={[0.13 * scale, 0.08 * scale, 0.052]} rotation={[0, 0, -0.42]}>
        <boxGeometry args={[0.38 * scale, 0.018 * scale, 0.006]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.22} />
      </mesh>
      <mesh position={[0, -0.1 * scale, 0.04]}>
        <boxGeometry args={[0.024 * scale, 0.74 * scale, 0.012]} />
        <meshBasicMaterial color="#101010" />
      </mesh>
      <mesh position={[0, -0.16 * scale, 0.04]}>
        <boxGeometry args={[0.46 * scale, 0.018 * scale, 0.012]} />
        <meshBasicMaterial color="#101010" />
      </mesh>
      <mesh position={[0.08 * scale, -0.34 * scale, 0.03]}>
        <boxGeometry args={[0.3 * scale, 0.11 * scale, 0.01]} />
        <meshBasicMaterial color="#f2c36d" transparent opacity={0.22} />
      </mesh>
      {balcony && <Balcony width={1.12 * scale} y={-0.5 * scale} />}
    </group>
  );
}

function Balcony({ width = 1.12, y = -0.5 }) {
  const bars = [-0.38, -0.2, 0, 0.2, 0.38];

  return (
    <group position={[0, y, 0.09]}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[width, 0.026, 0.018]} />
        <meshStandardMaterial color="#111111" roughness={0.42} metalness={0.52} />
      </mesh>
      <mesh position={[0, -0.17, 0]}>
        <boxGeometry args={[width, 0.022, 0.014]} />
        <meshStandardMaterial color="#111111" roughness={0.42} metalness={0.52} />
      </mesh>
      {bars.map((x) => (
        <mesh key={x} position={[x * width, -0.05, 0]}>
          <boxGeometry args={[0.018, 0.27, 0.012]} />
          <meshStandardMaterial color="#111111" roughness={0.42} metalness={0.52} />
        </mesh>
      ))}
      {[-0.28, 0.28].map((x) => (
        <mesh
          key={`curl-${x}`}
          position={[x * width, -0.04, 0]}
          rotation={[0, 0, 0.72 * Math.sign(x)]}
        >
          <torusGeometry args={[0.08, 0.006, 8, 24, Math.PI * 1.18]} />
          <meshStandardMaterial color="#111111" roughness={0.42} metalness={0.52} />
        </mesh>
      ))}
    </group>
  );
}

function Lantern({ x, y }) {
  return (
    <group position={[x, y, 3.72]}>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.16, 0.04, 0.04]} />
        <meshStandardMaterial color="#1a1713" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[0.18, 0.32, 0.08]} />
        <meshStandardMaterial color="#211b14" roughness={0.38} metalness={0.55} />
      </mesh>
      <pointLight position={[0, -0.02, 0.2]} intensity={0.63} distance={2.2} color="#f2b866" />
      <mesh position={[0, -0.04, 0.05]}>
        <boxGeometry args={[0.12, 0.22, 0.01]} />
        <meshBasicMaterial color="#f6c675" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function PottedPlant({ x }) {
  return (
    <group position={[x, 0.3, 4.32]}>
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.3, 0.32, 24]} />
        <meshStandardMaterial color="#6f5f4f" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.42, 0]} scale={[1.0, 0.62, 0.8]} castShadow>
        <sphereGeometry args={[0.36, 28, 14]} />
        <meshStandardMaterial color="#4f6549" roughness={0.96} />
      </mesh>
    </group>
  );
}

function FacadeTexture() {
  return (
    <group>
      {facadeSpeckles.map((mark, index) => (
        <mesh key={index} position={[mark.x, mark.y, 3.245]}>
          <boxGeometry args={mark.scale} />
          <meshBasicMaterial color="#8f867b" transparent opacity={mark.opacity} />
        </mesh>
      ))}
      {facadeJoints.map((x) => (
        <mesh key={x} position={[x, 3.14, 3.238]}>
          <boxGeometry args={[0.005, 5.28, 0.004]} />
          <meshBasicMaterial color="#8d8378" transparent opacity={0.04} />
        </mesh>
      ))}
      {[1.28, 2.7, 4.12, 5.54].map((y) => (
        <mesh key={y} position={[0, y, 3.24]}>
          <boxGeometry args={[13.2, 0.006, 0.004]} />
          <meshBasicMaterial color="#8d8378" transparent opacity={0.035} />
        </mesh>
      ))}
    </group>
  );
}

function EntranceTitle() {
  return (
    <group>
      <mesh position={[0, 4.82, 3.705]} castShadow receiveShadow>
        <boxGeometry args={[4.95, 0.34, 0.055]} />
        <LimestoneMaterial color="#e6d7bf" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.63, 3.735]}>
        <boxGeometry args={[4.65, 0.018, 0.012]} />
        <meshBasicMaterial color="#6c5d49" transparent opacity={0.38} />
      </mesh>
      <Text
        position={[0.025, 4.79, 3.75]}
        fontSize={0.285}
        maxWidth={4.65}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#6b573d"
        outlineWidth={0.006}
        outlineColor="#d9c9af"
      >
        Welcome to Aayush's Portfolio
      </Text>
      <Text
        position={[0, 4.82, 3.775]}
        fontSize={0.285}
        maxWidth={4.65}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#25221d"
      >
        Welcome to Aayush's Portfolio
      </Text>
    </group>
  );
}

function DoorPanel({ x, rotationY = 0 }) {
  return (
    <group position={[x, 2.04, 3.42]} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.36, 3.56, 0.11]} />
        <DarkWoodMaterial color="#20130d" />
      </mesh>

      <mesh position={[0, 1.08, 0.064]}>
        <boxGeometry args={[1.0, 1.04, 0.028]} />
        <DarkWoodMaterial color="#312016" />
      </mesh>
      <mesh position={[0, -0.42, 0.064]}>
        <boxGeometry args={[1.0, 1.2, 0.028]} />
        <DarkWoodMaterial color="#312016" />
      </mesh>
      <mesh position={[0, 1.08, 0.09]}>
        <boxGeometry args={[0.62, 0.68, 0.012]} />
        <DarkWoodMaterial color="#1b100b" />
      </mesh>
      <mesh position={[0, -0.42, 0.09]}>
        <boxGeometry args={[0.62, 0.8, 0.012]} />
        <DarkWoodMaterial color="#1b100b" />
      </mesh>
      <mesh position={[0, 0.06, 0.104]}>
        <boxGeometry args={[0.024, 3.12, 0.01]} />
        <DarkWoodMaterial color="#5b4433" />
      </mesh>
      <mesh position={[0, 0.06, 0.112]}>
        <boxGeometry args={[0.78, 0.012, 0.008]} />
        <DarkWoodMaterial color="#6b513d" />
      </mesh>
      {[-0.46, -0.28, -0.1, 0.1, 0.28, 0.46].map((grain) => (
        <mesh key={grain} position={[grain, 0.04, 0.118]}>
          <boxGeometry args={[0.008, 3.0, 0.006]} />
          <meshBasicMaterial color="#7b5d45" transparent opacity={0.17} />
        </mesh>
      ))}

      <mesh position={[0, 1.64, 0.082]}>
        <boxGeometry args={[0.92, 0.035, 0.02]} />
        <meshStandardMaterial color="#8b6f43" roughness={0.45} metalness={0.3} />
      </mesh>
      <mesh position={[0, -1.26, 0.082]}>
        <boxGeometry args={[0.92, 0.035, 0.02]} />
        <meshStandardMaterial color="#8b6f43" roughness={0.45} metalness={0.3} />
      </mesh>
      <mesh position={[x > 0 ? -0.52 : 0.52, 0.02, 0.105]}>
        <sphereGeometry args={[0.045, 16, 10]} />
        <meshStandardMaterial color="#b7985d" roughness={0.32} metalness={0.45} />
      </mesh>
    </group>
  );
}

function SkyBackdrop() {
  const clouds = [
    [-6.2, 5.32, 1.8, 0.48],
    [-4.65, 5.48, 1.25, 0.34],
    [4.7, 5.42, 1.9, 0.5],
    [6.15, 5.24, 1.2, 0.32],
    [0.0, 5.9, 2.3, 0.36],
    [1.72, 5.98, 1.36, 0.28],
  ];

  return (
    <group>
      <mesh position={[0, 4.6, 1.4]}>
        <planeGeometry args={[38, 13]} />
        <meshBasicMaterial color="#c4d4dd" />
      </mesh>
      <mesh position={[0, 1.6, 1.43]}>
        <planeGeometry args={[38, 4.8]} />
        <meshBasicMaterial color="#ddd5c8" transparent opacity={0.34} />
      </mesh>
      <mesh position={[0, 6.45, 1.44]}>
        <planeGeometry args={[38, 3.2]} />
        <meshBasicMaterial color="#edf5fb" transparent opacity={0.22} />
      </mesh>
      {clouds.map(([x, y, width, height], index) => (
        <mesh key={index} position={[x, y, 1.5]} scale={[width, height, 1]}>
          <circleGeometry args={[0.62, 32]} />
          <meshBasicMaterial color="#f8fbff" transparent opacity={0.34} />
        </mesh>
      ))}
    </group>
  );
}

function EntranceEnvironment() {
  const walkwayDividersX = [-1.6, -0.8, 0, 0.8, 1.6];
  const walkwayDividersZ = [3.0, 3.85, 4.7, 5.55, 6.4, 7.25, 8.1, 8.95, 9.8];

  return (
    <group>
      <SkyBackdrop />
      <mesh position={[0, -0.12, 7.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[36, 14]} />
        <meshStandardMaterial color="#5f6758" roughness={0.99} />
      </mesh>
      <mesh position={[0, -0.105, 6.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, 8.4]} />
        <meshStandardMaterial color="#454648" roughness={0.92} />
      </mesh>
      <mesh position={[0, -0.095, 6.48]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.9, 7.85]} />
        <meshBasicMaterial color="#5a5b5d" transparent opacity={0.2} />
      </mesh>
      {walkwayDividersX.map((x) => (
        <mesh key={`walk-x-${x}`} position={[x, -0.074, 6.45]}>
          <boxGeometry args={[0.018, 0.012, 8.15]} />
          <meshBasicMaterial color="#252628" transparent opacity={0.58} />
        </mesh>
      ))}
      {walkwayDividersZ.map((z) => (
        <mesh key={`walk-z-${z}`} position={[0, -0.073, z]}>
          <boxGeometry args={[4.65, 0.012, 0.018]} />
          <meshBasicMaterial color="#252628" transparent opacity={0.58} />
        </mesh>
      ))}
      {[-1.2, 1.2].map((x) => (
        <mesh key={`paver-var-${x}`} position={[x, -0.071, 6.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.95, 5.6]} />
          <meshBasicMaterial color="#2f3032" transparent opacity={0.16} />
        </mesh>
      ))}
      <Hedge x={-4.0} z={5.25} width={2.8} />
      <Hedge x={4.0} z={5.25} width={2.8} />
      <Hedge x={-5.9} z={6.9} width={2.2} />
      <Hedge x={5.9} z={6.9} width={2.2} />
    </group>
  );
}

function EntranceStairs() {
  const steps = [
    { y: 0.02, z: 4.9, width: 7.2, depth: 0.58 },
    { y: 0.2, z: 4.6, width: 6.55, depth: 0.52 },
    { y: 0.38, z: 4.32, width: 5.9, depth: 0.48 },
    { y: 0.56, z: 4.06, width: 5.25, depth: 0.42 },
  ];

  return (
    <group>
      {steps.map((step, index) => (
        <mesh key={index} position={[0, step.y, step.z]} castShadow receiveShadow>
          <boxGeometry args={[step.width, 0.18, step.depth]} />
          <LimestoneMaterial color={index === 0 ? '#b7ab9c' : '#c5b9a8'} roughness={0.92} />
        </mesh>
      ))}
      <mesh position={[0, 0.58, 4.34]}>
        <boxGeometry args={[4.85, 0.018, 0.012]} />
        <meshBasicMaterial color="#6f665c" transparent opacity={0.42} />
      </mesh>
    </group>
  );
}

function introProgress(cameraZ) {
  return THREE.MathUtils.clamp((14.8 - cameraZ) / 12.2, 0, 1);
}

function MarbleFloor() {
  const veins = [
    [-3.6, 9.8, 1.2, -0.2],
    [-1.8, 6.2, 1.8, 0.28],
    [0.4, 8.2, 1.6, -0.15],
    [2.6, 5.4, 1.4, 0.22],
    [3.7, 11.6, 1.1, -0.32],
  ];

  return (
    <group>
      <mesh position={[0, -0.08, 6.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 19]} />
        <meshPhysicalMaterial
          color="#d7d0c3"
          roughness={0.24}
          metalness={0.02}
          clearcoat={0.72}
          clearcoatRoughness={0.18}
          reflectivity={0.42}
        />
      </mesh>
      {[-5.2, -2.6, 0, 2.6, 5.2].map((x) => (
        <mesh key={`floor-x-${x}`} position={[x, -0.066, 6.4]}>
          <boxGeometry args={[0.012, 0.01, 18.4]} />
          <meshBasicMaterial color="#8b8377" transparent opacity={0.18} />
        </mesh>
      ))}
      {[0.4, 3.0, 5.6, 8.2, 10.8, 13.4].map((z) => (
        <mesh key={`floor-z-${z}`} position={[0, -0.065, z]}>
          <boxGeometry args={[13.4, 0.01, 0.012]} />
          <meshBasicMaterial color="#8b8377" transparent opacity={0.18} />
        </mesh>
      ))}
      {veins.map(([x, z, width, rotation], index) => (
        <mesh key={index} position={[x, -0.058, z]} rotation={[0, rotation, 0]}>
          <boxGeometry args={[width, 0.008, 0.018]} />
          <meshBasicMaterial color="#f8f4ec" transparent opacity={0.22} />
        </mesh>
      ))}
    </group>
  );
}

function FogLayer() {
  const group = React.useRef();
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const progress = introProgress(camera.position.z);
    if (!group.current) return;

    group.current.position.x = Math.sin(clock.elapsedTime * 0.34) * 0.16;
    group.current.position.z = 0.2 - progress * 1.4;
    group.current.scale.setScalar(1 + progress * 0.36);
  });

  return (
    <group ref={group}>
      {[
        [-2.7, 0.08, 7.0, 2.4, 0.45],
        [0.1, 0.1, 6.2, 3.2, 0.52],
        [2.65, 0.08, 7.25, 2.1, 0.42],
        [-0.8, 0.07, 3.7, 2.5, 0.34],
      ].map(([x, y, z, width, opacity], index) => (
        <mesh
          key={index}
          position={[x, y, z]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[width, 0.42, 1]}
        >
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial
            color="#f4efe5"
            transparent
            opacity={opacity * 0.28}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function HeroSculpture() {
  const group = React.useRef();
  const ring = React.useRef();
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const progress = introProgress(camera.position.z);
    const breathe = Math.sin(clock.elapsedTime * 1.15) * 0.045;

    if (group.current) {
      group.current.position.y = 1.08 + breathe + progress * 0.12;
      group.current.rotation.y = clock.elapsedTime * 0.28 + progress * 0.9;
      group.current.scale.setScalar(1 + progress * 0.08);
    }
    if (ring.current) {
      ring.current.rotation.x = Math.PI / 2 + Math.sin(clock.elapsedTime * 0.55) * 0.12;
      ring.current.rotation.z = clock.elapsedTime * 0.18;
    }
  });

  return (
    <group ref={group} position={[0, 1.1, 6.05]} castShadow>
      <mesh position={[0, -0.98, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.05, 1.18, 0.18, 48]} />
        <meshStandardMaterial color="#bdb2a2" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.78, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.78, 0.9, 0.22, 48]} />
        <meshStandardMaterial color="#e5ded2" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0.28, 0, -0.32]} castShadow>
        <torusKnotGeometry args={[0.42, 0.115, 96, 14]} />
        <meshStandardMaterial color="#d7d0c4" roughness={0.52} metalness={0.04} />
      </mesh>
      <mesh ref={ring} position={[0, 0.04, 0]} castShadow>
        <torusGeometry args={[0.92, 0.035, 48, 96]} />
        <meshStandardMaterial color="#1f1b16" roughness={0.36} metalness={0.72} />
      </mesh>
      <mesh position={[0.05, 0.05, 0.02]} castShadow>
        <sphereGeometry args={[0.16, 32, 18]} />
        <meshStandardMaterial color="#a88042" roughness={0.24} metalness={0.82} />
      </mesh>
    </group>
  );
}

function PortalGate() {
  const leftDoor = React.useRef();
  const rightDoor = React.useRef();
  const warmLight = React.useRef();
  const { camera } = useThree();
  const arch = createArchShape(4.8, 2.42, 4.82, 0.18);
  const opening = createArchShape(3.34, 2.12, 3.78, 0.36);

  useFrame(() => {
    const progress = introProgress(camera.position.z);
    const open = THREE.MathUtils.smoothstep(progress, 0.28, 0.88);

    if (leftDoor.current) {
      leftDoor.current.rotation.y = -open * 1.08;
      leftDoor.current.position.x = -0.06 - open * 0.1;
    }
    if (rightDoor.current) {
      rightDoor.current.rotation.y = open * 1.08;
      rightDoor.current.position.x = 0.06 + open * 0.1;
    }
    if (warmLight.current) {
      warmLight.current.intensity = 1.2 + open * 4.8;
    }
  });

  return (
    <group position={[0, 0, 2.55]}>
      <mesh position={[0, 0, -0.05]} receiveShadow castShadow>
        <shapeGeometry args={[arch]} />
        <LimestoneMaterial color="#c8bca9" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <shapeGeometry args={[opening]} />
        <meshStandardMaterial color="#171411" roughness={0.72} metalness={0.12} />
      </mesh>
      <mesh position={[0, 2.5, 0.08]}>
        <boxGeometry args={[4.4, 0.18, 0.18]} />
        <LimestoneMaterial color="#dfd2be" />
      </mesh>
      <mesh position={[0, 4.2, 0.12]}>
        <boxGeometry args={[4.9, 0.16, 0.16]} />
        <LimestoneMaterial color="#b7aa96" />
      </mesh>
      {[-2.68, 2.68].map((x) => (
        <mesh key={x} position={[x, 2.15, 0.12]} castShadow>
          <boxGeometry args={[0.22, 4.0, 0.22]} />
          <LimestoneMaterial color="#d8ccb9" />
        </mesh>
      ))}
      <pointLight
        ref={warmLight}
        position={[0, 2.25, -0.75]}
        intensity={1.5}
        distance={7}
        color="#f4c277"
      />
      <mesh position={[0, 2.1, -0.55]}>
        <planeGeometry args={[3.05, 3.15]} />
        <meshBasicMaterial color="#f4c277" transparent opacity={0.22} />
      </mesh>
      <group ref={leftDoor} position={[-0.78, 1.72, 0.18]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.44, 2.82, 0.09]} />
          <DarkWoodMaterial color="#2b1a11" />
        </mesh>
        <mesh position={[0, 0.55, 0.065]}>
          <boxGeometry args={[0.96, 0.8, 0.035]} />
          <DarkWoodMaterial color="#3a2618" />
        </mesh>
        <mesh position={[0, -0.58, 0.065]}>
          <boxGeometry args={[0.96, 0.86, 0.035]} />
          <DarkWoodMaterial color="#3a2618" />
        </mesh>
      </group>
      <group ref={rightDoor} position={[0.78, 1.72, 0.18]}>
        <mesh castShadow>
          <boxGeometry args={[1.44, 2.82, 0.09]} />
          <DarkWoodMaterial color="#2b1a11" />
        </mesh>
        <mesh position={[0, 0.55, 0.065]}>
          <boxGeometry args={[0.96, 0.8, 0.035]} />
          <DarkWoodMaterial color="#3a2618" />
        </mesh>
        <mesh position={[0, -0.58, 0.065]}>
          <boxGeometry args={[0.96, 0.86, 0.035]} />
          <DarkWoodMaterial color="#3a2618" />
        </mesh>
      </group>
      <mesh position={[0, 4.58, 0.18]}>
        <boxGeometry args={[4.2, 0.44, 0.06]} />
        <LimestoneMaterial color="#e1d4c1" roughness={0.86} />
      </mesh>
      <Text
        position={[0, 4.59, 0.235]}
        fontSize={0.26}
        maxWidth={3.7}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#2f281f"
      >
        Welcome to Aayush's Portfolio
      </Text>
    </group>
  );
}

function IntroLobby() {
  return (
    <group>
      <MarbleFloor />
      <mesh position={[0, 2.58, 2.22]} receiveShadow>
        <boxGeometry args={[13.6, 5.32, 0.18]} />
        <LimestoneMaterial color="#d8cbb9" roughness={0.88} />
      </mesh>
      <mesh position={[-6.9, 2.25, 6.6]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[9.2, 4.7, 0.16]} />
        <LimestoneMaterial color="#d2c4b0" roughness={0.9} />
      </mesh>
      <mesh position={[6.9, 2.25, 6.6]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[9.2, 4.7, 0.16]} />
        <LimestoneMaterial color="#d2c4b0" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.72, 6.4]} receiveShadow>
        <boxGeometry args={[14.2, 0.18, 9.5]} />
        <LimestoneMaterial color="#cbbda8" roughness={0.92} />
      </mesh>
      <PortalGate />
      <HeroSculpture />
      <FogLayer />
      <spotLight
        position={[-3.8, 4.35, 8]}
        angle={0.36}
        penumbra={0.62}
        intensity={3.6}
        color="#f1c786"
        castShadow
      />
      <spotLight
        position={[3.8, 4.35, 8]}
        angle={0.36}
        penumbra={0.62}
        intensity={3.3}
        color="#f1c786"
        castShadow
      />
      <spotLight
        position={[0, 4.55, 5.5]}
        angle={0.28}
        penumbra={0.72}
        intensity={3.0}
        color="#f6d7a3"
        castShadow
      />
    </group>
  );
}

function BuildingExterior() {
  return null;

  const outerArch = createArchShape(4.5, 1.95, 4.2, 0.52);
  const innerArch = createArchShape(3.28, 2.0, 3.64, 0.48);
  const archReveal = createArchShape(3.84, 2.0, 3.92, 0.42);
  const windowXs = [-5.0, -3.2, 3.2, 5.0];

  return (
    <group>
      <EntranceEnvironment />

      <MansardRoof />

      <Wall position={[0, 3.16, 2.88]} scale={[13.6, 5.88, 0.32]} color="#d9cdb8" />
      <FacadeTexture />

      <Wall position={[0, 5.84, 3.08]} scale={[13.95, 0.24, 0.42]} color="#bdae97" />
      <mesh position={[0, 5.66, 3.29]}>
        <boxGeometry args={[13.65, 0.08, 0.012]} />
        <meshBasicMaterial color="#3d342b" transparent opacity={0.22} />
      </mesh>
      <Wall position={[0, 0.22, 3.08]} scale={[13.95, 0.26, 0.42]} color="#b5a48d" />
      {[-6.05, -4.15, -1.7, 1.7, 4.15, 6.05].map((x) => (
        <StoneBlock key={x} position={[x, 3.0, 3.14]} scale={[0.36, 5.52, 0.28]} color="#c8baa4" />
      ))}
      {[1.62, 3.02, 4.46].map((y) => (
        <Wall key={y} position={[0, y, 3.24]} scale={[13.35, 0.08, 0.08]} color="#b8aa96" />
      ))}

      {windowXs.map((x) => (
        <FrenchWindow key={`ground-${x}`} x={x} y={1.72} scale={1.18} />
      ))}
      {windowXs.map((x) => (
        <FrenchWindow key={`second-${x}`} x={x} y={3.56} scale={1.06} balcony />
      ))}
      {[-4.2, -2.55, 2.55, 4.2].map((x) => (
        <FrenchWindow key={`third-${x}`} x={x} y={4.95} scale={0.78} />
      ))}

      <mesh position={[0, 3.0, 3.23]}>
        <boxGeometry args={[5.65, 4.7, 0.24]} />
        <meshStandardMaterial color="#2b2925" roughness={0.82} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.96, 3.56]}>
        <boxGeometry args={[5.3, 0.1, 0.012]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} />
      </mesh>

      <mesh position={[0.18, 0, 2.98]}>
        <shapeGeometry args={[outerArch]} />
        <meshStandardMaterial color="#b2a48f" roughness={0.94} metalness={0.01} />
      </mesh>
      <mesh position={[0, 0, 3.13]}>
        <shapeGeometry args={[outerArch]} />
        <meshStandardMaterial color="#ddcfb8" roughness={0.92} metalness={0.01} />
      </mesh>
      <mesh position={[0, 0, 3.185]}>
        <shapeGeometry args={[archReveal]} />
        <meshStandardMaterial color="#3a352f" roughness={0.86} metalness={0.16} />
      </mesh>
      <mesh position={[0, 0, 3.18]}>
        <shapeGeometry args={[innerArch]} />
        <meshStandardMaterial color="#1f1d1a" roughness={0.82} />
      </mesh>

      <mesh position={[0, 4.66, 3.48]}>
        <boxGeometry args={[5.65, 0.32, 0.26]} />
        <meshStandardMaterial color="#d5c6ae" roughness={0.86} metalness={0.02} />
      </mesh>
      <mesh position={[0, 4.95, 3.48]}>
        <boxGeometry args={[4.55, 0.28, 0.18]} />
        <meshStandardMaterial color="#eadcc5" roughness={0.86} metalness={0.01} />
      </mesh>
      <Rosette position={[0, 4.96, 3.61]} scale={0.72} />
      <ScrollRelief x={-1.05} y={4.96} flip={-1} scale={0.58} />
      <ScrollRelief x={1.05} y={4.96} flip={1} scale={0.58} />
      <mesh position={[0, 4.58, 3.68]}>
        <boxGeometry args={[5.2, 0.35, 0.06]} />
        <meshStandardMaterial color="#efe3cd" roughness={0.86} metalness={0.01} />
      </mesh>

      {[-2.45, -1.48, 1.48, 2.45].map((x) => (
        <Column key={x} x={x} />
      ))}
      {[-2.45, -1.48, 1.48, 2.45].map((x) => (
        <mesh key={`column-shadow-${x}`} position={[x + 0.06, 0.58, 3.46]}>
          <boxGeometry args={[0.42, 0.12, 0.012]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.22} />
        </mesh>
      ))}

      <DoorPanel x={-0.72} />
      <DoorPanel x={0.72} />
      <mesh position={[0, 2.04, 3.505]}>
        <boxGeometry args={[0.028, 3.44, 0.045]} />
        <meshStandardMaterial color="#261811" roughness={0.72} />
      </mesh>
      <FrenchWindow x={0} y={3.62} scale={1.28} balcony />

      <EntranceStairs />
      <Lantern x={-2.9} y={2.2} />
      <Lantern x={2.9} y={2.2} />
      <PottedPlant x={-3.35} />
      <PottedPlant x={3.35} />
      <EntranceTitle />
    </group>
  );
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
        textured
      />
      <Wall
        position={[6.15, 2.78, hallwayCenterZ]}
        scale={[0.3, 5.76, hallwayLength]}
        color="#e6dbc8"
        textured
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

      {Array.from({ length: 11 }, (_, index) => -39.5 + index * 4).map((z) => (
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
          <pointLight
            position={[0, 5.2, z + 1.65]}
            intensity={0.39}
            distance={4.35}
            color="#e3ad69"
          />
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

// function FloatingContactPlaque({ position = [0, 3.15, 8.28] }) {
//   const plaqueWidth = 3.84;
//   const plaqueHeight = 3.55;
//   const links = [
//     { icon: 'mail', title: 'Email', href: 'mailto:aayush.khunger217@gmail.com' },
//     {
//       icon: 'linkedin',
//       title: 'LinkedIn',
//       href: 'https://www.linkedin.com/in/aayush-khunger-7024901b1/',
//     },
//     { icon: 'github', title: 'GitHub', href: 'https://github.com/Aayush-047' },
//   ];

//   const handleClick = (href) => {
//     if (href.startsWith('mailto:')) {
//       window.location.href = href;
//     } else {
//       window.open(href, '_blank', 'noopener,noreferrer');
//     }
//   };

//   return (
//     <group position={position}>
//       {/* ... all your existing mesh/geometry code stays exactly the same ... */}

//       <mesh position={[0.1, -0.12, -0.08]}>
//         <boxGeometry args={[plaqueWidth + 0.08, plaqueHeight + 0.08, 0.05]} />
//         <meshBasicMaterial color="#050302" transparent opacity={0.34} depthWrite={false} />
//       </mesh>

//       <mesh position={[0, 0, -0.04]}>
//         <boxGeometry args={[plaqueWidth, plaqueHeight, 0.09]} />
//         <meshPhysicalMaterial
//           color="#e6c28b"
//           transparent
//           opacity={0.5}
//           roughness={0.28}
//           metalness={0.02}
//           transmission={0.2}
//           thickness={0.22}
//           clearcoat={1}
//           clearcoatRoughness={0.2}
//           envMapIntensity={0.48}
//         />
//       </mesh>

//       <mesh position={[0, 0, 0.015]}>
//         <boxGeometry args={[plaqueWidth - 0.16, plaqueHeight - 0.16, 0.018]} />
//         <meshPhysicalMaterial
//           color="#fff2d6"
//           transparent
//           opacity={0.22}
//           roughness={0.24}
//           transmission={0.18}
//           thickness={0.08}
//           clearcoat={1}
//           clearcoatRoughness={0.2}
//           depthWrite={false}
//         />
//       </mesh>

//       <mesh position={[0, plaqueHeight / 2 - 0.16, 0.055]}>
//         <boxGeometry args={[plaqueWidth - 0.42, 0.018, 0.012]} />
//         <BronzeMaterial color="#c69a4e" roughness={0.24} />
//       </mesh>
//       <mesh position={[0, -plaqueHeight / 2 + 0.16, 0.055]}>
//         <boxGeometry args={[plaqueWidth - 0.42, 0.018, 0.012]} />
//         <BronzeMaterial color="#c69a4e" roughness={0.26} />
//       </mesh>
//       <mesh position={[0, plaqueHeight / 2 - 0.02, 0.09]}>
//         <boxGeometry args={[plaqueWidth + 0.12, 0.026, 0.016]} />
//         <BronzeMaterial color="#d4a252" roughness={0.36} />
//       </mesh>
//       <mesh position={[0, -plaqueHeight / 2 + 0.02, 0.09]}>
//         <boxGeometry args={[plaqueWidth + 0.12, 0.026, 0.016]} />
//         <BronzeMaterial color="#d4a252" roughness={0.36} />
//       </mesh>
//       <mesh position={[-plaqueWidth / 2 - 0.06, 0, 0.09]}>
//         <boxGeometry args={[0.026, plaqueHeight + 0.08, 0.016]} />
//         <BronzeMaterial color="#d4a252" roughness={0.36} />
//       </mesh>
//       <mesh position={[plaqueWidth / 2 + 0.06, 0, 0.09]}>
//         <boxGeometry args={[0.026, plaqueHeight + 0.08, 0.016]} />
//         <BronzeMaterial color="#d4a252" roughness={0.36} />
//       </mesh>
//       <mesh position={[0, plaqueHeight / 2 - 0.18, 0.104]}>
//         <boxGeometry args={[plaqueWidth - 0.26, 0.018, 0.014]} />
//         <BronzeMaterial color="#f0c978" roughness={0.34} />
//       </mesh>
//       <mesh position={[0, -plaqueHeight / 2 + 0.18, 0.104]}>
//         <boxGeometry args={[plaqueWidth - 0.26, 0.018, 0.014]} />
//         <BronzeMaterial color="#f0c978" roughness={0.34} />
//       </mesh>
//       <mesh position={[-plaqueWidth / 2 + 0.18, 0, 0.104]}>
//         <boxGeometry args={[0.018, plaqueHeight - 0.28, 0.014]} />
//         <BronzeMaterial color="#f0c978" roughness={0.34} />
//       </mesh>
//       <mesh position={[plaqueWidth / 2 - 0.18, 0, 0.104]}>
//         <boxGeometry args={[0.018, plaqueHeight - 0.28, 0.014]} />
//         <BronzeMaterial color="#f0c978" roughness={0.34} />
//       </mesh>

//       {[
//         [-1.68, 1.46],
//         [1.68, 1.46],
//         [-1.68, -1.46],
//         [1.68, -1.46],
//       ].map(([x, y]) => (
//         <group
//           key={`contact-mount-${x}-${y}`}
//           position={[x, y, 0.07]}
//           rotation={[Math.PI / 2, 0, 0]}
//         >
//           <mesh>
//             <cylinderGeometry args={[0.045, 0.045, 0.012, 28]} />
//             <meshStandardMaterial
//               color="#201711"
//               roughness={0.28}
//               metalness={0.3}
//               envMapIntensity={0.38}
//             />
//           </mesh>
//         </group>
//       ))}

//       <Text
//         position={[0, 0.74, 0.095]}
//         fontSize={0.3}
//         maxWidth={3.0}
//         textAlign="center"
//         anchorX="center"
//         anchorY="middle"
//         color="#d9ad61"
//         fontWeight={850}
//       >
//         Let's Connect
//       </Text>

//       {/* KEY FIX: removed `transform` prop and added explicit pointerEvents style */}
//       <group position={[0, -0.08, 0]}>
//         <Html
//           center
//           position={[0, 0, 0.14]}
//           distanceFactor={4.6}
//           className="contact-link-layer"
//           style={{ pointerEvents: 'auto' }}
//           zIndexRange={[100, 0]}
//         >
//           <div
//             className="contact-link-grid"
//             style={{
//               display: 'flex',
//               gap: '24px',
//               alignItems: 'center',
//               justifyContent: 'center',
//               pointerEvents: 'auto',
//             }}
//           >
//             {links.map((link) => (
//               <button
//                 key={link.title}
//                 onClick={() => handleClick(link.href)}
//                 aria-label={link.title}
//                 style={{
//                   background: 'rgba(30, 20, 10, 0.72)',
//                   border: '1.5px solid #c69a4e',
//                   borderRadius: '50%',
//                   width: '64px',
//                   height: '64px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   cursor: 'pointer',
//                   pointerEvents: 'auto',
//                   color: '#d9ad61',
//                   fontSize: '22px',
//                   fontWeight: 700,
//                   fontFamily: 'sans-serif',
//                   transition: 'background 0.2s, border-color 0.2s',
//                   outline: 'none',
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.background = 'rgba(198, 154, 78, 0.28)';
//                   e.currentTarget.style.borderColor = '#f0c978';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.background = 'rgba(30, 20, 10, 0.72)';
//                   e.currentTarget.style.borderColor = '#c69a4e';
//                 }}
//               >
//                 {link.icon === 'mail' && (
//                   <svg
//                     width="28"
//                     height="28"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="#d9ad61"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <rect x="2" y="4" width="20" height="16" rx="2" />
//                     <polyline points="2,4 12,13 22,4" />
//                   </svg>
//                 )}
//                 {link.icon === 'linkedin' && (
//                   <svg width="28" height="28" viewBox="0 0 24 24" fill="#d9ad61">
//                     <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
//                     <rect x="2" y="9" width="4" height="12" />
//                     <circle cx="4" cy="4" r="2" />
//                   </svg>
//                 )}
//                 {link.icon === 'github' && (
//                   <svg width="28" height="28" viewBox="0 0 24 24" fill="#d9ad61">
//                     <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.84 9.71.5.09.68-.22.68-.49v-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.33 9.33 0 0 1 12 6.94c.85 0 1.71.12 2.51.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.11 10.11 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" />
//                   </svg>
//                 )}
//               </button>
//             ))}
//           </div>
//         </Html>
//       </group>
//     </group>
//   );
// }

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

    const worldPos = new THREE.Vector3();
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
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const toPoint = worldPos.clone().sub(camera.position);
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

function DomeWindowChamber() {
  const chamberCenterZ = -3.55;
  const radius = 5.05;
  const wallPanels = React.useMemo(
    () => Array.from({ length: 15 }, (_, index) => 52 + index * 17),
    []
  );
  const glassPanels = React.useMemo(
    () => Array.from({ length: 17 }, (_, index) => 48 + index * 16),
    []
  );
  const ribs = React.useMemo(() => Array.from({ length: 18 }, (_, index) => 40 + index * 16), []);

  return (
    <group>
      <mesh position={[0, 2.62, chamberCenterZ]}>
        <sphereGeometry args={[radius + 0.18, 64, 22, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#9e927f"
          transparent
          opacity={0.18}
          roughness={0.18}
          metalness={0.02}
          transmission={0.14}
          thickness={0.12}
          clearcoat={0.75}
          clearcoatRoughness={0.2}
          envMapIntensity={0.32}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {wallPanels.map((angle) => {
        const radians = THREE.MathUtils.degToRad(angle);
        const x = Math.sin(radians) * (radius - 0.08);
        const z = chamberCenterZ + Math.cos(radians) * (radius - 0.08);

        return (
          <group key={`lower-wall-${angle}`} position={[x, 1.05, z]} rotation={[0, radians, 0]}>
            <mesh receiveShadow>
              <boxGeometry args={[1.08, 1.82, 0.18]} />
              <StoneSurfaceMaterial
                color="#e0d3c0"
                roughness={0.92}
                repeat={[0.8, 1.4]}
                seed={61 + angle}
              />
            </mesh>
            <mesh position={[0, 0.88, 0.105]}>
              <boxGeometry args={[1.02, 0.035, 0.026]} />
              <BronzeMaterial color="#7b623d" roughness={0.48} />
            </mesh>
          </group>
        );
      })}

      {glassPanels.map((angle) => {
        const radians = THREE.MathUtils.degToRad(angle);
        const x = Math.sin(radians) * (radius - 0.02);
        const z = chamberCenterZ + Math.cos(radians) * (radius - 0.02);

        return (
          <group key={`dome-window-${angle}`} position={[x, 3.25, z]} rotation={[0, radians, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.92, 2.5, 0.04]} />
              <meshPhysicalMaterial
                color="#b9a98e"
                transparent
                opacity={0.24}
                roughness={0.18}
                metalness={0.02}
                transmission={0.16}
                thickness={0.08}
                clearcoat={0.7}
                clearcoatRoughness={0.2}
                envMapIntensity={0.36}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0, 0.04, -0.032]}>
              <boxGeometry args={[0.84, 2.22, 0.018]} />
              <meshBasicMaterial
                color="#f1c482"
                transparent
                opacity={0.04}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      {ribs.map((angle) => {
        const radians = THREE.MathUtils.degToRad(angle);
        const x = Math.sin(radians) * radius;
        const z = chamberCenterZ + Math.cos(radians) * radius;

        return (
          <mesh
            key={`dome-rib-${angle}`}
            position={[x, 3.16, z]}
            rotation={[0, radians, 0]}
            castShadow
          >
            <boxGeometry args={[0.1, 3.02, 0.16]} />
            <BronzeMaterial color="#211711" roughness={0.4} />
          </mesh>
        );
      })}

      {[1.15, 2.05, 3.0].map((height, index) => (
        <mesh
          key={`lower-ring-${height}`}
          position={[0, height, chamberCenterZ]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[radius - 0.08, index === 2 ? 0.055 : 0.035, 12, 104]} />
          <BronzeMaterial color={index === 2 ? '#2c2017' : '#7b623d'} roughness={0.46} />
        </mesh>
      ))}

      {[3.42, 4.16, 4.78].map((height, index) => (
        <mesh
          key={`glass-roof-ring-${height}`}
          position={[0, height, chamberCenterZ]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[4.15 - index * 0.9, 0.045, 12, 104]} />
          <BronzeMaterial color="#201610" roughness={0.36} />
        </mesh>
      ))}

      {Array.from({ length: 14 }, (_, index) => index * (360 / 14)).map((angle) => {
        const radians = THREE.MathUtils.degToRad(angle);

        return (
          <mesh
            key={`roof-spoke-${angle}`}
            position={[Math.sin(radians) * 1.95, 4.42, chamberCenterZ + Math.cos(radians) * 1.95]}
            rotation={[0.42, radians, 0]}
          >
            <boxGeometry args={[0.07, 0.08, 4.15]} />
            <BronzeMaterial color="#1d140f" roughness={0.34} />
          </mesh>
        );
      })}

      <mesh position={[0, 5.18, chamberCenterZ]}>
        <cylinderGeometry args={[0.2, 0.32, 0.14, 36]} />
        <BronzeMaterial color="#1c130e" roughness={0.32} />
      </mesh>

      <mesh position={[0, 0.02, chamberCenterZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.15, 64]} />
        <meshPhysicalMaterial
          color="#9d7b54"
          roughness={0.28}
          metalness={0.03}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          reflectivity={0.32}
          envMapIntensity={0.28}
        />
      </mesh>
      <mesh position={[0, 0.055, chamberCenterZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.1, 64]} />
        <meshBasicMaterial color="#f3c174" transparent opacity={0.055} depthWrite={false} />
      </mesh>

      <mesh position={[0, 3.25, chamberCenterZ]}>
        <sphereGeometry args={[4.25, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial
          color="#d3a46e"
          transparent
          opacity={0.026}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
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
  const [hovered, setHovered] = React.useState(false);
  const [spinBoost, setSpinBoost] = React.useState(0);

  useFrame((state, delta) => {
    if (!sculptureRef.current) return;

    const targetSpeed = hovered ? 0.9 : 0.22;
    sculptureRef.current.rotation.y += delta * (targetSpeed + spinBoost);
    sculptureRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.045;

    if (spinBoost > 0) {
      setSpinBoost(Math.max(0, spinBoost - delta * 1.8));
    }
  });

  return (
    <group
      position={[0, 0.48, 10.05]}
      scale={[0.45, 0.45, 0.45]}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
      }}
      onClick={(event) => {
        event.stopPropagation();
        setSpinBoost(2.8);
      }}
    >
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.98, 1.12, 0.7, 48]} />
        <meshStandardMaterial color="#15100d" roughness={0.42} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.82, 0.92, 0.14, 48]} />
        <meshStandardMaterial color="#2a211b" roughness={0.36} metalness={0.24} />
      </mesh>
      <mesh position={[0, -0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.78, 0.18, 40]} />
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
          <torusKnotGeometry args={[0.42, 0.045, 96, 12]} />
          <meshStandardMaterial
            color={hovered ? '#f0dfbd' : '#d8caa8'}
            roughness={0.52}
            metalness={0.08}
            envMapIntensity={0.36}
          />
        </mesh>
        <mesh position={[0, 0.82, 0]} rotation={[Math.PI / 2.8, 0.25, 0]} castShadow>
          <torusGeometry args={[0.62, 0.025, 12, 88]} />
          <meshStandardMaterial
            color={hovered ? '#f2e2bd' : '#e0d2ae'}
            roughness={0.5}
            metalness={0.08}
            envMapIntensity={0.34}
          />
        </mesh>
        <mesh position={[0, 0.82, 0]} rotation={[Math.PI / 2.8, 0.25, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.48, 0.022, 12, 80]} />
          <meshStandardMaterial
            color="#c9a360"
            roughness={0.32}
            metalness={0.5}
            envMapIntensity={0.42}
          />
        </mesh>
        <mesh position={[0, 0.82, 0]} castShadow>
          <sphereGeometry args={[0.12, 28, 16]} />
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

      <BuildingExterior />
      <Hallway />
      <Atrium />

      <CameraRig />
    </>
  );
}
