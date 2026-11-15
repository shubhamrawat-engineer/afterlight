import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { HomeFeatureItem } from '../home.types';
import { FeatureVisual } from './FeatureVisuals';
import { cn } from '../../../lib/utils';

interface FeatureCardProps {
  feature: HomeFeatureItem;
  className?: string;
}

/**
 * Standardized observatory feature card for the AFTERLIGHT homepage.
 * Uses consistent surface tokens, 18px semibold headings, 13.5px secondary body text,
 * and restrained hover elevation.
 */
export function FeatureCard({ feature, className }: FeatureCardProps) {
  return (
    <Link
      to={feature.href}
      aria-label={feature.ariaLabel}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-xl border p-6 transition-all duration-200',
        'bg-[#101A2B] border-[#24344D] hover:border-[#4388FF]/50 hover:bg-[#131F33]',
        'hover:-translate-y-0.5 shadow-[0_4px_18px_rgba(3,6,14,0.38)] hover:shadow-[0_12px_30px_rgba(3,6,14,0.58)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45D5F2]',
        className,
      )}
    >
      <div>
        {/* Visual Header Illustration */}
        <div className="relative mb-5 flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-[#1A2940] bg-[#080E1C] p-3">
          <FeatureVisual type={feature.visualType} />
        </div>

        {/* Card Heading & Description */}
        <h3 className="font-[family-name:var(--font-display)] text-[18px] font-semibold tracking-[-0.01em] text-[#F4F7FF] transition-colors duration-200 group-hover:text-[#45D5F2]">
          {feature.title}
        </h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[#B5C2D6]">
          {feature.description}
        </p>
      </div>

      {/* Bottom Action Row */}
      <div className="mt-6 flex items-center justify-between border-t border-[#1A2940] pt-4">
        <span className="text-xs font-medium text-[#8293AD] transition-colors group-hover:text-[#F4F7FF]">
          Open workstation
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#24344D] bg-[#131F33] text-[#B5C2D6] transition-all duration-200 group-hover:border-[#4388FF]/60 group-hover:bg-[#4388FF] group-hover:text-[#F4F7FF]">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
