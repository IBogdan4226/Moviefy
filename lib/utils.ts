import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SearchFilters, MovieData } from "./types";

export const ITEMS_PER_PAGE = 10;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FilterFunction = (movies: MovieData[]) => MovieData[];

export function createGenreFilter(genre?: string): FilterFunction {
  if (!genre || genre === "all") return (movies) => movies;
  return (movies: MovieData[]) => {
    return movies.filter((movie) =>
      movie.genre && movie.genre.split(",").some((g) => g.trim() === genre)
    );
  };
}

export function createScoreFilter(scoreRange?: [number, number]): FilterFunction {
  if (!scoreRange || (scoreRange[0] === 0 && scoreRange[1] === 10)) {
    return (movies) => movies;
  }
  const [minScore, maxScore] = scoreRange;
  return (movies: MovieData[]) => {
    return movies.filter(
      (movie) => !isNaN(movie.rating) && movie.rating >= minScore && movie.rating <= maxScore
    );
  };
}

export function chainFilters(...filters: FilterFunction[]): FilterFunction {
  return (movies: MovieData[]) => {
    return filters.reduce((filteredMovies, filter) => filter(filteredMovies), movies);
  };
}

export function createFilterChain(filters?: SearchFilters): FilterFunction {
  if (!filters) return (movies) => movies;
  return chainFilters(
    createGenreFilter(filters.genre),
    createScoreFilter(filters.scoreRange)
  );
}