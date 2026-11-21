'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { orbitalField } from '@/lib/orbit';

// Draw a monitor, stand, desktop and keyboard from the edges of four boxes.
const deskParts = [
  [0, 0.32, 0, 1.2, 0.78, 0.1],
  [0, -0.18, 0, 0.12, 0.27, 0.12],
  [0, -0.38, 0.14, 1.85, 0.1, 1.05],
  [0, -0.29, 0.37, 0.8, 0.05, 0.3],
];

function shapes(compact: boolean) {
  const orbit = compact ? orbitalField(40, 96) : orbitalField(64, 144);
  const count = orbit.length / 4;
  const targets = Array.from({ length: 4 }, () => new Float32Array(count * 3));
  for (let i = 0; i < count; i++) {
    const k = i * 3,
      side = i % 3,
      t = (i % 113) / 112;
    const a = ((Math.floor(i / 113) % 9) / 8 - 0.5) * 1.35,
      b = ((Math.floor(i / 1017) % 9) / 8 - 0.5) * 1.35;
    targets[0].set(orbit.subarray(i * 4, i * 4 + 3), k);
    const grid = [a, b, a];
    grid[side] = t * 1.55 - 0.775;
    grid[(side + 1) % 3] = a;
    grid[(side + 2) % 3] = b;
    targets[1].set(grid, k);
    const layer = i % 7,
      angle = t * Math.PI * 2;
    const radius =
      0.47 + 0.17 * Math.sin(((Math.floor(i / 7) % 37) / 36) * Math.PI);
    targets[2].set(
      [radius * Math.cos(angle), (layer - 3) * 0.19, radius * Math.sin(angle)],
      k,
    );
    const box = deskParts[i % 4];
    const edge = Math.floor(i / 4) % 12;
    const axis = Math.floor(edge / 4);
    const pos = box
      .slice(0, 3)
      .map(
        (center, j) =>
          center +
          box[j + 3] *
            (j === axis
              ? t - 0.5
              : edge & (j === (axis + 1) % 3 ? 1 : 2)
                ? 0.5
                : -0.5),
      );
    targets[3].set(pos, k);
  }
  return targets;
}

function Particles({ chapter, still }: { chapter: number; still: boolean }) {
  const compact = useThree((s) => s.size.width < 700);
  const invalidate = useThree((s) => s.invalidate);
  const targets = useMemo(() => shapes(compact), [compact]);
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(targets[0].slice(), 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3);
    return geo;
  }, [targets]);
  const group = useRef<THREE.Points>(null);
  const phase = useRef(0);
  const morphTime = useRef(0);
  useEffect(() => {
    morphTime.current = 0;
    invalidate();
  }, [chapter, still, targets, invalidate]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ pointer, camera }, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 0.06);
    const dest = targets[chapter],
      attribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    const current = attribute.array as Float32Array;
    const blend = still ? 1 : 1 - Math.exp(-dt * 4);
    if (morphTime.current < 2) {
      morphTime.current = still ? 2 : morphTime.current + dt;
      if (morphTime.current >= 2) current.set(dest);
      else {
        for (let i = 0; i < current.length; i++)
          current[i] += (dest[i] - current[i]) * blend;
      }
      attribute.needsUpdate = true;
    }
    if (!still) phase.current += dt;
    const drift = still ? 0 : Math.sin(phase.current * 0.25) * 0.14;
    const yaw = (chapter === 0 ? 0 : -0.42) + drift;
    const pitch = chapter === 2 ? 0.35 : 0.12;
    camera.position.x +=
      ((still ? 0 : pointer.x * 0.35) - camera.position.x) * blend;
    camera.position.y +=
      ((still ? 0 : pointer.y * 0.24) - camera.position.y) * blend;
    camera.lookAt(0, 0, 0);
    group.current.rotation.y += (yaw - group.current.rotation.y) * blend;
    group.current.rotation.x += (pitch - group.current.rotation.x) * blend;
  });
  return (
    <points ref={group} geometry={geometry}>
      <pointsMaterial
        color="#b2e6d6"
        size={compact ? 0.009 : 0.0075}
        transparent
        opacity={0.78}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
export default function StoryScene({
  chapter,
  still,
  active,
  onFailure,
}: {
  chapter: number;
  still: boolean;
  active: boolean;
  onFailure: () => void;
}) {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2');
      if (!gl) {
        onFailure();
        return;
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      setSupported(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [onFailure]);
  if (!supported) return <div className="scene-poster" />;
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 3], fov: 45 }}
      gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
      frameloop={active ? (still ? 'demand' : 'always') : 'never'}
      fallback={<div className="scene-poster" />}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', onFailure, {
          once: true,
        });
      }}
    >
      <Particles chapter={chapter} still={still} />
    </Canvas>
  );
}
