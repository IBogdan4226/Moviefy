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
}

export interface MovieSearchResult {
  success: boolean;
  data?: MovieData[];
  error?: string;
  totalResults?: number;
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
