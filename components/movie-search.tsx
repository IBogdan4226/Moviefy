"use client";

import { useState, useRef } from "react";
import { fetchFirstPage, fetchBatchPages } from "@/lib/actions";
import { MovieData, SearchFilters, FilterState } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SearchBar } from "@/components/search-bar";
import { MovieFilters } from "@/components/movie-filters";
import { MovieList } from "@/components/movie-list";
import { ITEMS_PER_PAGE } from "@/lib/utils";

const buildFilters = (filters: FilterState): SearchFilters => ({
  year: filters.year,
  genre: filters.genre !== "all" ? filters.genre : undefined,
  scoreRange:
    filters.scoreRange[0] !== 0 || filters.scoreRange[1] !== 10
      ? filters.scoreRange
      : undefined,
});

export function MovieSearch() {
  const [movieName, setMovieName] = useState("");
  const [displayedMovies, setDisplayedMovies] = useState<MovieData[]>([]);
  const [allFetchedMovies, setAllFetchedMovies] = useState<MovieData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const isFetchingBatch = useRef(false);

  const [filters, setFilters] = useState<FilterState>({
    year: "",
    genre: "all",
    scoreRange: [0, 10],
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDisplayedMovies([]);
    setAllFetchedMovies([]);
    setIsLoading(true);
    isFetchingBatch.current = false;

    try {
      const searchFilters = buildFilters(filters);
      const firstPageResult = await fetchFirstPage(movieName, searchFilters);

      if (firstPageResult.success && firstPageResult.data) {
        setDisplayedMovies(firstPageResult.data.slice(0, 10));
        setAllFetchedMovies(firstPageResult.data);
        setTotalResults(firstPageResult.totalResults);
        setTotalPages(firstPageResult.totalPages);

        if (
          firstPageResult.totalPages > 1 &&
          firstPageResult.totalResults > firstPageResult.data.length
        ) {
          fetchRemainingPagesInBackground(
            movieName,
            firstPageResult.totalPages,
            searchFilters
          );
        }
      } else {
        setError(firstPageResult.error || "An error occurred while searching");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRemainingPagesInBackground = async (
    searchTerm: string,
    totalPagesCount: number,
    filters: SearchFilters
  ) => {
    if (isFetchingBatch.current) return;
    isFetchingBatch.current = true;

    try {
      const endPage = Math.min(totalPagesCount, 20);
      const batchResult = await fetchBatchPages(searchTerm, endPage, filters);

      if (batchResult.success && batchResult.data) {
        setAllFetchedMovies(batchResult.data);
      }
    } catch (err) {
      console.error("Error fetching remaining pages:", err);
    }
  };

  const loadMoreMovies = () => {
    setTimeout(() => {
      setDisplayedMovies(
        allFetchedMovies.slice(0, displayedMovies.length + ITEMS_PER_PAGE)
      );
    }, 300);
  };

  const hasMore = displayedMovies.length < allFetchedMovies.length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="space-y-4">
        <SearchBar
          movieName={movieName}
          onMovieNameChange={setMovieName}
          onSearch={handleSearch}
          isLoading={isLoading}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {showFilters && (
          <MovieFilters
            filters={filters}
            setFilters={setFilters}
          />
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <MovieList
        displayedMovies={displayedMovies}
        hasMore={hasMore}
        onLoadMore={loadMoreMovies}
        totalMovies={allFetchedMovies.length}
        totalResults={totalResults}
        totalPages={totalPages}
      />
    </div>
  );
}
