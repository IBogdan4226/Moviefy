'use server';

import axios from 'axios';
import { MovieSearchResult, OMDbSearchResponse, OMDbMovieDetails, MovieData } from './types';

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = 'https://www.omdbapi.com';

export async function searchMovie(movieName: string, page: number = 1): Promise<MovieSearchResult> {
  if (!movieName || movieName.trim().length === 0) {
    return {
      success: false,
      error: 'Please enter a movie name',
    };
  }

  if (!OMDB_API_KEY) {
    return {
      success: false,
      error: 'API key is not configured. Please check your environment variables.',
    };
  }

  try {
    const searchResponse = await axios.get<OMDbSearchResponse>(
      `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(movieName)}&page=${page}&plot=full`
    );

    const searchData = searchResponse.data;

    if (searchData.Response === 'False') {
      return {
        success: false,
        error: searchData.Error || `No results found for "${movieName}". Please try a different movie name.`,
      };
    }

    if (!searchData.Search || searchData.Search.length === 0) {
      return {
        success: false,
        error: `No results found for "${movieName}". Please try a different movie name.`,
      };
    }

    const detailsPromises = searchData.Search.slice(0, 10).map(async (movie) => {
      try {
        const detailsResponse = await axios.get<OMDbMovieDetails>(
          `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&i=${movie.imdbID}&plot=full`
        );

        const details = detailsResponse.data;

        if (details.Response === 'False') {
          return null;
        }

        const rating = parseFloat(details.imdbRating);

        return {
          imdbID: details.imdbID,
          title: details.Title,
          year: details.Year,
          rated: details.Rated !== 'N/A' ? details.Rated : 'Not Rated',
          runtime: details.Runtime,
          plot: details.Plot !== 'N/A' ? details.Plot : 'No description available.',
          poster: details.Poster !== 'N/A' ? details.Poster : '/placeholder-movie.png',
          rating: !isNaN(rating) ? rating : 0,
          type: details.Type,
          genre: details.Genre !== 'N/A' ? details.Genre : 'Unknown',
          director: details.Director !== 'N/A' ? details.Director : 'Unknown',
        } as MovieData;
      } catch (error) {
        console.error(`Failed to fetch details for ${movie.imdbID}:`, error);
        return null;
      }
    });

    const moviesData = await Promise.all(detailsPromises);
    const validMovies = moviesData.filter((movie): movie is MovieData => movie !== null);

    if (validMovies.length === 0) {
      return {
        success: false,
        error: 'Unable to fetch movie details. Please try again.',
      };
    }

    return {
      success: true,
      data: validMovies,
      totalResults: parseInt(searchData.totalResults),
    };
  } catch (error) {
    console.error('Movie search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
    };
  }
}
