import { useEffect, useRef } from "react";

const SVG_PATH = "/assets/waves-use-behind-graphic.svg";
const SPEED = 0.003;
const WAVE_WIDTH = 0.3;
const MOUSE_NUDGE = 20;

let svgCache = null;
function fetchSvg() {
  if (!svgCache) {
    svgCache = fetch(SVG_PATH).then((res) => res.text());
  }
  return svgCache;
}

const RESTING_R = 0x48, RESTING_G = 0x64, RESTING_B = 0x66;
const BRIGHT_R = 0x26, BRIGHT_G = 0x4a, BRIGHT_B = 0x50;

function lerpColor(t) {
  const r = (RESTING_R + (BRIGHT_R - RESTING_R) * t) | 0;
  const g = (RESTING_G + (BRIGHT_G - RESTING_G) * t) | 0;
  const b = (RESTING_B + (BRIGHT_B - RESTING_B) * t) | 0;
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

const ORIGINAL_COLOR = "#264A50";
const RESTING_COLOR = "#486466";

export default function InteractiveWavesGraphic() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let frameId;
    let visible = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(container);

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    fetchSvg().then((svgText) => {
      if (cancelled) return;

      container.innerHTML = svgText;
      const svg = container.querySelector("svg");
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.style.display = "block";

      const paths = Array.from(
        svg.querySelectorAll(`path[stroke="${ORIGINAL_COLOR}"]`)
      );

      for (const p of paths) {
        p.setAttribute("stroke", RESTING_COLOR);
      }

      paths.sort((a, b) => {
        const wa = parseFloat(a.getAttribute("stroke-width") || "0");
        const wb = parseFloat(b.getAttribute("stroke-width") || "0");
        return wa - wb;
      });

      const total = paths.length;
      let position = 0;
      const smoothMouse = { x: 0.5, y: 0.5 };

      function animate() {
        if (cancelled) return;

        if (visible) {
          position = (position + SPEED) % 1;

          const target = mouseRef.current;
          if (target.active) {
            smoothMouse.x += (target.x - smoothMouse.x) * 0.08;
            smoothMouse.y += (target.y - smoothMouse.y) * 0.08;
          } else {
            smoothMouse.x += (0.5 - smoothMouse.x) * 0.03;
            smoothMouse.y += (0.5 - smoothMouse.y) * 0.03;
          }

          const nudgeX = (smoothMouse.x - 0.5) * MOUSE_NUDGE;
          const nudgeY = (smoothMouse.y - 0.5) * MOUSE_NUDGE;
          svg.style.transform = `translate(${nudgeX}px, ${nudgeY}px)`;
          svg.style.transition = "transform 0.3s ease-out";

          for (let i = 0; i < total; i++) {
            const normalizedPos = i / total;

            let dist = Math.abs(normalizedPos - position);
            if (dist > 0.5) dist = 1 - dist;
            const raw =
              dist < WAVE_WIDTH
                ? Math.cos((dist / WAVE_WIDTH) * Math.PI * 0.5) ** 2
                : 0;
            const brightness = Math.min(raw * 1.8, 1);

            paths[i].setAttribute(
              "stroke",
              brightness > 0.001 ? lerpColor(brightness) : RESTING_COLOR
            );
          }
        }

        frameId = requestAnimationFrame(animate);
      }

      frameId = requestAnimationFrame(animate);
    });

    return () => {
      cancelled = true;
      if (frameId) cancelAnimationFrame(frameId);
      observer.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full cursor-default"
    />
  );
}
