import type { CSSProperties } from "react";

/** Pure-CSS 3D planet with tilted, spinning rings and an orbiting moon. */
export default function Planet({ size = 340 }: { size?: number }) {
  return (
    <div className="scene grid place-items-center" aria-hidden>
      <div className="planet-wrap" style={{ "--size": `${size}px` } as CSSProperties}>
        <div className="ring ring-b" />
        <div className="planet" />
        <div className="ring ring-a">
          <span className="moon" />
        </div>
      </div>
    </div>
  );
}
