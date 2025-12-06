"use client"

import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { FilterState } from '@/lib/types';

interface MovieFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const availableGenres=[
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Musical",
    "Romance",
    "Sci-Fi",
    "Short",
    "Thriller",
    "War"
]

export function MovieFilters({
  filters,
  setFilters
}: MovieFiltersProps) {
  const handleClearFilters = () => {
    setFilters({
      year: "",
      genre: "all",
      scoreRange: [0, 10],
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
      <div className="space-y-2">
        <label className="text-sm font-medium">Release Year</label>
        <Input
          type="number"
          placeholder="e.g. 2020"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          min="1900"
          max={new Date().getFullYear()}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Genre</label>
        <Select value={filters.genre} onValueChange={(genre) => setFilters({ ...filters, genre })}>
          <SelectTrigger>
            <SelectValue placeholder="All genres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {availableGenres.map((genre: string) => (
              <SelectItem key={genre} value={genre}>{genre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Score Range: {filters.scoreRange[0].toFixed(1)} - {filters.scoreRange[1].toFixed(1)}
        </label>
        <Slider
          value={filters.scoreRange}
          onValueChange={(scoreRange) => setFilters({ ...filters, scoreRange: scoreRange as [number, number] })}
          min={0}
          max={10}
          step={0.1}
          className="mt-2"
        />
      </div>

      <div className="md:col-span-3 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
        >
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
