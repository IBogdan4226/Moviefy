"use client"

import { Search, Loader2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  movieName: string;
  onMovieNameChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  isLoading: boolean;
  onToggleFilters: () => void;
}

export function SearchBar({ 
  movieName, 
  onMovieNameChange, 
  onSearch, 
  isLoading,
  onToggleFilters 
}: SearchBarProps) {
  return (
    <form onSubmit={onSearch} className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter a movie name..."
          value={movieName}
          onChange={(e) => onMovieNameChange(e.target.value)}
          disabled={isLoading}
          className="text-lg h-12"
        />
        <Button type="submit" disabled={isLoading} size="lg" className="px-8">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onToggleFilters}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>
    </form>
  );
}
