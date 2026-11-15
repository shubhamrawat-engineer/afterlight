import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  color: string;
  depth: number; // 1 = far, 3 = near (for parallax)
  hasSpikes?: boolean;
}

interface HeroGalaxyCanvasProps {
  className?: string;
  mousePos: { x: number; y: number };
}

/**
 * Astronomical Hero Canvas.
 * Generates an organic deep-space starfield with spectral star colours,
 * multi-layered depth, gentle optical twinkling, and smooth mouse parallax.
 * Strictly respects prefers-reduced-motion and tab visibility.
 */
export function HeroGalaxyCanvas({ className = '', mousePos }: HeroGalaxyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const targetOffsetRef = useRef({ x: 0, y: 0 });
  const currentOffsetRef = useRef({ x: 0, y: 0 });

  // Update target offset from mousePos prop (normalized -1 to 1)
  useEffect(() => {
    targetOffsetRef.current = {
      x: mousePos.x * 24,
      y: mousePos.y * 18,
    };
  }, [mousePos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Re-seed stars on resize to maintain density
      const count = Math.floor((rect.width * rect.height) / 7500);
      const starColors = [
        '#ffffff', // Pure white
        '#e0f2fe', // Blue-white (O/B type)
        '#bae6fd', // Pale cyan (A type)
        '#93c5fd', // Electric sky
        '#fef08a', // Pale warm yellow (G type, subtle)
        '#fbcfe8', // Faint nebula tint
      ];

      const newStars: Star[] = [];
      for (let i = 0; i < count; i++) {
        const depth = Math.random() < 0.6 ? 1 : Math.random() < 0.85 ? 2 : 3;
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        const size = depth === 1 ? Math.random() * 0.9 + 0.5 : depth === 2 ? Math.random() * 1.2 + 0.8 : Math.random() * 1.6 + 1.2;
        const baseAlpha = depth === 1 ? Math.random() * 0.4 + 0.2 : depth === 2 ? Math.random() * 0.5 + 0.4 : Math.random() * 0.4 + 0.6;

        newStars.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          size,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: (Math.random() * 0.02 + 0.008) * (Math.random() < 0.5 ? 1 : -1),
          color,
          depth,
          hasSpikes: depth === 3 && Math.random() < 0.25,
        });
      }
      starsRef.current = newStars;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      if (!ctx || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Smooth lerp parallax offset
      if (!prefersReducedMotion) {
        currentOffsetRef.current.x += (targetOffsetRef.current.x - currentOffsetRef.current.x) * 0.05;
        currentOffsetRef.current.y += (targetOffsetRef.current.y - currentOffsetRef.current.y) * 0.05;
      }

      ctx.clearRect(0, 0, width, height);

      const offsetX = currentOffsetRef.current.x;
      const offsetY = currentOffsetRef.current.y;
      const stars = starsRef.current;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        if (!prefersReducedMotion) {
          s.alpha += s.twinkleSpeed;
          if (s.alpha > s.baseAlpha + 0.3 || s.alpha < s.baseAlpha - 0.2) {
            s.twinkleSpeed = -s.twinkleSpeed;
          }
        }

        // Apply depth-dependent parallax offset
        const parallaxFactor = s.depth * 0.35;
        let px = s.x + offsetX * parallaxFactor;
        let py = s.y + offsetY * parallaxFactor;

        // Wrap around viewport edges smoothly
        if (px < 0) px += width;
        if (px > width) px -= width;
        if (py < 0) py += height;
        if (py > height) py -= height;

        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));

        ctx.beginPath();
        ctx.arc(px, py, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw subtle optical diffraction cross spikes on bright foreground stars
        if (s.hasSpikes && s.alpha > 0.6) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = s.alpha * 0.45;

          const spikeLen = s.size * 3.5;
          ctx.beginPath();
          ctx.moveTo(px - spikeLen, py);
          ctx.lineTo(px + spikeLen, py);
          ctx.moveTo(px, py - spikeLen);
          ctx.lineTo(px, py + spikeLen);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;

      if (!prefersReducedMotion) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (prefersReducedMotion) {
      // Single draw pass
      render();
    } else {
      animFrameRef.current = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}
