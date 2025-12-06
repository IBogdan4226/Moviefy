'use client';

import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMoviesData([]);
    setIsLoading(true);
    setSearchedMovieName(movieName);
    setCurrentPage(1);

    try {
      const result = await searchMovie(movieName, 1);

      console.log(result);
      if (result.success && result.data) {
        setMoviesData(result.data);
        setTotalResults(result.totalResults || 0);
        setHasMore((result.totalResults || 0) > result.data.length);
      } else {
        setError(result.error || 'An error occurred while searching');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoreMovies = async () => {
    if (!searchedMovieName) return;

    const nextPage = currentPage + 1;

    try {
      const result = await searchMovie(searchedMovieName, nextPage);

      if (result.success && result.data) {
        setMoviesData(prev => [...prev, ...result.data!]);
        setCurrentPage(nextPage);
        setHasMore((result.totalResults || 0) > moviesData.length + result.data.length);
      }
    } catch (err) {
      console.error('Error loading more movies:', err);
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
        <InfiniteScroll
          dataLength={moviesData.length}
          next={fetchMoreMovies}
          hasMore={hasMore}
          loader={
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading more movies...</span>
              </div>
            </div>
          }
          endMessage={
            <p className="text-center py-8 text-muted-foreground">
              No more results to load
            </p>
          }
        >
          <div className="flex flex-col gap-6">
            {moviesData.map((movie) => (
              <MovieCard key={movie.imdbID} movie={movie} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}
