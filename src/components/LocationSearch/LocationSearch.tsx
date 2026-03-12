import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, Hospital, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Coordinates } from '@/types/ambulance';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchProps {
  onSourceSelect: (coords: Coordinates, name: string) => void;
  onDestinationSelect: (coords: Coordinates, name: string) => void;
  sourceName?: string;
  destinationName?: string;
  disabled?: boolean;
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

async function geocode(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en' },
  });
  if (!res.ok) return [];
  return res.json();
}

function SearchInput({
  label,
  icon: Icon,
  placeholder,
  value,
  onSelect,
  disabled,
}: {
  label: string;
  icon: typeof MapPin;
  placeholder: string;
  value?: string;
  onSelect: (coords: Coordinates, name: string) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    geocode(debouncedQuery).then((r) => {
      setResults(r);
      setIsOpen(r.length > 0);
      setIsLoading(false);
    });
  }, [debouncedQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (r: SearchResult) => {
    const name = r.display_name.split(',').slice(0, 2).join(',');
    onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon) }, name);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3 h-3" />
        {label}
      </label>
      {value && !query ? (
        <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground">
          <span className="truncate flex-1">{value}</span>
          {!disabled && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0"
              onClick={handleClear}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 pr-8 h-9 text-sm"
            disabled={disabled}
          />
          {isLoading && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground animate-spin" />
          )}
        </div>
      )}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-48 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent/50 transition-colors border-b border-border last:border-0"
            >
              <span className="line-clamp-2">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function LocationSearch({
  onSourceSelect,
  onDestinationSelect,
  sourceName,
  destinationName,
  disabled,
}: LocationSearchProps) {
  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <h3 className="font-display text-sm font-bold text-foreground">📍 Route Setup</h3>
      <SearchInput
        label="Pickup Location"
        icon={MapPin}
        placeholder="Search pickup address..."
        value={sourceName}
        onSelect={onSourceSelect}
        disabled={disabled}
      />
      <SearchInput
        label="Hospital / Destination"
        icon={Hospital}
        placeholder="Search hospital or destination..."
        value={destinationName}
        onSelect={onDestinationSelect}
        disabled={disabled}
      />
    </div>
  );
}
