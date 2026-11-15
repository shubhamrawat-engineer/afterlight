import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Layers, Sparkles, ArrowRight, ShieldCheck, Orbit, Compass, Eye } from 'lucide-react';

interface DiscoveryObject {
  id: string;
  name: string;
  simpleTitle: string;
  tagline: string;
  categoryBadge: string;
  epoch1Date: string;
  epoch2Date: string;
  speed: string;
  distance: string;
  temperature: string;
  howToSpot: string;
  funFact: string;
}

const DISCOVERY_OBJECTS: DiscoveryObject[] = [
  {
    id: 'SPX-OBJ-KBO-XR1',
    name: 'Trans-Neptunian Candidate 2024-XR1',
    simpleTitle: 'Outer Solar System Ice World (Planet X Candidate)',
    tagline: 'A distant world orbiting in the frigid deep freeze beyond Neptune, moving steadily against frozen background stars.',
    categoryBadge: 'MOVING BODY • 48.2 AU',
    epoch1Date: '2025-04-12 (T0 Baseline)',
    epoch2Date: '2026-04-26 (T1 Follow-up)',
    speed: '26.2 mas/day (3.42″ per year)',
    distance: '48.2 AU (~4.5 Billion Miles)',
    temperature: '40.2 K (-387°F, Cold Methane Frost)',
    howToSpot: 'When you blink between Epoch 1 and Epoch 2, look closely at the center: the blue dot leaps 4.82 arcseconds to the right while millions of distant background stars remain completely motionless!',
    funFact: 'Because this object is so far from the Sun, visible sunlight takes over 6.6 hours to reach it and bounce back toward SPHEREx!',
  },
  {
    id: 'SPX-OBJ-COMET-C2',
    name: 'Cometary Outburst Candidate C/2026-SP1',
    simpleTitle: 'Awakening Dirty Snowball Comet',
    tagline: 'A giant ball of frozen ice and dust heating up as it approaches the inner solar system, outgassing a bright infrared cloud.',
    categoryBadge: 'COMETARY OUTBURST',
    epoch1Date: '2025-05-18 (T0 Inactive)',
    epoch2Date: '2026-06-02 (T1 Outburst)',
    speed: '48.5 mas/day (Fast Motion)',
    distance: '3.12 AU (Asteroid Belt Rim)',
    temperature: '142 K (-204°F, Sublimating CO₂ & H₂O)',
    howToSpot: 'In Epoch 1 it was a faint pinpoint; in Epoch 2 a giant fuzzy haze of warm infrared gas expanded around it, creating a brilliant positive peak in the Difference Map!',
    funFact: 'SPHEREx’s 102 color bands can detect the exact chemical fingerprint of water ice and carbon dioxide ice vaporizing in real time!',
  },
  {
    id: 'SPX-OBJ-NEO-2025',
    name: 'Near-Earth Asteroid Candidate 2025-SPX1',
    simpleTitle: 'Speeding Near-Earth Asteroid',
    tagline: 'A space boulder racing past Earth’s orbital neighborhood at immense velocity, producing a distinctive trail.',
    categoryBadge: 'NEAR-EARTH ASTEROID',
    epoch1Date: '2025-08-04 (T0)',
    epoch2Date: '2025-08-20 (T1 16-Day)',
    speed: '124.6 mas/day (Rapid Flyby)',
    distance: '1.42 AU (~132 Million Miles)',
    temperature: '265 K (+17°F, Solar Heated Rock)',
    howToSpot: 'Because this rock is so close to Earth, it streaks across the sky much faster than distant stars, leaving a dramatic astrometric dipole in difference subtraction.',
    funFact: 'NASA astronomers use multi-epoch difference subtraction to pinpoint asteroid trajectories with sub-pixel precision to ensure Earth orbital safety.',
  },
];

export function MultiEpochBlinkDiscoverySection() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'e1' | 'e2' | 'diff'>('diff');
  const [isBlinking, setIsBlinking] = useState(true);
  const [blinkPhase, setBlinkPhase] = useState<'e1' | 'e2'>('e1');

  const obj = DISCOVERY_OBJECTS[selectedIdx];

  // Auto-blink toggler
  useEffect(() => {
    if (!isBlinking) return;
    const interval = setInterval(() => {
      setBlinkPhase((p) => (p === 'e1' ? 'e2' : 'e1'));
    }, 600);
    return () => clearInterval(interval);
  }, [isBlinking]);

  const currentImg = isBlinking
    ? `/static/objects_media/${obj.id}/${blinkPhase === 'e1' ? 'epoch1' : 'epoch2'}.png`
    : viewMode === 'e1'
    ? `/static/objects_media/${obj.id}/epoch1.png`
    : viewMode === 'e2'
    ? `/static/objects_media/${obj.id}/epoch2.png`
    : `/static/objects_media/${obj.id}/difference.png`;

  const badgeText = isBlinking
    ? blinkPhase === 'e1'
      ? '● BLINK: EPOCH 1 (BASELINE)'
      : '● BLINK: EPOCH 2 (FOLLOW-UP)'
    : viewMode === 'e1'
    ? 'EPOCH 1: 2025 BASELINE SCAN'
    : viewMode === 'e2'
    ? 'EPOCH 2: 2026 FOLLOW-UP SCAN'
    : 'SUBTRACTED DIFFERENCE MAP (STARS REMOVED)';

  return (
    <section className="relative rounded-3xl border border-[#24344D] bg-[#0A1020]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1A2940] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-[#45D5F2] uppercase tracking-wider">
            <Orbit className="w-4 h-4" />
            <span>Interactive Multi-Epoch Discovery Station</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Epoch 1 • Epoch 2 • Difference Subtraction • Blink Comparator
          </h2>
          <p className="text-xs sm:text-sm text-[#8293AD] mt-1 max-w-2xl">
            See how astronomers detect brand new worlds, comets, and exploding stars by blinking space telescope photos taken months apart.
          </p>
        </div>

        {/* 3 Candidate Selector Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto py-1">
          {DISCOVERY_OBJECTS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedIdx(idx);
                setViewMode('diff');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                selectedIdx === idx
                  ? 'bg-[#4388FF] text-white border-[#4388FF] shadow-lg shadow-[#4388FF]/20'
                  : 'bg-[#101A2B] text-[#8293AD] border-[#24344D] hover:text-white hover:bg-[#131F33]'
              }`}
            >
              {item.name.split(' ')[0]} {item.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Grid: Left Image Viewer / Right Simple Form Data */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image Blink Viewport (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative aspect-video sm:h-80 w-full rounded-2xl overflow-hidden border border-[#24344D] bg-[#040711] flex items-center justify-center shadow-xl">
            <img
              src={currentImg}
              alt={obj.name}
              className="w-full h-full object-contain transition-opacity duration-150"
            />

            {/* Status Overlay Badge */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#070B14]/90 backdrop-blur-md text-[#45D5F2] border border-[#45D5F2]/40 shadow-md">
              {badgeText}
            </div>

            {/* Live Blink Indicator */}
            {isBlinking && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500 text-black shadow-lg animate-pulse">
                ● LIVE AUTO-BLINK
              </div>
            )}
          </div>

          {/* Interactive Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsBlinking(false);
                  setViewMode('e1');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  viewMode === 'e1' && !isBlinking
                    ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                    : 'bg-[#101A2B] border-[#24344D] text-[#8293AD] hover:text-white'
                }`}
              >
                Epoch 1
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBlinking(false);
                  setViewMode('e2');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  viewMode === 'e2' && !isBlinking
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                    : 'bg-[#101A2B] border-[#24344D] text-[#8293AD] hover:text-white'
                }`}
              >
                Epoch 2
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBlinking(false);
                  setViewMode('diff');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  viewMode === 'diff' && !isBlinking
                    ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200'
                    : 'bg-[#101A2B] border-[#24344D] text-[#8293AD] hover:text-white'
                }`}
              >
                Difference Map
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setViewMode('diff');
                setIsBlinking(!isBlinking);
              }}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isBlinking
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isBlinking ? 'Stop Blink' : '⚡ Blink Epoch 1 & 2'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Simple Form Data Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4 rounded-2xl border border-[#24344D] bg-[#070B14] p-5">
          {/* Object Name & Category */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-[#45D5F2]">{obj.id}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40">
                {obj.categoryBadge}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">{obj.name}</h3>
            <p className="text-xs text-[#45D5F2] font-medium">{obj.simpleTitle}</p>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">{obj.tagline}</p>
          </div>

          {/* How to Spot the Shift in Simple Terms */}
          <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-3 space-y-1 text-xs">
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <span>💡</span>
              <span>How to Spot the Shift:</span>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed">{obj.howToSpot}</p>
          </div>

          {/* Simple Form Plain-English Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#101A2B] border border-[#1A2940]">
              <span className="text-[#8293AD] text-[10px] uppercase font-mono block">Speed / Motion:</span>
              <span className="text-white font-semibold text-xs block">{obj.speed}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#101A2B] border border-[#1A2940]">
              <span className="text-[#8293AD] text-[10px] uppercase font-mono block">Distance:</span>
              <span className="text-white font-semibold text-xs block">{obj.distance}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#101A2B] border border-[#1A2940]">
              <span className="text-[#8293AD] text-[10px] uppercase font-mono block">Temperature:</span>
              <span className="text-white font-semibold text-xs block">{obj.temperature}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#101A2B] border border-[#1A2940]">
              <span className="text-[#8293AD] text-[10px] uppercase font-mono block">Astrometry:</span>
              <span className="text-emerald-400 font-semibold text-xs block">Gaia DR3 (&lt;0.12″)</span>
            </div>
          </div>

          {/* Inspect Full Ledger CTA Button */}
          <div className="pt-2">
            <Link
              to={`/objects/${obj.id}`}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[#4388FF] hover:bg-[#5A9BFF] text-white text-xs font-semibold shadow-lg shadow-[#4388FF]/20 transition-all"
            >
              <span>Inspect Full Ledger &amp; Scientific Data</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
