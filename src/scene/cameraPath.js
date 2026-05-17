import { exhibitLayout } from "../data/exhibitLayout";

export const CAMERA_NAV_JUMP_EVENT = "portfolio-camera-nav-jump";

const CAMERA_TIMING = {
  entranceApproachDuration: 4.2,
  hallwayEntryDuration: 3.2,
  hallwayTravelDuration: 2.3,
  exhibitFocusDuration: 1.8,
  exhibitHoldDuration: 1.8,
  exhibitZoomOutDuration: 1.75,
  finalAtriumRevealDuration: 3.8
};

export const CAMERA_SMOOTHING = {
  positionLerpFactor: 3.35,
  lookTargetLerpFactor: 2.35,
  zoomSpeed: 1.2,
  turnSpeed: 1.18,
  holdDuration: CAMERA_TIMING.exhibitHoldDuration
};

const CAMERA_FEEL = {
  eyeHeight: 2.25,
  focusHeight: 2.55,
  zoomDistance: 2.65,
  zoomBackOffset: 0.05,
  rotationAngle: 30,
  centerAisleX: 0,
  atriumZ: -50
};

export const RESPONSIVE_CAMERA_FEEL = {
  desktop: {
    zoomDistance: 2.65,
    zoomBackOffset: 0.05,
    atriumRevealZ: -29,
    atriumSettleZ: -35.4
  },
  tablet: {
    zoomDistance: 2.65,
    zoomBackOffset: 0.05,
    atriumRevealZ: -29,
    atriumSettleZ: -35.4
  },
  mobile: {
    zoomDistance: 2.65,
    zoomBackOffset: 0.05,
    atriumRevealZ: -29,
    atriumSettleZ: -35.4
  }
};

function getResponsiveCameraFeel() {
  if (typeof window === "undefined") return RESPONSIVE_CAMERA_FEEL.desktop;

  const width = window.innerWidth;

  if (width <= 640) return RESPONSIVE_CAMERA_FEEL.mobile;
  if (width <= 1024) return RESPONSIVE_CAMERA_FEEL.tablet;

  return RESPONSIVE_CAMERA_FEEL.desktop;
}

export function getCameraViewportKey() {
  if (typeof window === "undefined") return "desktop";

  const width = window.innerWidth;

  if (width <= 640) return "mobile";
  if (width <= 1024) return "tablet";

  return "desktop";
}

function softTurnTarget(exhibit, cameraZ) {
  const [frameX, frameY, frameZ] = exhibit.position;
  const side = exhibit.side === "left" ? -1 : 1;
  const zDistance = Math.max(Math.abs(cameraZ - frameZ), 1.4);
  const turnRadians = CAMERA_FEEL.rotationAngle * (Math.PI / 180);
  const softX = Math.min(Math.abs(frameX), Math.tan(turnRadians) * zDistance);

  return [softX * side, frameY, frameZ];
}

function createExhibitSegments(exhibit, index, cameraFeel = CAMERA_FEEL) {
  const [frameX, frameY, frameZ] = exhibit.position;
  const side = exhibit.side === "left" ? -1 : 1;
  const focusX = frameX - side * cameraFeel.zoomDistance;
  const focusZ = frameZ + cameraFeel.zoomBackOffset;
  const nextTravelTargetZ = Math.max(frameZ - 8, CAMERA_FEEL.atriumZ);

  return [
    {
      label: `${exhibit.id}-approach`,
      position: [CAMERA_FEEL.centerAisleX, CAMERA_FEEL.eyeHeight, frameZ + 1.8],
      target: softTurnTarget(exhibit, frameZ + 1.8),
      duration:
        index === 0
          ? CAMERA_TIMING.hallwayTravelDuration * 1.1
          : CAMERA_TIMING.hallwayTravelDuration
    },
    {
      label: `${exhibit.id}-turn-to-frame`,
      position: [CAMERA_FEEL.centerAisleX, CAMERA_FEEL.eyeHeight, frameZ + 0.45],
      target: [frameX, frameY, frameZ],
      duration: CAMERA_TIMING.exhibitFocusDuration * CAMERA_SMOOTHING.turnSpeed
    },
    {
      label: `${exhibit.id}-zoom-in`,
      position: [focusX, CAMERA_FEEL.focusHeight, focusZ],
      target: [frameX, frameY, frameZ],
      duration: CAMERA_TIMING.exhibitFocusDuration * CAMERA_SMOOTHING.zoomSpeed
    },
    {
      label: `${exhibit.id}-read-hold`,
      position: [focusX, CAMERA_FEEL.focusHeight, focusZ],
      target: [frameX, frameY, frameZ],
      duration: CAMERA_SMOOTHING.holdDuration,
      ease: "sine.inOut"
    },
    {
      label: `${exhibit.id}-zoom-out`,
      position: [CAMERA_FEEL.centerAisleX, CAMERA_FEEL.eyeHeight, frameZ - 1.4],
      target: [CAMERA_FEEL.centerAisleX, 2.25, nextTravelTargetZ],
      duration: CAMERA_TIMING.exhibitZoomOutDuration * CAMERA_SMOOTHING.zoomSpeed
    }
  ];
}

export function createCameraWaypoints(cameraFeel = getResponsiveCameraFeel()) {
  return [
    {
      label: "outside-start",
      position: [0, 3.25, 14.8],
      target: [0, 3.55, 4.0],
      duration: 0
    },
    {
      label: "entrance-approach",
      position: [0, 2.8, 9.1],
      target: [0, 3.0, 3.2],
      duration: CAMERA_TIMING.entranceApproachDuration
    },
    {
      label: "hallway-entry",
      position: [0, CAMERA_FEEL.eyeHeight, 8.2],
      target: [0, 2.2, -8],
      duration: CAMERA_TIMING.hallwayEntryDuration
    },
    {
      label: "hallway-establish",
      position: [0, CAMERA_FEEL.eyeHeight, 6.4],
      target: [0, 2.2, -42],
      duration: CAMERA_TIMING.hallwayTravelDuration
    },
    ...exhibitLayout.flatMap((exhibit, index) => createExhibitSegments(exhibit, index, cameraFeel)),
    {
      label: "atrium-reveal",
      position: [0, 2.45, cameraFeel.atriumRevealZ],
      target: [0, 2.45, -42],
      duration: CAMERA_TIMING.finalAtriumRevealDuration
    },
    {
      label: "atrium-settle",
      position: [0, 2.55, cameraFeel.atriumSettleZ],
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
