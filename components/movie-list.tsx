"use client"

import InfiniteScroll from 'react-infinite-scroll-component';
import { Loader2 } from 'lucide-react';
import { MovieData } from '@/lib/types';
import { MovieCard } from '@/components/movie-card';

interface MovieListProps {
  displayedMovies: MovieData[];
  hasMore: boolean;
  onLoadMore: () => void;
  totalMovies: number;
  totalResults: number;
  totalPages: number;
}

export function MovieList({
  displayedMovies,
  hasMore,
  onLoadMore,
  totalMovies,
  totalResults,
  totalPages
}: MovieListProps) {
  if (displayedMovies.length === 0) {
    return null;
  }

  return (
    <InfiniteScroll
      dataLength={displayedMovies.length}
      next={onLoadMore}
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
          {totalMovies < totalResults
            ? `Showing ${displayedMovies.length} movies (limited to ${totalPages} pages)`
            : `All ${displayedMovies.length} results loaded`}
        </p>
      }
    >
      <div className="flex flex-col gap-6">
        {displayedMovies.map((movie) => (
          <MovieCard key={movie.imdbID} movie={movie} />
        ))}
      </div>
    </InfiniteScroll>
  );
}
