import { Search, X } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { IconButton } from '../../../components/ui/IconButton';

interface TargetSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Standardized client-side search input for astronomical target discovery.
 */
export function TargetSearch({
  value,
  onChange,
  placeholder = 'Search by target name, identifier (e.g. sdf-s), or celestial category...',
  className,
}: TargetSearchProps) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="Search astronomical targets"
      containerClassName={className}
      leftIcon={<Search className="h-4 w-4" />}
      rightElement={
        value ? (
          <IconButton
            size="sm"
            variant="ghost"
            onClick={() => onChange('')}
            aria-label="Clear search input"
          >
            <X className="h-4 w-4" />
          </IconButton>
        ) : undefined
      }
    />
  );
}
