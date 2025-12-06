"use client";

import { useState, useEffect } from "react";
import { MovieCard } from "@/components/movie-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getWatchlistMovies } from "@/lib/actions";
import { MovieData } from "@/lib/types";

export function WatchlistContent() {
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWatchlist = async () => {
    setIsLoading(true);
    const result = await getWatchlistMovies();
    
    if (result.success && result.data) {
      setMovies(result.data);
      setError(null);
    } else {
      setError(result.error || "Failed to load watchlist");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleRemoveFromWatchlist = (isInWatchlist: boolean, imdbID: string) => {
    if (!isInWatchlist) {
      setMovies((prevMovies) => prevMovies.filter((movie) => movie.imdbID !== imdbID));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">Loading watchlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (movies.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your watchlist is empty. Start adding movies by clicking the bookmark
          icon on any movie card!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {movies.map((movie) => (
        <MovieCard key={movie.imdbID} movie={movie} onToggle={handleRemoveFromWatchlist} />
      ))}
    </div>
  );
}
