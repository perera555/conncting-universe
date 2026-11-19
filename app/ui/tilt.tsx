"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";

/** A card that tilts in 3D toward the pointer, with a moving light glare. */
export default function Tilt({
  children,
  className = "",
  max = 12,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateZ(10px)`;
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  };

  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={`tilt relative ${className}`}>
      {children}
      <span className="tilt-glare" />
    </div>
  );
}
