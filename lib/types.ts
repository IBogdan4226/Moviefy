export interface MovieData {
  imdbID: string;
  title: string;
  year: string;
  rated: string;
  runtime: string;
  plot: string;
  poster: string;
  rating: number;
  type: string;
  genre: string;
  director: string;
}

export interface MovieSearchResult {
  success: boolean;
  data?: MovieData[];
  error?: string;
  totalResults?: number;
}

export interface FirstPageResult {
  success: boolean;
  data?: MovieData[];
  error?: string;
  totalPages: number;
  totalResults: number;
}

export interface BatchPagesResult {
  success: boolean;
  data?: MovieData[];
  error?: string;
}

export type SortOption = 'none' | 'year-asc' | 'year-desc' | 'rating-asc' | 'rating-desc';

export interface SearchFilters {
  year?: string;
  genre?: string;
  scoreRange?: [number, number];
  sort?: SortOption;
}

export interface FilterState {
  year: string;
  genre: string;
  scoreRange: [number, number];
  sort: SortOption;
}


// OMDb API response types
export interface OMDbSearchMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OMDbSearchResponse {
  Search: OMDbSearchMovie[];
  totalResults: string;
  Response: string;
  Error?: string;
}

export interface OMDbMovieDetails {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: { Source: string; Value: string }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
  Error?: string;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  watchlist: string[];
  score: number;
}