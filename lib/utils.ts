import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SearchFilters, MovieData, SortOption } from "./types";

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

export function createSortFilter(sort?: SortOption): FilterFunction {
  if (!sort || sort === 'none') return (movies) => movies;
  
  return (movies: MovieData[]) => {
    const sorted = [...movies];
    
    switch (sort) {
      case 'year-asc':
        return sorted.sort((a, b) => {
          const yearA = parseInt(a.year) || 0;
          const yearB = parseInt(b.year) || 0;
          return yearA - yearB;
        });
      case 'year-desc':
        return sorted.sort((a, b) => {
          const yearA = parseInt(a.year) || 0;
          const yearB = parseInt(b.year) || 0;
          return yearB - yearA;
        });
      case 'rating-asc':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'rating-desc':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
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
    createScoreFilter(filters.scoreRange),
    createSortFilter(filters.sort)
  );
}

export function getUniqueMovies<T extends {Title:string}>(movies: T[]) {
  const seen = new Map<string, T>();
  
  movies.forEach((movie) => {
    const key = movie.Title.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, movie);
    }
  });
  
  return Array.from(seen.values());
}

export function calculateMoviePoints(movie: MovieData): number {
  let points = 0;
  const year = parseInt(movie.year);
  if (!isNaN(year) && year > 2024) {
    points += 100;
  }
  if (!isNaN(movie.rating) && movie.rating >= 9) {
    points += 200;
  }
  return Math.max(points, 50);
}
