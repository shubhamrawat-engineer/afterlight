import { useState, useCallback } from 'react';
import { ArrowRight, Sparkles, Orbit, Telescope, Compass, Layers, X, ExternalLink, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { HeroGalaxyCanvas } from './HeroGalaxyCanvas';

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isGalaxyOpen, setIsGalaxyOpen] = useState(false);
  const [galaxyFilter, setGalaxyFilter] = useState<'composite' | '3.98' | '2.42' | '0.75'>('composite');
  const navigate = useNavigate();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  return (
    <section
      aria-label="AFTERLIGHT Observatory Hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full overflow-hidden bg-[#070B14] min-h-[640px] sm:min-h-[700px] lg:min-h-[780px] flex items-center justify-center ${
        className ?? ''
      }`}
    >
      {/* ── Layer 1: Galaxy Visual Backdrop ──────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Dynamic Interactive Starfield Canvas */}
        <HeroGalaxyCanvas mousePos={mousePos} className="z-10" />

        {/* Ambient Cosmic Core Nebula & Volumetric Glows */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(circle at 66% 42%, rgba(69, 213, 242, 0.24) 0%, rgba(67, 136, 255, 0.18) 28%, rgba(155, 140, 255, 0.12) 52%, transparent 74%),
              radial-gradient(circle at 22% 60%, rgba(67, 136, 255, 0.15) 0%, rgba(16, 26, 43, 0.32) 45%, transparent 72%),
              radial-gradient(circle at 82% 24%, rgba(209, 123, 219, 0.15) 0%, transparent 48%)
            `,
          }}
        />

        {/* Full-Bleed Spiral Galaxy Visual (Interactive Clickable Target with 3D Tilt & Astrophotography Physics) */}
        <div
          onClick={() => setIsGalaxyOpen(true)}
          title="Click to Open Deep-Field Galaxy Explorer"
          className="absolute inset-0 h-full w-full cursor-pointer group pointer-events-auto"
          style={{
            perspective: '1300px',
            transform: `perspective(1300px) rotateX(${mousePos.y * -8.5}deg) rotateY(${mousePos.x * 12.5}deg) translate3d(${mousePos.x * -24}px, ${mousePos.y * -16}px, 0px) scale(1.07)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
        >
          {/* Authentic Space Telescope Image with Slow Cosmic Drift */}
          <img
            src="/assets/galaxy.png"
            alt="COSMOS Deep-Field Galaxy Core"
            loading="eager"
            fetchPriority="high"
            className="h-full w-full object-cover object-[62%_44%] sm:object-[60%_45%] lg:object-[58%_45%] opacity-95 contrast-[1.08] brightness-[1.03] saturate-[1.05] transition-all duration-700 group-hover:scale-[1.03]"
            style={{
              animation: 'cosmicGalaxyDrift 110s ease-in-out infinite alternate',
              transformOrigin: '62% 45%',
              maskImage: `
                radial-gradient(ellipse 92% 84% at 62% 45%, black 38%, rgba(0,0,0,0.88) 65%, rgba(0,0,0,0.35) 86%, transparent 100%),
                linear-gradient(to bottom, transparent 0%, black 8%, black 84%, transparent 100%)
              `,
              WebkitMaskImage: `
                radial-gradient(ellipse 92% 84% at 62% 45%, black 38%, rgba(0,0,0,0.88) 65%, rgba(0,0,0,0.35) 86%, transparent 100%),
                linear-gradient(to bottom, transparent 0%, black 8%, black 84%, transparent 100%)
              `,
              maskComposite: 'intersect',
              WebkitMaskComposite: 'destination-in',
            }}
          />

          {/* Microscopic Astronomical Sensor Shot Noise Overlay */}
          <div className="astronomical-photon-grain absolute inset-0 pointer-events-none z-10 opacity-35 mix-blend-overlay" />

          {/* Thermal Galactic Infrared Core Breathing Glow */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              left: '62%',
              top: '45%',
              width: '260px',
              height: '260px',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(147, 217, 255, 0.42) 0%, rgba(56, 189, 248, 0.24) 35%, rgba(129, 140, 248, 0.12) 65%, transparent 80%)',
              animation: 'cosmicCorePulse 9s ease-in-out infinite alternate',
              mixBlendMode: 'screen',
            }}
          />

          {/* Optical 4-Point Space Telescope Diffraction Cross Spikes (Hubble / JWST / SPHEREx Secondary Spider Optics) */}
          <div className="diffraction-spike-star" style={{ left: '64%', top: '82%', animation: 'diffractionSpikePulse 6s ease-in-out infinite alternate' }}>
            <div className="diffraction-core-dot" />
          </div>
          <div className="diffraction-spike-star" style={{ left: '22%', top: '68%', animation: 'diffractionSpikePulse 7s ease-in-out 1s infinite alternate' }}>
            <div className="diffraction-core-dot" />
          </div>
          <div className="diffraction-spike-star" style={{ left: '76%', top: '44%', animation: 'diffractionSpikePulse 5.5s ease-in-out 0.5s infinite alternate' }}>
            <div className="diffraction-core-dot" />
          </div>
          <div className="diffraction-spike-star" style={{ left: '30%', top: '34%', animation: 'diffractionSpikePulse 8s ease-in-out 2s infinite alternate' }}>
            <div className="diffraction-core-dot" />
          </div>

          {/* Space Observatory Astrometric WCS Tangent Telemetry Stamp */}
          <div className="absolute bottom-8 right-8 hidden lg:flex flex-col items-end gap-1 font-mono text-[11px] text-cyan-300/80 pointer-events-none z-20 bg-[#070B14]/75 px-3.5 py-2 rounded-xl border border-cyan-500/25 backdrop-blur-sm shadow-lg">
            <div className="flex items-center gap-2 text-cyan-200 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>WCS TANGENT PROJECTION (ICRS J2000)</span>
            </div>
            <div className="text-slate-400">RA 150.1005° • DEC +02.2024° • 6.2″/px</div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 w-full justify-between">
              <span>FOV: 0.25° × 0.25°</span>
              <span className="text-cyan-400/90 font-bold">SPHEREx BAND 1-6</span>
            </div>
          </div>
        </div>

        {/* Localized Readability Scrim */}
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background: `
              radial-gradient(ellipse 68% 72% at 24% 50%, rgba(7, 11, 20, 0.72) 0%, rgba(7, 11, 20, 0.42) 52%, transparent 86%),
              linear-gradient(180deg, rgba(7, 11, 20, 0.55) 0%, transparent 22%, transparent 74%, #070B14 100%)
            `,
          }}
        />
      </div>

      {/* ── Layer 2: Hero Foreground Content ──────────────────────── */}
      <div
        className="relative z-30 mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-22"
        style={{ maxWidth: 'var(--content-max-width)' }}
      >
        <div className="max-w-2xl sm:max-w-3xl space-y-6">
          {/* Eyebrow Tagline Pill */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#24344D] bg-[#0A1020]/85 px-4 py-1.5 text-xs font-medium tracking-[0.06em] text-[#45D5F2] backdrop-blur-md shadow-[0_6px_24px_rgba(3,6,14,0.45)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#45D5F2] opacity-70" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#45D5F2]" />
            </span>
            <span>The Universe Leaves Clues</span>
            <span className="text-[#324869]">•</span>
            <span className="text-[#B5C2D6] hidden sm:inline">NASA SPHEREx Multi-Epoch Platform</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-hero-heading text-[#F4F7FF] drop-shadow-[0_4px_28px_rgba(3,6,14,0.65)] font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight">
            Explore. Analyse.{' '}
            <span className="block mt-1.5 bg-gradient-to-r from-[#45D5F2] via-[#7EB8FF] to-[#9B8CFF] bg-clip-text text-transparent">
              Discover.
            </span>
          </h1>

          {/* Supporting Paragraph Description */}
          <p className="text-base sm:text-[17px] text-[#E1E9F7] max-w-xl sm:max-w-2xl leading-relaxed font-normal text-balance drop-shadow-[0_2px_12px_rgba(3,6,14,0.75)]">
            Investigate celestial change across real NASA SPHEREx multi-epoch observations with
            task-specific compatibility checks, defensible photometric uncertainty budgets, and an
            autonomous discovery sifter for comets, asteroids, variable stars, and candidate planetary worlds.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <Button
              to="/explore"
              variant="primary"
              size="lg"
              className="bg-gradient-to-r from-[#4388FF] to-[#2F73EB] hover:from-[#5A9BFF] hover:to-[#4388FF] text-[#F4F7FF] font-semibold shadow-[0_8px_28px_rgba(67,136,255,0.4)] border border-[#45D5F2]/40 transition-all hover:-translate-y-0.5 cursor-pointer"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Start Exploring
            </Button>

            <Button
              to="/objects"
              variant="secondary"
              size="lg"
              className="border border-[#24344D] bg-[#101A2B] hover:bg-[#131F33] text-[#F4F7FF] font-semibold transition-all hover:-translate-y-0.5 cursor-pointer"
              leftIcon={<Sparkles className="h-4 w-4 text-[#45D5F2]" />}
            >
              Celestial Objects (9)
            </Button>

            <button
              onClick={() => setIsGalaxyOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 hover:border-cyan-400 active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Telescope className="h-4 w-4 text-cyan-400" />
              <span>Inspect Galaxy Core</span>
            </button>
          </div>

          {/* Transparent Environment & Workflow Strip */}
          <div className="pt-6 sm:pt-7 flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-[#B5C2D6] border-t border-[#24344D]/80 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-300 font-medium">NASA IRSA Archive: Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4388FF]" />
              <span>SPHEREx DR1: 102 Spectral Bands</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Multi-Epoch Photometric Baseline</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Deep-Space Galaxy Modal (Opens on Click!) ────────────── */}
      {isGalaxyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 sm:p-6 animate-fade-in">
          <div className="relative w-full max-w-5xl rounded-3xl border border-cyan-500/40 bg-[#070B14] shadow-[0_0_60px_rgba(69,213,242,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <Telescope className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    COSMOS Deep-Field Spiral Galaxy Explorer
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      LIVE INSPECTION
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ICRS J2000: RA 150.1005° • Dec +02.2024° • Tangent FOV: 0.25° × 0.25°
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGalaxyOpen(false)}
                className="h-9 w-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Close galaxy viewer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Image Viewport */}
            <div className="relative flex-1 min-h-[340px] sm:min-h-[420px] bg-black overflow-hidden flex items-center justify-center p-2">
              <img
                src={
                  galaxyFilter === '3.98'
                    ? '/static/demo-deepfield-01/earlier.png'
                    : galaxyFilter === '2.42'
                    ? '/static/demo-deepfield-01/later.png'
                    : galaxyFilter === '0.75'
                    ? '/static/demo-deepfield-01/difference.png'
                    : '/assets/galaxy.png'
                }
                alt="COSMOS Deep Space View"
                className="h-full w-full object-contain rounded-xl transition-all duration-300"
              />

              {/* Viewport Overlay HUD */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/30 text-xs font-mono text-cyan-300">
                <span className="font-semibold text-white">🔭 Active Telescope Channel:</span>
                <span>
                  {galaxyFilter === '3.98'
                    ? 'SPHEREx Band 5 (3.98 μm DR1 Tangent)'
                    : galaxyFilter === '2.42'
                    ? 'SPHEREx Band 3 (2.42 μm Multi-Epoch)'
                    : galaxyFilter === '0.75'
                    ? 'Photometric Difference Map (ΔF = +0.32 mJy)'
                    : 'NASA Cosmic Composite Spiral Overview'}
                </span>
              </div>
            </div>

            {/* Modal Filter Controls & Action CTAs */}
            <div className="border-t border-slate-800 p-6 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Filter Toggles */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 mr-1">Passband:</span>
                <button
                  onClick={() => setGalaxyFilter('composite')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    galaxyFilter === 'composite'
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  Composite
                </button>
                <button
                  onClick={() => setGalaxyFilter('3.98')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    galaxyFilter === '3.98'
                      ? 'bg-cyan-600 text-white border-cyan-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  SPHEREx 3.98 μm
                </button>
                <button
                  onClick={() => setGalaxyFilter('2.42')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    galaxyFilter === '2.42'
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  SPHEREx 2.42 μm
                </button>
                <button
                  onClick={() => setGalaxyFilter('0.75')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    galaxyFilter === '0.75'
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  Difference Map
                </button>
              </div>

              {/* Deep Links into the platform */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  to="/explore"
                  variant="primary"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold flex-1 sm:flex-initial"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Open in Universe Explorer
                </Button>
                <Button
                  to="/temporal-analysis/demo-deepfield-01"
                  variant="secondary"
                  size="sm"
                  className="bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border-purple-500/40 flex-1 sm:flex-initial"
                  leftIcon={<Zap className="h-4 w-4 text-purple-300" />}
                >
                  Temporal Blink
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
