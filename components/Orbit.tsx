'use client';

import { useEffect, useRef, useState } from 'react';
import { orbitalField } from '@/lib/orbit';

const vertex = `
attribute vec4 particle;
uniform vec3 pose;
uniform vec2 scale;
varying float light;
void main(){
  float a = pose.x + 0.12 * sin(pose.z * 0.38);
  float b = pose.y + 0.07 * sin(pose.z * 0.27);
  vec3 p = particle.xyz;
  p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
  p.yz = mat2(cos(b), -sin(b), sin(b), cos(b)) * p.yz;
  gl_Position = vec4(p.xy * scale.x, 0., 1.);
  light = particle.w * (0.78 + 0.22 * p.z);
  gl_PointSize = scale.y * (0.95 + 1.15 * light);
}`;
const fragment = `
precision mediump float;
varying float light;
void main(){
  float coverage = 1.0 - smoothstep(0.12, 0.5, distance(gl_PointCoord, vec2(0.5)));
  gl_FragColor = vec4(mix(vec3(0.37,0.58,0.54),vec3(0.9,1.,0.96),light),coverage * min(1.,light*1.4));
}`;

export default function Orbit() {
  const surface = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const pauseRef = useRef(false);
  const refresh = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(motion.matches);
    sync();
    motion.addEventListener('change', sync);
    return () => motion.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    pauseRef.current = paused;
    refresh.current?.();
  }, [paused]);

  useEffect(() => {
    const canvas = surface.current;
    if (
      !canvas ||
      reduced ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: 'low-power',
    });
    if (!gl) return;
    const program = gl.createProgram()!;
    const shaders = [vertex, fragment].map((source, i) => {
      const shader = gl.createShader(
        i === 0 ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER,
      )!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
      return shader;
    });
    gl.linkProgram(program);
    const buffer = gl.createBuffer();
    const dispose = () => {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      shaders.forEach((shader) => gl.deleteShader(shader));
    };
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      dispose();
      return;
    }
    gl.useProgram(program);
    const points =
      canvas.clientWidth < 500 ? orbitalField(86, 290) : orbitalField();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(program, 'particle');
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const pose = gl.getUniformLocation(program, 'pose');
    const scale = gl.getUniformLocation(program, 'scale');
    let presented = false;
    let frame = 0,
      angleX = 0,
      angleY = 0,
      targetX = 0,
      targetY = 0,
      elapsed = 0,
      previous = 0,
      visible = false;
    function draw(now: number) {
      frame = 0;
      if (!gl || !canvas || !visible || document.hidden || gl.isContextLost())
        return;
      const paused = pauseRef.current;
      if (!previous || now - previous >= 32 || paused) {
        elapsed +=
          paused || !previous ? 0 : Math.min(0.08, (now - previous) / 1000);
        previous = now;
        angleX += (targetX - angleX) * 0.09;
        angleY += (targetY - angleY) * 0.09;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform3f(pose, angleX, angleY, elapsed);
        gl.uniform2f(scale, 0.98, canvas.width / 580);
        gl.drawArrays(gl.POINTS, 0, points.length / 4);
        if (!presented) {
          presented = true;
          setReady(true);
        }
      }
      if (!paused) frame = requestAnimationFrame(draw);
    }
    function schedule() {
      cancelAnimationFrame(frame);
      previous = 0;
      frame = requestAnimationFrame(draw);
    }
    refresh.current = schedule;
    const resize = new ResizeObserver(() => {
      canvas.width = canvas.height = Math.round(
        canvas.clientWidth * Math.min(devicePixelRatio, 1.75),
      );
      schedule();
    });
    const inView = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const bounds = canvas.getBoundingClientRect();
      targetX =
        ((event.clientX - bounds.left - bounds.width / 2) / bounds.width) *
        0.45;
      targetY =
        ((event.clientY - bounds.top - bounds.height / 2) / bounds.height) *
        0.35;
    };
    const reset = () => {
      targetX = targetY = 0;
    };
    const lost = () => {
      cancelAnimationFrame(frame);
      setReady(false);
    };
    resize.observe(canvas);
    inView.observe(canvas);
    canvas.addEventListener('pointermove', pointer);
    canvas.addEventListener('pointerleave', reset);
    canvas.addEventListener('webglcontextlost', lost);
    document.addEventListener('visibilitychange', schedule);
    return () => {
      cancelAnimationFrame(frame);
      refresh.current = null;
      resize.disconnect();
      inView.disconnect();
      canvas.removeEventListener('pointermove', pointer);
      canvas.removeEventListener('pointerleave', reset);
      canvas.removeEventListener('webglcontextlost', lost);
      document.removeEventListener('visibilitychange', schedule);
      dispose();
    };
  }, [reduced]);

  return (
    <figure className="orbit-figure">
      <div className="orbit-mount">
        <div
          className="orbit-poster"
          style={{ opacity: ready && !reduced ? 0 : 1 }}
        />
        <canvas
          ref={surface}
          aria-hidden="true"
          style={{ opacity: ready && !reduced ? 1 : 0 }}
        />
      </div>
      <figcaption>
        <span className="fig-rule" />
        Fig. 01 <span>/</span> Orbital field
        {ready && !reduced && (
          <button
            onClick={() => setPaused(!paused)}
            aria-label={
              paused ? 'Play orbital animation' : 'Pause orbital animation'
            }
            aria-pressed={paused}
          >
            {paused ? '▷' : 'Ⅱ'}
          </button>
        )}
      </figcaption>
    </figure>
  );
}
