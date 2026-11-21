'use client';
import { useEffect, useRef } from 'react';
import { profile } from '@/lib/content';
import { onSiteScroll } from './siteScroll';
import './fields.css';

type Sample = { x: number; y: number; tone: number };
type Rectangle = [number, number, number, number];

// Targets use CSS pixels. Only the final projection and point diameter depend on DPR.
const vertex = `
attribute vec3 photo;
attribute vec2 lettering, badge, seed;
uniform vec2 viewport;
uniform vec4 portraitBox, badgeBox;
uniform vec4 rail;
uniform float progress, dpr, paper;
varying float opacity, ink;
void main() {
  vec2 start = portraitBox.xy + photo.xy * portraitBox.zw;
  vec2 name = vec2(mod(lettering.x * rail.x + rail.w, rail.x) - rail.z, rail.y + lettering.y * viewport.x * .12);
  vec2 end = badgeBox.xy + badge * badgeBox.zw;
  float morph = smoothstep(.065 + .04 * seed.x, .43 + .035 * seed.y, progress);
  float converge = smoothstep(.59 + .24 * seed.y, .97 + .03 * seed.y, progress);
  vec2 spread = vec2((seed.x - .5) * viewport.x * .66, (seed.y - .5) * viewport.y * .46);
  vec2 position = mix(start, name, morph) + spread * sin(morph * 3.14159);
  position = mix(position, end, converge) + spread * .42 * sin(converge * 3.14159);
  float luminous = smoothstep(.04, .30, morph);
  ink = mix(mix(photo.z, .96, luminous), .12, smoothstep(.12, .49, paper));
  opacity = mix(.48 * photo.z + .02, .70 + seed.y * .28, luminous);
  opacity *= 1.0 - .76 * sin(converge * 3.14159);
  opacity *= 1.0 - smoothstep(.88, 1.05, progress);
  gl_Position = vec4((position / viewport) * vec2(2., -2.) + vec2(-1., 1.), 0, 1);
  gl_PointSize = max(1., dpr * mix(1.15, 1.85, seed.x) * mix(1., 1.55, luminous) * mix(1., .68, converge));
}`;
const fragment = `
precision mediump float;
varying float ink, opacity;
void main() {
  float circle = 1. - smoothstep(.24, .50, distance(gl_PointCoord, vec2(.5)));
  gl_FragColor = vec4(vec3(ink), circle * opacity);
}`;

function imageSamples(
  image: HTMLImageElement,
  size: number,
  alphaOnly = false,
): Sample[] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.max(
    1,
    Math.round((size * image.naturalHeight) / image.naturalWidth),
  );
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return readMask(canvas, ctx, alphaOnly);
}

function readMask(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  alphaOnly: boolean,
): Sample[] {
  const { width, height } = canvas;
  const rgba = ctx.getImageData(0, 0, width, height).data;
  const out: Sample[] = [];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = 4 * (y * width + x);
      if (rgba[i + 3] < 100 || (!alphaOnly && rgba[i] < 13)) continue;
      out.push({
        x: (x + 0.5) / width,
        y: (y + 0.5) / height,
        tone: rgba[i] / 255,
      });
    }
  return out;
}

function nameSamples() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  const text = profile.name + ' • ';
  const font = '700 96px "General Sans", Arial, sans-serif';
  ctx.font = font;
  const width = ctx.measureText(text).width;
  canvas.width = Math.ceil(width);
  canvas.height = 96;
  ctx.font = font;
  ctx.fillText(text, 0, 76);
  return { samples: readMask(canvas, ctx, true), ratio: width / 96 };
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function PortraitField() {
  const element = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const canvas = element.current!;
    const box = canvas.parentElement!;
    const hero = box.closest<HTMLElement>('.site-hero')!;
    const emblem =
      document.querySelector<HTMLImageElement>('.about-message img');
    const photo = box.querySelector('img');
    if (!emblem || !photo) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false,
      stop = () => {},
      scheduleId = 0;
    async function setup() {
      const attempt = ++scheduleId;
      stop();
      if (reduced.matches || disposed) return;
      try {
        await Promise.all([
          photo!.decode(),
          emblem!.decode(),
          document.fonts.ready,
        ]);
      } catch {
        return;
      }
      if (attempt !== scheduleId || disposed || reduced.matches) return;
      const gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        premultipliedAlpha: false,
        depth: false,
        stencil: false,
        failIfMajorPerformanceCaveat: true,
        powerPreference: 'low-power',
      });
      if (!gl) return;
      const renderer = gl.getExtension('WEBGL_debug_renderer_info');
      if (
        renderer &&
        /swiftshader|llvmpipe|software rasterizer/i.test(
          gl.getParameter(renderer.UNMASKED_RENDERER_WEBGL),
        )
      )
        return;
      const vs = compile(gl, gl.VERTEX_SHADER, vertex),
        fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
      const program = gl.createProgram(),
        buffer = gl.createBuffer();
      function release() {
        if (buffer) gl!.deleteBuffer(buffer);
        if (program) gl!.deleteProgram(program);
        if (vs) gl!.deleteShader(vs);
        if (fs) gl!.deleteShader(fs);
      }
      if (!vs || !fs || !program || !buffer) {
        release();
        return;
      }
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        release();
        return;
      }
      const photoMask = imageSamples(photo!, 290),
        emblemMask = imageSamples(emblem!, 160, true),
        name = nameSamples();
      if (!photoMask.length || !emblemMask.length || !name?.samples.length) {
        release();
        return;
      }
      const count = innerWidth < 700 ? 12000 : 26000,
        values = new Float32Array(count * 9);
      let seed = 45827;
      const random = () =>
        (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
      for (let i = 0; i < count; i++) {
        const p = photoMask[Math.floor(random() * photoMask.length)],
          n = name.samples[Math.floor(random() * name.samples.length)],
          g = emblemMask[Math.floor(random() * emblemMask.length)];
        // Two equal copies make a continuous name rail; the wrap stays outside the viewport.
        values.set(
          [
            p.x,
            p.y,
            p.tone,
            (n.x + (i % 2)) / 2,
            n.y,
            g.x,
            g.y,
            random(),
            random(),
          ],
          i * 9,
        );
      }
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW);
      for (const [key, size, offset] of [
        ['photo', 3, 0],
        ['lettering', 2, 3],
        ['badge', 2, 5],
        ['seed', 2, 7],
      ] as const) {
        const index = gl.getAttribLocation(program, key);
        gl.enableVertexAttribArray(index);
        gl.vertexAttribPointer(index, size, gl.FLOAT, false, 36, offset * 4);
      }
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(
        gl.SRC_ALPHA,
        gl.ONE_MINUS_SRC_ALPHA,
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA,
      );
      const uniform = (key: string) => gl.getUniformLocation(program, key);
      const locations = {
        viewport: uniform('viewport'),
        portrait: uniform('portraitBox'),
        badge: uniform('badgeBox'),
        rail: uniform('rail'),
        progress: uniform('progress'),
        dpr: uniform('dpr'),
        paper: uniform('paper'),
      };
      let frame = 0,
        progress = 0,
        scroll = 0,
        direction = 1,
        contextLost = false,
        active = true,
        heroTop = 0,
        heroHeight = 0,
        viewportHeight = 0,
        viewportWidth = 0;
      let portraitRect: Rectangle = [0, 0, 0, 0],
        badgeRect: Rectangle = [0, 0, 0, 0],
        phase = 0,
        lastTime = 0;
      function measure() {
        const width = innerWidth,
          height = innerHeight,
          dpr = Math.min(
            devicePixelRatio || 1,
            2,
            Math.sqrt(5000000 / (width * height)),
          );
        if (
          width !== viewportWidth ||
          height !== viewportHeight ||
          canvas.width !== Math.round(width * dpr)
        ) {
          viewportWidth = width;
          viewportHeight = height;
          canvas.width = Math.round(width * dpr);
          canvas.height = Math.round(height * dpr);
          gl!.viewport(0, 0, canvas.width, canvas.height);
          gl!.uniform2f(locations.viewport, width, height);
          gl!.uniform1f(locations.dpr, dpr);
        }
        const r = box.getBoundingClientRect(),
          h = hero.getBoundingClientRect(),
          g = emblem!.getBoundingClientRect();
        const scale = Math.min(
          r.width / photo!.naturalWidth,
          r.height / photo!.naturalHeight,
        );
        const w = photo!.naturalWidth * scale,
          ph = photo!.naturalHeight * scale;
        portraitRect = [
          r.left + (r.width - w) / 2,
          r.bottom - ph + scrollY,
          w,
          ph,
        ];
        badgeRect = [g.left, g.top + scrollY, g.width, g.height];
        heroTop = h.top + scrollY;
        heroHeight = h.height;
      }
      function draw(time: number) {
        frame = 0;
        if (!active || document.hidden || disposed) return;
        const previous = lastTime;
        lastTime = time;
        if (progress > 0.06 && progress < 0.98)
          phase +=
            (previous ? Math.min(50, time - previous) : 0) * 0.042 * direction;
        const [x, y, w, h] = portraitRect,
          [gx, gy, gw, gh] = badgeRect;
        gl!.uniform4f(locations.portrait, x, y - scroll, w, h);
        gl!.uniform4f(locations.badge, gx, gy - scroll, gw, gh);
        const font = viewportWidth * 0.12,
          period = font * name!.ratio * 2;
        gl!.uniform4f(
          locations.rail,
          period,
          heroTop + heroHeight - font * 0.99 - scroll,
          (period - viewportWidth) * 0.5,
          -phase,
        );
        gl!.uniform1f(locations.progress, progress);
        const color = getComputedStyle(hero).color.match(/[\d.]+/);
        gl!.uniform1f(
          locations.paper,
          color ? Math.max(0, Math.min(1, (238 - Number(color[0])) / 228)) : 0,
        );
        gl!.clearColor(0, 0, 0, 0);
        gl!.clear(gl!.COLOR_BUFFER_BIT);
        gl!.drawArrays(gl!.POINTS, 0, count);
        // Preserve the existing headshot's legibility while its sampled contour takes over.
        box.style.setProperty(
          '--scatter',
          String(0.92 + 0.08 * Math.min(1, progress / 0.1)),
        );
        if (progress > 0.06 && progress < 0.98) queue();
      }
      function queue() {
        if (!frame && active && !document.hidden)
          frame = requestAnimationFrame(draw);
      }
      function refresh() {
        measure();
        queue();
      }
      function fallback() {
        contextLost = true;
        active = false;
        cancelAnimationFrame(frame);
        frame = 0;
        box.style.removeProperty('--scatter');
        emblem!.style.removeProperty('--emblem-ink');
        delete emblem!.dataset.field;
        delete canvas.dataset.ready;
      }
      const resize = new ResizeObserver(refresh);
      resize.observe(hero);
      resize.observe(box);
      resize.observe(emblem!);
      measure();
      canvas.dataset.ready = 'true';
      emblem!.dataset.field = 'true';
      const unsubscribe = onSiteScroll((snapshot) => {
        if (contextLost) return;
        if (snapshot.y !== scroll) direction = Math.sign(snapshot.y - scroll);
        scroll = snapshot.y;
        progress = Math.max(0, (scroll - heroTop) / snapshot.height);
        emblem!.style.setProperty(
          '--emblem-ink',
          String(Math.max(0, Math.min(1, (progress - 0.87) / 0.15))),
        );
        if (progress > 1.08 || snapshot.reduced) {
          active = false;
          canvas.style.visibility = 'hidden';
          lastTime = 0;
        } else {
          active = true;
          canvas.style.visibility = '';
          queue();
        }
      });
      document.addEventListener('visibilitychange', queue);
      window.addEventListener('resize', refresh);
      document.fonts.addEventListener('loadingdone', refresh);
      canvas.addEventListener('webglcontextlost', fallback);
      stop = () => {
        active = false;
        cancelAnimationFrame(frame);
        unsubscribe();
        resize.disconnect();
        window.removeEventListener('resize', refresh);
        document.removeEventListener('visibilitychange', queue);
        document.fonts.removeEventListener('loadingdone', refresh);
        canvas.removeEventListener('webglcontextlost', fallback);
        box.style.removeProperty('--scatter');
        delete canvas.dataset.ready;
        emblem!.style.removeProperty('--emblem-ink');
        delete emblem!.dataset.field;
        release();
        stop = () => {};
      };
    }
    void setup();
    reduced.addEventListener('change', setup);
    return () => {
      disposed = true;
      scheduleId++;
      reduced.removeEventListener('change', setup);
      stop();
    };
  }, []);
  return <canvas className="portrait-field" ref={element} aria-hidden="true" />;
}
