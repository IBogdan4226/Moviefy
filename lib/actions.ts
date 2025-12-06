"use server";

import axios from "axios";
import {
  MovieSearchResult,
  OMDbSearchResponse,
  OMDbMovieDetails,
  MovieData,
  FirstPageResult,
  BatchPagesResult,
  SearchFilters,
} from "./types";
import { createFilterChain } from "./utils";

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = "https://www.omdbapi.com";

interface CacheEntry {
  movies: MovieData[];
  timestamp: number;
  totalResults: number;
}

const searchCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 1000 * 60 * 30;

function getCacheKey(movieName: string, year?: string): string {
  return `${movieName.toLowerCase().trim()}${year ? `_${year}` : ""}`;
}

async function fetchMovieDetails(imdbID: string): Promise<MovieData | null> {
  try {
    const detailsResponse = await axios.get<OMDbMovieDetails>(
      `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&i=${imdbID}&plot=full`
    );
    const details = detailsResponse.data;
    if (details.Response === "False") {
      return null;
    }
    const rating = parseFloat(details.imdbRating);
    return {
      imdbID: details.imdbID,
      title: details.Title,
      year: details.Year,
      rated: details.Rated !== "N/A" ? details.Rated : "Not Rated",
      runtime: details.Runtime,
      plot: details.Plot !== "N/A" ? details.Plot : "No description available.",
      poster:
        details.Poster !== "N/A" ? details.Poster : "/placeholder-movie.png",
      rating: !isNaN(rating) ? rating : 0,
      type: details.Type,
      genre: details.Genre !== "N/A" ? details.Genre : "Unknown",
      director: details.Director !== "N/A" ? details.Director : "Unknown",
    } as MovieData;
  } catch (error) {
    console.error(`Failed to fetch details for ${imdbID}:`, error);
    return null;
  }
}

async function fetchSearchPage(
  movieName: string,
  page: number,
  year?: string
): Promise<OMDbSearchResponse | null> {
  try {
    const url = `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(
      movieName
    )}&page=${page}${year ? `&y=${year}` : ""}`;
    console.log("da",url)
    const response = await axios.get<OMDbSearchResponse>(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch page ${page}:`, error);
    return null;
  }
}

export async function fetchFirstPage(
  movieName: string,
  filters?: SearchFilters
): Promise<FirstPageResult> {
  if (!movieName || movieName.trim().length === 0) {
    return {
      success: false,
      error: "Please enter a movie name",
      totalPages: 0,
      totalResults: 0,
    };
  }
  if (!OMDB_API_KEY) {
    return {
      success: false,
      error:
        "API key is not configured. Please check your environment variables.",
      totalPages: 0,
      totalResults: 0,
    };
  }
  try {
    const cacheKey = getCacheKey(movieName, filters?.year);
    const cached = searchCache.get(cacheKey);
    console.log("cache",cached)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const filterChain = createFilterChain(filters);
      const filteredMovies = filterChain(cached.movies);
      const totalPages = Math.min(Math.ceil(filteredMovies.length / 10), 20);
      return {
        success: true,
        data: filteredMovies,
        totalPages,
        totalResults: filteredMovies.length,
      };
    }
    const firstPageData = await fetchSearchPage(movieName, 1, filters?.year);
    if (!firstPageData || firstPageData.Response === "False") {
      return {
        success: false,
        error: `No results found for "${movieName}". Please try a different movie name.`,
        totalPages: 0,
        totalResults: 0,
      };
    }
    const totalResults = parseInt(firstPageData.totalResults);
    const totalPages = Math.min(Math.ceil(totalResults / 10), 5);
    const detailsPromises = firstPageData.Search.map((movie) =>
      fetchMovieDetails(movie.imdbID)
    );
    const moviesData = await Promise.all(detailsPromises);
    const validMovies = moviesData.filter(
      (movie): movie is MovieData => movie !== null
    );
    if (totalPages === 1) {
      searchCache.set(cacheKey, {
        movies: validMovies,
        timestamp: Date.now(),
        totalResults: totalResults,
      });
    }
    const filterChain = createFilterChain(filters);
    const filteredMovies = filterChain(validMovies);
    if (filteredMovies.length === 0) {
      return {
        success: false,
        error: "No movies match the selected filters on the first page.",
        totalPages: 0,
        totalResults: 0,
      };
    }
    return {
      success: true,
      data: filteredMovies,
      totalPages,
      totalResults: totalResults,
    };
  } catch (error) {
    console.error("Error fetching first page:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      totalPages: 0,
      totalResults: 0,
    };
  }
}

export async function fetchBatchPages(
  movieName: string,
  endPage: number,
  filters?: SearchFilters
): Promise<BatchPagesResult> {
  if (!movieName || movieName.trim().length === 0) {
    return {
      success: false,
      error: "Please enter a movie name",
    };
  }
  if (!OMDB_API_KEY) {
    return {
      success: false,
      error: "API key is not configured.",
    };
  }

  try {
    const cacheKey = getCacheKey(movieName, filters?.year);
    const pageNumbers = Array.from({ length: endPage }, (_, i) => i + 1);
    const pagesDataPromises = pageNumbers.map((pageNum) =>
      fetchSearchPage(movieName, pageNum, filters?.year)
    );
    const pagesData = await Promise.all(pagesDataPromises);
    const allMovieIds: { imdbID: string }[] = [];
    pagesData.forEach((pageData) => {
      if (pageData && pageData.Response === "True" && pageData.Search) {
        allMovieIds.push(...pageData.Search);
      }
    });
    if (allMovieIds.length === 0) {
      return {
        success: true,
        data: [],
      };
    }
    const detailsPromises = allMovieIds.map((movie) =>
      fetchMovieDetails(movie.imdbID)
    );
    const moviesData = await Promise.all(detailsPromises);
    const validMovies = moviesData.filter(
      (movie): movie is MovieData => movie !== null
    );

    searchCache.set(cacheKey, {
      movies: validMovies,
      timestamp: Date.now(),
      totalResults: parseInt(pagesData[0]?.totalResults || "0"),
    });

    const filterChain = createFilterChain(filters);
    const filteredMovies = filterChain(validMovies);
    return {
      success: true,
      data: filteredMovies,
    };
  } catch (error) {
    console.error("Error fetching batch pages:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    };
  }
}
