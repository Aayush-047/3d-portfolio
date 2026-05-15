import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { exhibits } from "../data/exhibits";

gsap.registerPlugin(ScrollTrigger);

export const CAMERA_NAV_JUMP_EVENT = "portfolio-camera-nav-jump";

// Tune scroll pacing here. Larger values give the motion more scroll distance.
const CAMERA_TIMING = {
  entranceApproachDuration: 4.2,
  hallwayEntryDuration: 3.2,
  hallwayTravelDuration: 2.3,
  exhibitFocusDuration: 1.8,
  exhibitHoldDuration: 1.8,
  exhibitZoomOutDuration: 1.75,
  finalAtriumRevealDuration: 3.8
};

// Debug/tune smoothness here:
// positionLerpFactor controls camera glide. Lower = floatier, higher = tighter.
// lookTargetLerpFactor controls rotation softness. Lower = softer head turns.
// scrollScrub controls ScrollTrigger smoothing. Higher = more delayed cinematic scroll.
// zoomSpeed, turnSpeed, and holdDuration scale the exhibit segment durations below.
const CAMERA_SMOOTHING = {
  positionLerpFactor: 4.2,
  lookTargetLerpFactor: 2.8,
  scrollScrub: 1.6,
  zoomSpeed: 1.2,
  turnSpeed: 1.18,
  holdDuration: CAMERA_TIMING.exhibitHoldDuration
};

// Tune first-person feel here without touching scene geometry.
const CAMERA_FEEL = {
  eyeHeight: 2.25,
  focusHeight: 2.55,
  zoomDistance: 2.65,
  rotationAngle: 30,
  centerAisleX: 0,
  atriumZ: -50
};

function toState(position, target) {
  return {
    px: position[0],
    py: position[1],
    pz: position[2],
    tx: target[0],
    ty: target[1],
    tz: target[2]
  };
}

function addCameraSegment(timeline, cameraState, waypoint) {
  timeline.to(cameraState, {
    ...toState(waypoint.position, waypoint.target),
    duration: waypoint.duration,
    ease: waypoint.ease ?? "power2.inOut"
  });
}

function softTurnTarget(exhibit, cameraZ) {
  const [frameX, frameY, frameZ] = exhibit.position;
  const side = exhibit.side === "left" ? -1 : 1;
  const zDistance = Math.max(Math.abs(cameraZ - frameZ), 1.4);
  const turnRadians = THREE.MathUtils.degToRad(CAMERA_FEEL.rotationAngle);
  const softX = Math.min(Math.abs(frameX), Math.tan(turnRadians) * zDistance);

  return [softX * side, frameY, frameZ];
}

function createExhibitSegments(exhibit, index) {
  const [frameX, frameY, frameZ] = exhibit.position;
  const side = exhibit.side === "left" ? -1 : 1;
  const focusX = frameX - side * CAMERA_FEEL.zoomDistance;
  const nextTravelTargetZ = Math.max(frameZ - 8, CAMERA_FEEL.atriumZ);

  return [
    {
      // 4. exhibit focus: approach from the center aisle and begin a natural head turn.
      label: `${exhibit.id}-approach`,
      position: [CAMERA_FEEL.centerAisleX, CAMERA_FEEL.eyeHeight, frameZ + 1.8],
      target: softTurnTarget(exhibit, frameZ + 1.8),
      duration:
        index === 0
          ? CAMERA_TIMING.hallwayTravelDuration * 1.1
          : CAMERA_TIMING.hallwayTravelDuration
    },
    {
      // 4. exhibit focus: finish the turn toward the frame before moving closer.
      label: `${exhibit.id}-turn-to-frame`,
      position: [CAMERA_FEEL.centerAisleX, CAMERA_FEEL.eyeHeight, frameZ + 0.45],
      target: [frameX, frameY, frameZ],
      duration: CAMERA_TIMING.exhibitFocusDuration * CAMERA_SMOOTHING.turnSpeed
    },
    {
      // 5. exhibit zoom/hold: zoom distance is controlled by CAMERA_FEEL.zoomDistance.
      label: `${exhibit.id}-zoom-in`,
      position: [focusX, CAMERA_FEEL.focusHeight, frameZ + 0.05],
      target: [frameX, frameY, frameZ],
      duration: CAMERA_TIMING.exhibitFocusDuration * CAMERA_SMOOTHING.zoomSpeed
    },
    {
      // 5. exhibit zoom/hold: hold duration controls readability time.
      label: `${exhibit.id}-read-hold`,
      position: [focusX, CAMERA_FEEL.focusHeight, frameZ + 0.05],
      target: [frameX, frameY, frameZ],
      duration: CAMERA_SMOOTHING.holdDuration,
      ease: "sine.inOut"
    },
    {
      // 6. exhibit zoom-out: return softly to the center aisle.
      label: `${exhibit.id}-zoom-out`,
      position: [CAMERA_FEEL.centerAisleX, CAMERA_FEEL.eyeHeight, frameZ - 1.4],
      target: [CAMERA_FEEL.centerAisleX, 2.25, nextTravelTargetZ],
      duration: CAMERA_TIMING.exhibitZoomOutDuration * CAMERA_SMOOTHING.zoomSpeed
    }
  ];
}

function createCameraWaypoints() {
  return [
    {
      label: "outside-start",
      position: [0, 3.25, 14.8],
      target: [0, 3.55, 4.0],
      duration: 0
    },
    {
      // 1. entrance approach: slow push toward the exterior Hero/Intro area.
      label: "entrance-approach",
      position: [0, 2.8, 9.1],
      target: [0, 3.0, 3.2],
      duration: CAMERA_TIMING.entranceApproachDuration
    },
    {
      // 2. hallway entry: pass through the gate without snapping rotation.
      label: "hallway-entry",
      position: [0, CAMERA_FEEL.eyeHeight, 8.2],
      target: [0, 2.2, -8],
      duration: CAMERA_TIMING.hallwayEntryDuration
    },
    {
      // 3. hallway establishing movement: look down the corridor before frames take focus.
      label: "hallway-establish",
      position: [0, CAMERA_FEEL.eyeHeight, 6.4],
      target: [0, 2.2, -42],
      duration: CAMERA_TIMING.hallwayTravelDuration
    },
    ...exhibits.flatMap(createExhibitSegments),
    {
      // 7. final contact reveal: approach the end wall without passing through it.
      label: "atrium-reveal",
      position: [0, 2.45, -29],
      target: [0, 2.45, -42],
      duration: CAMERA_TIMING.finalAtriumRevealDuration
    },
    {
      // 9. settle close enough for the wall-mounted contact card to read.
      label: "atrium-settle",
      position: [0, 2.55, -35.4],
      target: [0, 2.45, -42],
      duration: CAMERA_TIMING.finalAtriumRevealDuration * 0.65
    }
  ];
}

export function getCameraNavTargets() {
  const waypoints = createCameraWaypoints();
  const timedWaypoints = waypoints.slice(1);
  const totalDuration = timedWaypoints.reduce((sum, waypoint) => sum + waypoint.duration, 0);
  const targets = {
    home: 0,
    contact: 1
  };
  let elapsed = 0;

  timedWaypoints.forEach((waypoint) => {
    if (waypoint.label.endsWith("-read-hold")) {
      const exhibitId = waypoint.label.replace("-read-hold", "");
      targets[exhibitId] = (elapsed + waypoint.duration * 0.5) / totalDuration;
    }
    elapsed += waypoint.duration;
  });

  return targets;
}

export default function CameraRig() {
  const { camera } = useThree();
  const waypoints = useMemo(createCameraWaypoints, []);

  // ScrollTrigger writes only to this target state. The real camera never snaps to it.
  const targetState = useRef(toState(waypoints[0].position, waypoints[0].target));

  // useFrame smooths these actual values toward targetState every frame.
  const actualPosition = useRef(new THREE.Vector3(...waypoints[0].position));
  const actualLookTarget = useRef(new THREE.Vector3(...waypoints[0].target));
  const targetPosition = useRef(new THREE.Vector3(...waypoints[0].position));
  const targetLookAt = useRef(new THREE.Vector3(...waypoints[0].target));

  useEffect(() => {
    const first = waypoints[0];

    camera.position.set(...first.position);
    actualPosition.current.set(...first.position);
    actualLookTarget.current.set(...first.target);
    camera.lookAt(actualLookTarget.current);

    const timeline = gsap.timeline({
      defaults: {
        overwrite: "auto",
        ease: "sine.inOut"
      },
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: CAMERA_SMOOTHING.scrollScrub
      }
    });

    waypoints.slice(1).forEach((waypoint) => {
      addCameraSegment(timeline, targetState.current, waypoint);
    });

    function syncCameraToTimelineProgress(progress) {
      const clampedProgress = THREE.MathUtils.clamp(progress, 0, 1);
      const scrubTween = timeline.scrollTrigger?.getTween?.();

      scrubTween?.pause();
      timeline.totalProgress(clampedProgress, false);

      const state = targetState.current;
      targetPosition.current.set(state.px, state.py, state.pz);
      targetLookAt.current.set(state.tx, state.ty, state.tz);
      actualPosition.current.copy(targetPosition.current);
      actualLookTarget.current.copy(targetLookAt.current);
      camera.position.copy(actualPosition.current);
      camera.lookAt(actualLookTarget.current);
    }

    function handleNavJump(event) {
      syncCameraToTimelineProgress(event.detail?.progress ?? 0);
    }

    window.addEventListener(CAMERA_NAV_JUMP_EVENT, handleNavJump);

    return () => {
      window.removeEventListener(CAMERA_NAV_JUMP_EVENT, handleNavJump);
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, [camera, waypoints]);

  useFrame((_, delta) => {
    const state = targetState.current;

    targetPosition.current.set(state.px, state.py, state.pz);
    targetLookAt.current.set(state.tx, state.ty, state.tz);

    // Frame-rate independent damping. Stop scrolling anywhere and the camera settles smoothly.
    actualPosition.current.lerp(
      targetPosition.current,
      1 - Math.exp(-CAMERA_SMOOTHING.positionLerpFactor * delta)
    );
    actualLookTarget.current.lerp(
      targetLookAt.current,
      1 - Math.exp(-CAMERA_SMOOTHING.lookTargetLerpFactor * delta)
    );

    camera.position.copy(actualPosition.current);
    camera.lookAt(actualLookTarget.current);
  });

  return null;
}
