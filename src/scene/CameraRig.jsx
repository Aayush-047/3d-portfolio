import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  CAMERA_NAV_JUMP_EVENT,
  CAMERA_SMOOTHING,
  RESPONSIVE_CAMERA_FEEL,
  createCameraWaypoints,
  getCameraViewportKey
} from "./cameraPath";

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

function copyState(source, target) {
  target.px = source.px;
  target.py = source.py;
  target.pz = source.pz;
  target.tx = source.tx;
  target.ty = source.ty;
  target.tz = source.tz;
}

function easeProgress(progress, ease) {
  const t = THREE.MathUtils.clamp(progress, 0, 1);

  if (ease === "sine.inOut") {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function buildTimeline(waypoints) {
  const segments = [];
  let elapsed = 0;
  let previous = toState(waypoints[0].position, waypoints[0].target);

  waypoints.slice(1).forEach((waypoint) => {
    const duration = Math.max(waypoint.duration, 0.0001);
    const next = toState(waypoint.position, waypoint.target);

    segments.push({
      from: previous,
      to: next,
      start: elapsed,
      end: elapsed + duration,
      duration,
      ease: waypoint.ease ?? "power2.inOut"
    });

    previous = next;
    elapsed += duration;
  });

  return {
    first: toState(waypoints[0].position, waypoints[0].target),
    last: previous,
    segments,
    totalDuration: elapsed
  };
}

function sampleTimeline(timeline, progress, output) {
  const normalizedProgress = THREE.MathUtils.clamp(progress, 0, 1);

  if (!timeline.segments.length || normalizedProgress <= 0) {
    copyState(timeline.first, output);
    return;
  }

  if (normalizedProgress >= 1) {
    copyState(timeline.last, output);
    return;
  }

  const elapsed = normalizedProgress * timeline.totalDuration;
  const segment =
    timeline.segments.find((item) => elapsed >= item.start && elapsed <= item.end) ??
    timeline.segments[timeline.segments.length - 1];
  const t = easeProgress((elapsed - segment.start) / segment.duration, segment.ease);

  output.px = THREE.MathUtils.lerp(segment.from.px, segment.to.px, t);
  output.py = THREE.MathUtils.lerp(segment.from.py, segment.to.py, t);
  output.pz = THREE.MathUtils.lerp(segment.from.pz, segment.to.pz, t);
  output.tx = THREE.MathUtils.lerp(segment.from.tx, segment.to.tx, t);
  output.ty = THREE.MathUtils.lerp(segment.from.ty, segment.to.ty, t);
  output.tz = THREE.MathUtils.lerp(segment.from.tz, segment.to.tz, t);
}

function getScrollProgress() {
  if (typeof document === "undefined") return 0;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return maxScroll > 0 ? window.scrollY / maxScroll : 0;
}

export default function CameraRig() {
  const { camera, invalidate } = useThree();
  const [viewportKey, setViewportKey] = useState(getCameraViewportKey);
  const waypoints = useMemo(
    () => createCameraWaypoints(RESPONSIVE_CAMERA_FEEL[viewportKey]),
    [viewportKey]
  );
  const timeline = useMemo(() => buildTimeline(waypoints), [waypoints]);

  const targetState = useRef({ ...timeline.first });
  const actualPosition = useRef(new THREE.Vector3(...waypoints[0].position));
  const actualLookTarget = useRef(new THREE.Vector3(...waypoints[0].target));
  const targetPosition = useRef(new THREE.Vector3(...waypoints[0].position));
  const targetLookAt = useRef(new THREE.Vector3(...waypoints[0].target));

  useEffect(() => {
    let frame = 0;

    function updateViewportKey() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setViewportKey((current) => {
          const next = getCameraViewportKey();
          return current === next ? current : next;
        });
      });
    }

    window.addEventListener("resize", updateViewportKey);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateViewportKey);
    };
  }, []);

  useEffect(() => {
    let frame = 0;

    function syncVectorsFromTarget(snap = false) {
      const state = targetState.current;

      targetPosition.current.set(state.px, state.py, state.pz);
      targetLookAt.current.set(state.tx, state.ty, state.tz);

      if (snap) {
        actualPosition.current.copy(targetPosition.current);
        actualLookTarget.current.copy(targetLookAt.current);
        camera.position.copy(actualPosition.current);
        camera.lookAt(actualLookTarget.current);
      }

      invalidate();
    }

    function applyProgress(progress, snap = false) {
      sampleTimeline(timeline, progress, targetState.current);
      syncVectorsFromTarget(snap);
    }

    function requestScrollUpdate() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => applyProgress(getScrollProgress()));
    }

    function handleNavJump(event) {
      applyProgress(event.detail?.progress ?? 0, true);
    }

    applyProgress(getScrollProgress(), true);

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate);
    window.addEventListener(CAMERA_NAV_JUMP_EVENT, handleNavJump);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestScrollUpdate);
      window.removeEventListener("resize", requestScrollUpdate);
      window.removeEventListener(CAMERA_NAV_JUMP_EVENT, handleNavJump);
    };
  }, [camera, invalidate, timeline]);

  useFrame((_, delta) => {
    const positionAlpha = 1 - Math.exp(-CAMERA_SMOOTHING.positionLerpFactor * delta);
    const targetAlpha = 1 - Math.exp(-CAMERA_SMOOTHING.lookTargetLerpFactor * delta);

    actualPosition.current.lerp(targetPosition.current, positionAlpha);
    actualLookTarget.current.lerp(targetLookAt.current, targetAlpha);

    camera.position.copy(actualPosition.current);
    camera.lookAt(actualLookTarget.current);

    const positionSettled = actualPosition.current.distanceToSquared(targetPosition.current) < 0.000001;
    const targetSettled = actualLookTarget.current.distanceToSquared(targetLookAt.current) < 0.000001;

    if (!positionSettled || !targetSettled) {
      invalidate();
    }
  });

  return null;
}
