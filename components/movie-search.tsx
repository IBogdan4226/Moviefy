'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchMovie } from '@/lib/actions';
import { MovieData } from '@/lib/types';
import { MovieCard } from '@/components/movie-card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function MovieSearch() {
  const [movieName, setMovieName] = useState('');
  const [searchedMovieName, setSearchedMovieName] = useState('');
  const [moviesData, setMoviesData] = useState<MovieData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState<number>(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMoviesData([]);
    setIsLoading(true);
    setSearchedMovieName(movieName);

    try {
      const result = await searchMovie(movieName);

      console.log(result);
      if (result.success && result.data) {
        setMoviesData(result.data);
        setTotalResults(result.totalResults || 0);
      } else {
        setError(result.error || 'An error occurred while searching');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter a movie name..."
          value={movieName}
          onChange={(e) => setMovieName(e.target.value)}
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
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {moviesData.length > 0 && (
        <div className="text-center text-muted-foreground">
          Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchedMovieName}" (showing {moviesData.length})
        </div>
      )}

      {moviesData.length > 0 && (
        <div className="flex flex-col gap-6">
          {moviesData.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
