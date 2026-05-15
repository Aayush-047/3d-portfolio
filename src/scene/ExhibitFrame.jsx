import React, { useState } from "react";
import { Text } from "@react-three/drei";
import { CURSOR_EVENT } from "../components/CustomCursor";

const CONTENT_Z = 0.11;
const ART_Z = 0.075;
const PLAQUE_WIDTH = 2.08;
const PLAQUE_HEIGHT = 2.72;
const PLAQUE_GOLD = "#d5ad5c";
const PLAQUE_DARK_GOLD = "#9a6f28";
const PLAQUE_INK = "#201b15";
const PLAQUE_BODY = "#201812";
const PLAQUE_MUTED = "#6f542a";
const CONTENT_LEFT = -0.62;
const CONTENT_WIDTH = 1.34;

function PaperPanel({ position = [0, 0], scale = [1, 1], color = "#fff0cf", opacity = 0.22 }) {
  return (
    <mesh position={[position[0], position[1], CONTENT_Z + 0.018]}>
      <boxGeometry args={[scale[0], scale[1], 0.012]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={opacity}
        roughness={0.32}
        metalness={0}
        clearcoat={0.8}
        clearcoatRoughness={0.26}
        depthWrite={false}
      />
    </mesh>
  );
}

function FramedArtwork({ accent, hovered = false }) {
  return (
    <group>
      <mesh position={[0.08, -0.08, -0.16]}>
        <boxGeometry args={[PLAQUE_WIDTH + 0.06, PLAQUE_HEIGHT + 0.06, 0.06]} />
        <meshBasicMaterial color="#1d1309" transparent opacity={0.14} depthWrite={false} />
      </mesh>

      <mesh position={[0, 0, -0.035]}>
        <boxGeometry args={[PLAQUE_WIDTH, PLAQUE_HEIGHT, 0.075]} />
        <meshPhysicalMaterial
          color="#f8edd6"
          transparent
          opacity={0.48}
          roughness={0.34}
          metalness={0}
          transmission={0.22}
          thickness={0.22}
          clearcoat={1}
          clearcoatRoughness={0.24}
          envMapIntensity={0.42}
        />
      </mesh>

      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[PLAQUE_WIDTH - 0.12, PLAQUE_HEIGHT - 0.12, 0.018]} />
        <meshPhysicalMaterial
          color="#fff5df"
          transparent
          opacity={0.28}
          roughness={0.3}
          metalness={0}
          transmission={0.2}
          thickness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.22}
          envMapIntensity={0.38}
        />
      </mesh>

      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[PLAQUE_WIDTH - 0.18, PLAQUE_HEIGHT - 0.18]} />
        <meshBasicMaterial color="#fff7e8" transparent opacity={0.07} depthWrite={false} />
      </mesh>

      <mesh position={[0, PLAQUE_HEIGHT / 2 - 0.035, 0.074]}>
        <boxGeometry args={[PLAQUE_WIDTH - 0.18, 0.01, 0.008]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.13} depthWrite={false} />
      </mesh>
      <mesh position={[0, -PLAQUE_HEIGHT / 2 + 0.035, 0.074]}>
        <boxGeometry args={[PLAQUE_WIDTH - 0.18, 0.01, 0.008]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh position={[-PLAQUE_WIDTH / 2 + 0.035, 0, 0.074]}>
        <boxGeometry args={[0.01, PLAQUE_HEIGHT - 0.18, 0.008]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh position={[PLAQUE_WIDTH / 2 - 0.035, 0, 0.074]}>
        <boxGeometry args={[0.01, PLAQUE_HEIGHT - 0.18, 0.008]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.07} depthWrite={false} />
      </mesh>

      <mesh position={[0, PLAQUE_HEIGHT / 2 - 0.12, 0.07]}>
        <boxGeometry args={[PLAQUE_WIDTH - 0.34, 0.018, 0.01]} />
        <meshStandardMaterial color={hovered ? accent : PLAQUE_GOLD} roughness={0.2} metalness={0.72} envMapIntensity={0.46} />
      </mesh>
      <mesh position={[0, -PLAQUE_HEIGHT / 2 + 0.12, 0.07]}>
        <boxGeometry args={[PLAQUE_WIDTH - 0.34, 0.018, 0.01]} />
        <meshStandardMaterial color={PLAQUE_GOLD} roughness={0.22} metalness={0.66} envMapIntensity={0.4} />
      </mesh>
      <mesh position={[-PLAQUE_WIDTH / 2 + 0.12, 0, 0.07]}>
        <boxGeometry args={[0.018, PLAQUE_HEIGHT - 0.34, 0.01]} />
        <meshStandardMaterial color={PLAQUE_GOLD} roughness={0.22} metalness={0.66} envMapIntensity={0.4} />
      </mesh>
      <mesh position={[PLAQUE_WIDTH / 2 - 0.12, 0, 0.07]}>
        <boxGeometry args={[0.018, PLAQUE_HEIGHT - 0.34, 0.01]} />
        <meshStandardMaterial color={PLAQUE_GOLD} roughness={0.22} metalness={0.66} envMapIntensity={0.4} />
      </mesh>

      {[
        [-0.75, PLAQUE_HEIGHT / 2 - 0.38, 1, -1],
        [0.75, PLAQUE_HEIGHT / 2 - 0.38, -1, -1],
        [-0.75, -PLAQUE_HEIGHT / 2 + 0.38, 1, 1],
        [0.75, -PLAQUE_HEIGHT / 2 + 0.38, -1, 1]
      ].map(([x, y, xDir, yDir]) => (
        <group key={`corner-${x}-${y}`}>
          <mesh position={[x + xDir * 0.11, y, 0.082]}>
            <boxGeometry args={[0.22, 0.01, 0.008]} />
            <meshBasicMaterial color={PLAQUE_GOLD} transparent opacity={0.58} />
          </mesh>
          <mesh position={[x, y + yDir * 0.11, 0.082]}>
            <boxGeometry args={[0.01, 0.22, 0.008]} />
            <meshBasicMaterial color={PLAQUE_GOLD} transparent opacity={0.58} />
          </mesh>
        </group>
      ))}

      {[
        [-0.84, PLAQUE_HEIGHT / 2 - 0.23],
        [0.84, PLAQUE_HEIGHT / 2 - 0.23],
        [-0.84, -PLAQUE_HEIGHT / 2 + 0.23],
        [0.84, -PLAQUE_HEIGHT / 2 + 0.23]
      ].map(([x, y]) => (
        <group key={`mount-${x}-${y}`} position={[x, y, 0.084]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh position={[0.006, -0.006, -0.006]}>
            <cylinderGeometry args={[0.034, 0.034, 0.006, 28]} />
            <meshBasicMaterial color="#1f1710" transparent opacity={0.18} depthWrite={false} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.026, 0.026, 0.012, 28]} />
            <meshStandardMaterial color="#21170f" roughness={0.34} metalness={0.18} envMapIntensity={0.32} />
          </mesh>
        </group>
      ))}

      <mesh position={[0.46, 0.72, ART_Z]}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.012} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Label({
  children,
  position,
  fontSize = 0.1,
  maxWidth = 1,
  color = "#292524",
  lineHeight = 1.04,
  anchorY = "middle",
  fontWeight = 500
}) {
  return (
    <Text
      position={[position[0], position[1], CONTENT_Z + 0.03]}
      fontSize={fontSize}
      lineHeight={lineHeight}
      maxWidth={maxWidth}
      textAlign="left"
      anchorX="left"
      anchorY={anchorY}
      color={color}
      fontWeight={fontWeight}
    >
      {children}
    </Text>
  );
}

function Chip({ label, position, width, fontSize = 0.046, accent }) {
  return (
    <group position={[position[0], position[1], 0]}>
      <PaperPanel position={[0, 0]} scale={[width, 0.13]} color="#fff0cf" opacity={0.28} />
      <mesh position={[-width / 2 + 0.032, 0, CONTENT_Z + 0.034]}>
        <boxGeometry args={[0.012, 0.066, 0.008]} />
        <meshBasicMaterial color={PLAQUE_GOLD} transparent opacity={0.72} />
      </mesh>
      <Text
        position={[0.018, 0, CONTENT_Z + 0.055]}
        fontSize={fontSize}
        maxWidth={width - 0.1}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={PLAQUE_INK}
        fontWeight={650}
      >
        {label}
      </Text>
    </group>
  );
}

function ChipRow({
  items,
  startX,
  startY,
  maxWidth = CONTENT_WIDTH,
  compact = false,
  accent
}) {
  let cursorX = startX;
  let cursorY = startY;

  return items.map((item) => {
    const width = compact
      ? Math.min(0.16 + item.length * 0.019, 0.48)
      : Math.min(0.2 + item.length * 0.024, 0.58);

    if (cursorX + width > startX + maxWidth) {
      cursorX = startX;
      cursorY -= compact ? 0.135 : 0.155;
    }

    const chip = (
      <Chip
        key={`${item}-${cursorX}-${cursorY}`}
        label={item}
        position={[cursorX + width / 2, cursorY]}
        width={width}
        fontSize={compact ? 0.036 : 0.046}
        accent={accent}
      />
    );

    cursorX += width + (compact ? 0.03 : 0.05);
    return chip;
  });
}

function FrameTitle({ title, accent }) {
  return (
    <group>
      <Text
        position={[0, 0.72, CONTENT_Z + 0.052]}
        fontSize={0.148}
        maxWidth={1.54}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={accent || PLAQUE_GOLD}
        fontWeight={800}
      >
        {title}
      </Text>
    </group>
  );
}

function AboutContent({ exhibit }) {
  return (
    <>
      <Text
        position={[0, 0.78, CONTENT_Z + 0.052]}
        fontSize={0.168}
        maxWidth={1.54}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={exhibit.color || PLAQUE_GOLD}
        fontWeight={850}
        fontStyle={exhibit.italicTitle ? "italic" : "normal"}
      >
        {exhibit.title}
      </Text>
      <Label
        position={[CONTENT_LEFT, -0.09]}
        fontSize={0.064}
        lineHeight={1.1}
        maxWidth={CONTENT_WIDTH}
        color={PLAQUE_BODY}
        fontWeight={600}
      >
        {exhibit.body}
      </Label>
    </>
  );
}

function SkillsContent({ exhibit }) {
  const skillLabelWidth = 0.46;

  return (
    <>
      <Text
        position={[0, 0.78, CONTENT_Z + 0.052]}
        fontSize={0.168}
        maxWidth={1.54}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={exhibit.color || PLAQUE_GOLD}
        fontWeight={850}
        fontStyle={exhibit.italicTitle ? "italic" : "normal"}
      >
        {exhibit.title}
      </Text>
      {exhibit.groups.map((group, index) => {
        const y = 0.42 - index * 0.22;

        return (
          <group key={group.label}>
            <Label
              position={[CONTENT_LEFT, y]}
              fontSize={0.055}
              lineHeight={1.08}
              maxWidth={skillLabelWidth}
              color="#4a2f16"
              fontWeight={850}
              anchorY="top"
            >
              {`${group.label} -`}
            </Label>
            <Label
              position={[CONTENT_LEFT + skillLabelWidth, y]}
              fontSize={0.055}
              lineHeight={1.08}
              maxWidth={CONTENT_WIDTH - skillLabelWidth}
              color={PLAQUE_BODY}
              fontWeight={620}
              anchorY="top"
            >
              {group.items.join("  ")}
            </Label>
          </group>
        );
      })}
    </>
  );
}

function BulletList({ items, startY, gap = 0.142, fontSize = 0.042 }) {
  const markerWidth = 0.08;

  return (
    <>
      {items.map((item, index) => (
        <group key={item}>
          <Label
            position={[CONTENT_LEFT, startY - index * gap]}
            fontSize={fontSize}
            lineHeight={1.05}
            maxWidth={markerWidth}
            color={PLAQUE_BODY}
            fontWeight={650}
            anchorY="top"
          >
            -
          </Label>
          <Label
            position={[CONTENT_LEFT + markerWidth, startY - index * gap]}
            fontSize={fontSize}
            lineHeight={1.05}
            maxWidth={CONTENT_WIDTH - markerWidth}
            color={PLAQUE_BODY}
            fontWeight={560}
            anchorY="top"
          >
            {item}
          </Label>
        </group>
      ))}
    </>
  );
}

function ExhibitMeta({ exhibit, y, color = PLAQUE_MUTED }) {
  return (
    <group>
      <Label position={[CONTENT_LEFT, y]} fontSize={0.059} maxWidth={CONTENT_WIDTH} color={color} fontWeight={900}>
        {exhibit.role}
      </Label>
      <Label position={[CONTENT_LEFT, y - 0.13]} fontSize={0.043} maxWidth={CONTENT_WIDTH} color={color} fontWeight={800}>
        {exhibit.period}
      </Label>
    </group>
  );
}

function ExperienceContent({ exhibit }) {
  const isPrimaryExperience = exhibit.id === "reach-vantage" || exhibit.id === "thoughtclan";

  return (
    <>
      {isPrimaryExperience ? (
        <Text
          position={[0, 0.72, CONTENT_Z + 0.052]}
          fontSize={0.168}
          maxWidth={1.54}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color={exhibit.color || PLAQUE_GOLD}
          fontWeight={850}
          fontStyle="italic"
        >
          {exhibit.title}
        </Text>
      ) : (
        <FrameTitle title={exhibit.title} accent={exhibit.color} />
      )}
      <ExhibitMeta exhibit={exhibit} y={0.52} color={isPrimaryExperience ? "#4a2f16" : PLAQUE_MUTED} />
      <BulletList
        items={exhibit.bullets}
        startY={0.2}
        gap={isPrimaryExperience ? 0.148 : 0.137}
        fontSize={isPrimaryExperience ? 0.046 : 0.041}
      />
      {exhibit.footer ? (
        <>
          <PaperPanel position={[0, -0.96]} scale={[1.42, 0.26]} color="#fff2d6" opacity={0.3} />
          <Label
            position={[CONTENT_LEFT, -0.96]}
            fontSize={isPrimaryExperience ? 0.04 : 0.039}
            lineHeight={1.08}
            maxWidth={CONTENT_WIDTH}
            color={PLAQUE_INK}
            fontWeight={700}
          >
            {exhibit.footer}
          </Label>
        </>
      ) : null}
    </>
  );
}

function CompactExperienceContent({ exhibit }) {
  return (
    <>
      <Text
        position={[0, 0.72, CONTENT_Z + 0.052]}
        fontSize={0.168}
        maxWidth={1.54}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={exhibit.color || PLAQUE_GOLD}
        fontWeight={850}
        fontStyle="italic"
      >
        {exhibit.title}
      </Text>
      {exhibit.sections.map((section, index) => (
        <group key={section.label}>
          <Label
            position={[CONTENT_LEFT, 0.36 - index * 0.48]}
            fontSize={0.059}
            lineHeight={1.06}
            maxWidth={CONTENT_WIDTH}
            color="#4a2f16"
            fontWeight={850}
          >
            {section.label}
          </Label>
          <Label
            position={[CONTENT_LEFT, 0.18 - index * 0.48]}
            fontSize={0.054}
            lineHeight={1.08}
            maxWidth={CONTENT_WIDTH}
            color={PLAQUE_BODY}
            fontWeight={600}
          >
            {section.text}
          </Label>
        </group>
      ))}
    </>
  );
}

function ExhibitContent({ exhibit }) {
  if (exhibit.variant === "about") return <AboutContent exhibit={exhibit} />;
  if (exhibit.variant === "skills") return <SkillsContent exhibit={exhibit} />;
  if (exhibit.variant === "compactExperience") {
    return <CompactExperienceContent exhibit={exhibit} />;
  }

  return <ExperienceContent exhibit={exhibit} />;
}

export default function ExhibitFrame({ exhibit }) {
  const isLeft = exhibit.side === "left";
  const rotationY = isLeft ? Math.PI / 2 : -Math.PI / 2;
  const [hovered, setHovered] = useState(false);

  function handlePointerOver(event) {
    event.stopPropagation();
    setHovered(true);
    window.dispatchEvent(new CustomEvent(CURSOR_EVENT, { detail: { active: true, label: "View" } }));
  }

  function handlePointerOut(event) {
    event.stopPropagation();
    setHovered(false);
    window.dispatchEvent(new CustomEvent(CURSOR_EVENT, { detail: { active: false, label: "" } }));
  }

  return (
    <group
      position={exhibit.position}
      rotation={[0, rotationY, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <FramedArtwork accent={exhibit.color} hovered={hovered} />
      <ExhibitContent exhibit={exhibit} />
    </group>
  );
}
