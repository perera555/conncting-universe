"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; z: number; pz: number; hue: number };

/**
 * Full-screen 3D starfield: stars live in (x, y, z) space and are projected
 * with a simple perspective divide, so they fly toward the viewer.
 * The mouse steers the camera, and scrolling speeds up the warp.
 */
export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DEPTH = 1600;
    const COUNT = window.innerWidth < 700 ? 450 : 900;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let speed = 2;
    let boost = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const spawn = (s: Star, far: boolean) => {
      s.x = (Math.random() - 0.5) * 2400;
      s.y = (Math.random() - 0.5) * 2400;
      s.z = far ? DEPTH : Math.random() * DEPTH;
      s.pz = s.z;
      s.hue = [255, 45, 190, 320][Math.floor(Math.random() * 4)];
    };

    const stars: Star[] = Array.from({ length: COUNT }, () => {
      const s = { x: 0, y: 0, z: 0, pz: 0, hue: 0 };
      spawn(s, false);
      return s;
    });

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / w - 0.5) * 2;
      mouse.ty = (e.clientY / h - 0.5) * 2;
    };
    let lastY = window.scrollY;
    const onScroll = () => {
      boost = Math.min(boost + Math.abs(window.scrollY - lastY) * 0.05, 30);
      lastY = window.scrollY;
    };

    const frame = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      boost *= 0.94;
      const v = reduce ? 0 : speed + boost;

      // fade previous frame toward transparent so streaks leave short trails
      // while the page's nebula gradients still show through
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      const cx = w / 2 - mouse.x * 80;
      const cy = h / 2 - mouse.y * 80;
      const fov = Math.min(w, h) * 0.9;

      for (const s of stars) {
        s.pz = s.z;
        s.z -= v;
        if (s.z < 1) {
          spawn(s, true);
          continue;
        }
        const k = fov / s.z;
        const x = s.x * k + cx;
        const y = s.y * k + cy;
        if (x < -50 || x > w + 50 || y < -50 || y > h + 50) {
          spawn(s, true);
          continue;
        }
        const pk = fov / s.pz;
        const px = s.x * pk + cx;
        const py = s.y * pk + cy;
        const near = 1 - s.z / DEPTH;
        const size = near * 2.4 + 0.2;
        const light = 70 + near * 30;
        ctx.strokeStyle = `hsla(${s.hue}, 90%, ${light}%, ${0.25 + near * 0.75})`;
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    };

    resize();
    if (reduce) speed = 0;
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90"
    />
  );
}
