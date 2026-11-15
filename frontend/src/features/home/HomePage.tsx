import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Orbit, Telescope, Zap, Layers, Compass, ShieldCheck } from 'lucide-react';
import { HeroSection } from './components/HeroSection';
import { FeatureGrid } from './components/FeatureGrid';
import { CosmosAIBar } from './components/CosmosAIBar';
import { MultiEpochBlinkDiscoverySection } from './components/MultiEpochBlinkDiscoverySection';

export function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-var(--navbar-height))] overflow-hidden bg-[#070B14]">
      {/* Section A: Full-Bleed Immersive Hero Experience (with Interactive Clickable Galaxy) */}
      <HeroSection />

      {/* Section B: Live Mission Telemetry & Quick Launchpad */}
      <div
        className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4"
        style={{ maxWidth: 'var(--content-max-width)' }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-xl text-center">
          <div className="space-y-1 border-r border-slate-800/60 last:border-r-0">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">1,295,762</div>
            <div className="text-xs text-slate-300 font-medium">Pixels Evaluated</div>
            <div className="text-[11px] text-cyan-400/80 font-normal">Scanned points of sky light</div>
          </div>
          <div className="space-y-1 sm:border-r border-slate-800/60 last:border-r-0">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-400">9 Objects</div>
            <div className="text-xs text-slate-300 font-medium">Categorized Discoveries</div>
            <div className="text-[11px] text-purple-400/80 font-normal">Asteroids, stars &amp; worlds</div>
          </div>
          <div className="space-y-1 border-r border-slate-800/60 last:border-r-0">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-400">102 Bands</div>
            <div className="text-xs text-slate-300 font-medium">SPHEREx 0.75 - 5.0 μm</div>
            <div className="text-[11px] text-blue-400/80 font-normal">Infrared heat colors</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">99.62%</div>
            <div className="text-xs text-slate-300 font-medium">Astrometric Overlap</div>
            <div className="text-[11px] text-emerald-400/80 font-normal">Photo match precision</div>
          </div>
        </div>
      </div>

      {/* Section C: Observatory Features & Cosmos AI Assistant */}
      <div
        className="relative z-10 mx-auto flex flex-col gap-12 px-4 sm:px-6 lg:px-8 pb-20 pt-6"
        style={{ maxWidth: 'var(--content-max-width)' }}
      >
        {/* Interactive Multi-Epoch Epoch 1 / Epoch 2 / Blink / Difference Discovery Station */}
        <MultiEpochBlinkDiscoverySection />

        {/* Core Feature Workstation Cards */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Observatory Scientific Workstations
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Explore multi-epoch SPHEREx tangent fields, analyze candidate shifts, and verify evidence ledgers.
              </p>
            </div>
            <Link
              to="/explore"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>Explore All 7 Sky Fields</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <FeatureGrid />
        </div>

        {/* Cosmos AI Interaction Bar */}
        <CosmosAIBar />
      </div>
    </div>
  );
}
