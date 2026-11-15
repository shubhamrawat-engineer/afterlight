import type { FeatureVisualType } from '../home.types';

export function FeatureVisual({ type }: { type: FeatureVisualType }) {
  switch (type) {
    case 'orbit':
      return (
        <svg
          viewBox="0 0 200 120"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="centerCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="1" />
              <stop offset="35%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#1d4ed8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background grid dots */}
          <circle cx="25" cy="20" r="0.75" fill="#60a5fa" fillOpacity="0.4" />
          <circle cx="170" cy="25" r="1" fill="#60a5fa" fillOpacity="0.5" />
          <circle cx="185" cy="85" r="0.75" fill="#60a5fa" fillOpacity="0.3" />
          <circle cx="30" cy="100" r="0.8" fill="#60a5fa" fillOpacity="0.4" />

          {/* Outer Orbital Ring */}
          <ellipse
            cx="100"
            cy="60"
            rx="78"
            ry="36"
            stroke="#3b82f6"
            strokeOpacity="0.25"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Mid Orbital Ring (Tilted) */}
          <ellipse
            cx="100"
            cy="60"
            rx="60"
            ry="24"
            transform="rotate(-12 100 60)"
            stroke="#60a5fa"
            strokeOpacity="0.5"
            strokeWidth="1.2"
          />

          {/* Inner Orbital Ring */}
          <ellipse
            cx="100"
            cy="60"
            rx="36"
            ry="14"
            transform="rotate(18 100 60)"
            stroke="#93c5fd"
            strokeOpacity="0.4"
            strokeWidth="1"
          />

          {/* Orbiting Bodies */}
          <circle cx="152" cy="50" r="3.5" fill="url(#nodeGlow)" />
          <circle cx="152" cy="50" r="1.5" fill="#ffffff" />

          <circle cx="48" cy="67" r="2.5" fill="url(#nodeGlow)" />
          <circle cx="48" cy="67" r="1" fill="#ffffff" />

          <circle cx="118" cy="48" r="2" fill="#93c5fd" fillOpacity="0.8" />

          {/* Central Blue Celestial Object */}
          <circle cx="100" cy="60" r="22" fill="url(#centerCore)" />
          <circle cx="100" cy="60" r="7" fill="#60a5fa" />
          <circle cx="100" cy="60" r="3.5" fill="#ffffff" />
        </svg>
      );

    case 'temporal':
      return (
        <svg
          viewBox="0 0 200 120"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="frameGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="frameGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0c1e47" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Earlier Observation Frame (Epoch 1) */}
          <g transform="translate(34, 18)">
            <rect
              width="80"
              height="64"
              rx="4"
              fill="url(#frameGrad1)"
              stroke="#334155"
              strokeWidth="1"
            />
            {/* Grid & Reticle */}
            <line x1="40" y1="8" x2="40" y2="56" stroke="#475569" strokeWidth="0.7" strokeDasharray="2 2" strokeOpacity="0.4" />
            <line x1="12" y1="32" x2="68" y2="32" stroke="#475569" strokeWidth="0.7" strokeDasharray="2 2" strokeOpacity="0.4" />
            <circle cx="40" cy="32" r="5" stroke="#64748b" strokeWidth="0.8" />
            <circle cx="28" cy="22" r="1.5" fill="#94a3b8" fillOpacity="0.7" />
            <circle cx="56" cy="44" r="1" fill="#94a3b8" fillOpacity="0.5" />
            <text x="8" y="14" fill="#64748b" fontSize="6" fontFamily="var(--font-mono)">T0: 2024</text>
          </g>

          {/* Connection Vector */}
          <path
            d="M 94 48 L 112 56"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            strokeOpacity="0.8"
          />

          {/* Later Observation Frame (Epoch 2 - Overlapping, Shifted & Highlighted) */}
          <g transform="translate(86, 36)">
            <rect
              width="82"
              height="66"
              rx="4"
              fill="url(#frameGrad2)"
              stroke="#3b82f6"
              strokeWidth="1.2"
              className="drop-shadow-[0_4px_12px_rgba(30,58,138,0.5)]"
            />
            {/* Target reticle */}
            <circle cx="41" cy="33" r="10" stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="2 2" />
            <circle cx="41" cy="33" r="3" fill="#38bdf8" />
            <circle cx="41" cy="33" r="1" fill="#ffffff" />
            {/* Flux change badge */}
            <circle cx="26" cy="22" r="2.5" fill="#93c5fd" />
            <circle cx="60" cy="46" r="2" fill="#60a5fa" fillOpacity="0.8" />
            <text x="8" y="14" fill="#93c5fd" fontSize="6" fontWeight="bold" fontFamily="var(--font-mono)">T1: +Δλ</text>
            {/* Corner brackets */}
            <path d="M 6 6 L 6 10 M 6 6 L 10 6" stroke="#60a5fa" strokeWidth="1" />
            <path d="M 76 60 L 76 56 M 76 60 L 72 60" stroke="#60a5fa" strokeWidth="1" />
          </g>
        </svg>
      );

    case 'spectral':
      return (
        <svg
          viewBox="0 0 200 120"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="specAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#1e3a8a" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0b1120" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="specLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="35%" stopColor="#60a5fa" />
              <stop offset="65%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="20" y1="25" x2="180" y2="25" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="20" y1="50" x2="180" y2="50" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="20" y1="75" x2="180" y2="75" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="20" y1="95" x2="180" y2="95" stroke="#334155" strokeWidth="1" />

          {/* Vertical band markers */}
          <line x1="68" y1="20" x2="68" y2="95" stroke="#3b82f6" strokeWidth="0.6" strokeDasharray="2 2" strokeOpacity="0.5" />
          <line x1="125" y1="20" x2="125" y2="95" stroke="#3b82f6" strokeWidth="0.6" strokeDasharray="2 2" strokeOpacity="0.5" />

          {/* Spectral Waveform Area */}
          <path
            d="M 20 95 
               C 35 94, 45 88, 54 78
               C 60 70, 64 35, 68 32
               C 72 29, 76 60, 85 75
               C 95 90, 108 86, 116 68
               C 120 58, 123 38, 126 36
               C 130 34, 136 65, 146 82
               C 156 94, 168 93, 180 95
               L 180 95 L 20 95 Z"
            fill="url(#specAreaGrad)"
          />

          {/* Spectral Waveform Line */}
          <path
            d="M 20 95 
               C 35 94, 45 88, 54 78
               C 60 70, 64 35, 68 32
               C 72 29, 76 60, 85 75
               C 95 90, 108 86, 116 68
               C 120 58, 123 38, 126 36
               C 130 34, 136 65, 146 82
               C 156 94, 168 93, 180 95"
            stroke="url(#specLineGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Glowing Peak Nodes */}
          <circle cx="68" cy="32" r="4" fill="#38bdf8" fillOpacity="0.3" />
          <circle cx="68" cy="32" r="2" fill="#ffffff" />

          <circle cx="126" cy="36" r="4" fill="#a855f7" fillOpacity="0.3" />
          <circle cx="126" cy="36" r="2" fill="#ffffff" />

          {/* Axis Labels */}
          <text x="22" y="106" fill="#64748b" fontSize="6" fontFamily="var(--font-mono)">0.75 μm</text>
          <text x="68" y="106" fill="#38bdf8" fontSize="6" textAnchor="middle" fontFamily="var(--font-mono)">2.4 μm</text>
          <text x="126" y="106" fill="#818cf8" fontSize="6" textAnchor="middle" fontFamily="var(--font-mono)">3.8 μm</text>
          <text x="180" y="106" fill="#64748b" fontSize="6" textAnchor="end" fontFamily="var(--font-mono)">5.0 μm</text>
        </svg>
      );

    case 'intelligence':
      return (
        <svg
          viewBox="0 0 200 120"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="meshGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient Glow */}
          <circle cx="100" cy="60" r="48" fill="url(#meshGlow)" />

          {/* Outer Boundary Rings */}
          <circle cx="100" cy="60" r="44" stroke="#1e3a8a" strokeWidth="0.8" strokeOpacity="0.6" strokeDasharray="3 3" />
          <circle cx="100" cy="60" r="32" stroke="#3b82f6" strokeWidth="0.6" strokeOpacity="0.3" />

          {/* 3D Wireframe Polyhedron Structure */}
          {/* Main vertices */}
          {/* V0: top (100, 24) */}
          {/* V1: upper left (68, 44) */}
          {/* V2: upper right (132, 44) */}
          {/* V3: center (100, 60) */}
          {/* V4: lower left (74, 82) */}
          {/* V5: lower right (126, 82) */}
          {/* V6: bottom (100, 96) */}

          {/* Wireframe connections */}
          <g stroke="#60a5fa" strokeOpacity="0.6" strokeWidth="1">
            <line x1="100" y1="24" x2="68" y2="44" />
            <line x1="100" y1="24" x2="132" y2="44" />
            <line x1="100" y1="24" x2="100" y2="60" />

            <line x1="68" y1="44" x2="132" y2="44" />
            <line x1="68" y1="44" x2="100" y2="60" />
            <line x1="132" y1="44" x2="100" y2="60" />

            <line x1="68" y1="44" x2="74" y2="82" />
            <line x1="132" y1="44" x2="126" y2="82" />

            <line x1="100" y1="60" x2="74" y2="82" />
            <line x1="100" y1="60" x2="126" y2="82" />
            <line x1="74" y1="82" x2="126" y2="82" />

            <line x1="74" y1="82" x2="100" y2="96" />
            <line x1="126" y1="82" x2="100" y2="96" />
            <line x1="100" y1="60" x2="100" y2="96" strokeDasharray="2 2" strokeOpacity="0.4" />
          </g>

          {/* Translucent Faces */}
          <polygon points="100,24 68,44 100,60" fill="#3b82f6" fillOpacity="0.12" />
          <polygon points="100,24 132,44 100,60" fill="#60a5fa" fillOpacity="0.08" />
          <polygon points="68,44 100,60 74,82" fill="#1d4ed8" fillOpacity="0.15" />
          <polygon points="132,44 100,60 126,82" fill="#2563eb" fillOpacity="0.12" />
          <polygon points="100,60 74,82 126,82" fill="#3b82f6" fillOpacity="0.18" />

          {/* Vertex Node Pins */}
          <circle cx="100" cy="24" r="2.5" fill="#93c5fd" />
          <circle cx="68" cy="44" r="2.5" fill="#60a5fa" />
          <circle cx="132" cy="44" r="2.5" fill="#60a5fa" />
          <circle cx="100" cy="60" r="3.5" fill="#ffffff" className="drop-shadow-[0_0_6px_#38bdf8]" />
          <circle cx="74" cy="82" r="2.5" fill="#60a5fa" />
          <circle cx="126" cy="82" r="2.5" fill="#60a5fa" />
          <circle cx="100" cy="96" r="2.5" fill="#93c5fd" />

          {/* Coordinate Vector Tags */}
          <text x="138" y="42" fill="#60a5fa" fontSize="5" fontFamily="var(--font-mono)">RA: +32.4°</text>
          <text x="132" y="86" fill="#60a5fa" fontSize="5" fontFamily="var(--font-mono)">DEC: -14.2°</text>
        </svg>
      );
  }
}
