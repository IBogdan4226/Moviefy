"use server";

import axios from "axios";
import {
  OMDbSearchResponse,
  OMDbMovieDetails,
  MovieData,
  FirstPageResult,
  BatchPagesResult,
  SearchFilters,
} from "./types";
import { createFilterChain, getUniqueMovies } from "./utils";
import { redisCache } from "./redisCache";
import { userStore } from "./redisUser";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = "https://www.omdbapi.com";

function getCacheKey(movieName: string, filters?: SearchFilters): string {
  const name = movieName.toLowerCase().trim();
  return filters?.year ? `${name}|year:${filters.year}` : name;
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
    const response = await axios.get<OMDbSearchResponse>(url);
    return {
      ...response.data,
      Search: getUniqueMovies(response.data.Search || []),
    };
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
    const cacheKey = getCacheKey(movieName, filters);
    const cached = await redisCache.get(cacheKey);
    if (cached) {
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
      await redisCache.set(cacheKey, {
        movies: validMovies,
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
    const cacheKey = getCacheKey(movieName, filters);
    const pageNumbers = Array.from({ length: endPage }, (_, i) => i + 1);
    const pagesDataPromises = pageNumbers.map((pageNum) =>
      fetchSearchPage(movieName, pageNum, filters?.year)
    );
    const pagesData = await Promise.all(pagesDataPromises);
    const uniqueMoviesPagesData = pagesData.map((pageData) => {
      if (!pageData) return pageData;
      return {
        ...pageData,
        Search: getUniqueMovies(pageData.Search || []),
      };
    });
    const allMovieIds: { imdbID: string }[] = [];
    uniqueMoviesPagesData.forEach((pageData) => {
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

    await redisCache.set(cacheKey, {
      movies: validMovies,
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

export async function toggleWatchlist(imdbID: string): Promise<{ success: boolean; isInWatchlist: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return { success: false, isInWatchlist: false, error: "Not authenticated" };
    }

    const user = await userStore.getUserById(session.user.id);
    
    if (!user) {
      return { success: false, isInWatchlist: false, error: "User not found" };
    }

    const watchlist = user.watchlist || [];
    const isInWatchlist = watchlist.includes(imdbID);

    if (isInWatchlist) {
      user.watchlist = watchlist.filter(id => id !== imdbID);
    } else {
      user.watchlist = [...watchlist, imdbID];
    }

    await userStore.updateUser(user);

    return { success: true, isInWatchlist: !isInWatchlist };
  } catch (error) {
    console.error("Error toggling watchlist:", error);
    return { success: false, isInWatchlist: false, error: "Failed to update watchlist" };
  }
}

export async function getWatchlistStatus(imdbID: string): Promise<{ isInWatchlist: boolean }> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return { isInWatchlist: false };
    }

    const user = await userStore.getUserById(session.user.id);
    
    if (!user) {
      return { isInWatchlist: false };
    }

    const watchlist = user.watchlist || [];
    return { isInWatchlist: watchlist.includes(imdbID) };
  } catch (error) {
    console.error("Error getting watchlist status:", error);
    return { isInWatchlist: false };
  }
}
