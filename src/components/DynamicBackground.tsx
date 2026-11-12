import React, { useEffect, useRef } from "react";
import { AppCustomization } from "../types";

interface DynamicBackgroundProps {
  customization: AppCustomization;
  isPlaying?: boolean;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  customization,
  isPlaying = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas particle starfield animation for 'particles' bgType
  useEffect(() => {
    if (customization.bgType !== "particles") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 380);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 560);

    const particles: {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      fadeSpeed: number;
    }[] = [];

    const numParticles = 48;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.2, // float upwards
        alpha: Math.random() * 0.7 + 0.2,
        fadeSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const accent = customization.accentColor || "#1DB954";

      particles.forEach((p) => {
        p.x += p.vx * (isPlaying ? 1.5 : 1);
        p.y += p.vy * (isPlaying ? 1.5 : 1);
        p.alpha += p.fadeSpeed;

        if (p.alpha <= 0.1 || p.alpha >= 0.85) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.85, p.alpha));
        ctx.shadowBlur = 6;
        ctx.shadowColor = accent;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [customization.bgType, customization.accentColor, isPlaying]);

  const { bgType, customBgUrl, customBgDim, customBgBlur } = customization;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {/* 1. Custom Image / GIF */}
      {bgType === "image" && customBgUrl && (
        <img
          src={customBgUrl}
          alt="Custom Background"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
          style={{
            filter: `blur(${customBgBlur}px)`,
            transform: "scale(1.08)", // avoid blur clipping at edges
          }}
        />
      )}

      {/* 2. Custom Video */}
      {bgType === "video" && customBgUrl && (
        <video
          src={customBgUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
          style={{
            filter: `blur(${customBgBlur}px)`,
            transform: "scale(1.08)",
          }}
        />
      )}

      {/* 3. Dynamic Animated Aurora */}
      {bgType === "aurora" && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div
            className="absolute -inset-[30%] opacity-70 blur-3xl animate-aurora-wave"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${customization.accentColor} 0%, transparent 50%), radial-gradient(circle at 70% 70%, #6366F1 0%, transparent 60%), radial-gradient(circle at 50% 80%, #EC4899 0%, transparent 50%)`,
            }}
          />
        </div>
      )}

      {/* 4. Canvas Floating Particles */}
      {bgType === "particles" && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}

      {/* 5. Animated Mesh Gradient */}
      {bgType === "mesh" && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div
            className="absolute -inset-[40%] blur-[48px] animate-mesh-flow opacity-60"
            style={{
              background: `radial-gradient(ellipse at top left, ${customization.accentColor}44, transparent 50%), radial-gradient(ellipse at bottom right, #3B82F644, transparent 50%), radial-gradient(ellipse at center, #8B5CF633, transparent 60%)`,
            }}
          />
        </div>
      )}

      {/* Dark Overlay Dimmer (Ensures all UI text remains legible) */}
      {(bgType === "image" || bgType === "video" || bgType === "aurora" || bgType === "mesh") && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-300"
          style={{ opacity: customBgDim / 100 }}
        />
      )}
    </div>
  );
};
