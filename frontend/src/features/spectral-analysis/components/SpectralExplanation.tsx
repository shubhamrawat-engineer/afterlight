import { BookOpen } from 'lucide-react';

interface SpectralExplanationProps {
  className?: string;
}

export function SpectralExplanation({ className }: SpectralExplanationProps) {
  return (
    <div className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            UNDERSTANDING THE SPECTRUM: SCIENTIFIC GUIDE
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Astrophysical Principles</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs leading-relaxed text-slate-300">
        {/* 1. Infrared Wavelengths */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
          <h4 className="font-bold text-sky-400 uppercase text-[11px]">
            1. Why Infrared Wavelengths?
          </h4>
          <p>
            Near- and mid-infrared light (0.75 to 5.0 μm) penetrates obscuring cosmic dust clouds that block visible starlight. It reveals cold stellar envelopes, circumstellar ice absorption bands (such as H₂O ice at 3.05 μm and CO₂ ice at 4.27 μm), and redshifted light from early cosmic epochs.
          </p>
        </div>

        {/* 2. Spectral Energy Distribution (SED) */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
          <h4 className="font-bold text-indigo-400 uppercase text-[11px]">
            2. Spectral Energy Distribution (SED)
          </h4>
          <p>
            A plot of signal intensity against wavelength shows how astronomical energy is distributed across the electromagnetic spectrum. Smooth power-law slopes represent thermal continuum emission from stars and dust, while localized dips and peaks correspond to molecular absorption bands and atomic transitions.
          </p>
        </div>

        {/* 3. Signal Intensity & Calibration */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
          <h4 className="font-bold text-emerald-400 uppercase text-[11px]">
            3. Flux Density &amp; Surface Brightness
          </h4>
          <p>
            Point sources are calibrated in microjanskys (μJy), representing spectral flux density (1 Jy = 10⁻²⁶ W·m⁻²·Hz⁻¹), whereas extended structures (nebulae, dust echoes) are reported in megajanskys per steradian (MJy/sr).
          </p>
        </div>

        {/* 4. Multi-Epoch Caveats */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
          <h4 className="font-bold text-amber-400 uppercase text-[11px]">
            4. Scientific Caution on Variability
          </h4>
          <p>
            Variations between observation epochs can reflect true astronomical changes (supernova evolution, eruptive light echoes, or asteroid rotation) or instrumental effects (dither sampling differences or chromatic PSF variations). A spectral difference is a candidate requiring multi-epoch validation, not an automatic discovery.
          </p>
        </div>
      </div>
    </div>
  );
}
