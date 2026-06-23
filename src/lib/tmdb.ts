const API_KEY = 'dddf373a16513b75dbbed7847f542f95';
const BASE = 'https://api.themoviedb.org/3';

export const IMG_URL = (path: string | null | undefined, size = 'w500'): string =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : '';

async function tmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'en-US');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json() as Promise<T>;
}

export interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  media_type?: 'movie' | 'tv' | 'person';
  genre_ids?: number[];
}

export interface TMDBList {
  results: TMDBItem[];
  page: number;
  total_pages: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface MovieDetail extends TMDBItem {
  genres: Genre[];
  runtime: number;
  tagline: string;
  status: string;
  credits: { cast: CastMember[] };
  similar: TMDBList;
  videos: { results: { key: string; type: string; site: string }[] };
}

export interface TVDetail extends TMDBItem {
  genres: Genre[];
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  tagline: string;
  status: string;
  seasons: {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    poster_path: string | null;
  }[];
  credits: { cast: CastMember[] };
  similar: TMDBList;
}

export const tmdbApi = {
  trending: () => tmdb<TMDBList>('/trending/all/week'),
  popularMovies: () => tmdb<TMDBList>('/movie/popular'),
  popularTV: () => tmdb<TMDBList>('/tv/popular'),
  topRatedMovies: () => tmdb<TMDBList>('/movie/top_rated'),
  actionMovies: () =>
    tmdb<TMDBList>('/discover/movie', { with_genres: '28', sort_by: 'popularity.desc' }),
  scifiMovies: () =>
    tmdb<TMDBList>('/discover/movie', { with_genres: '878', sort_by: 'popularity.desc' }),
  animeTV: () =>
    tmdb<TMDBList>('/discover/tv', {
      with_genres: '16',
      sort_by: 'popularity.desc',
      with_origin_country: 'JP',
    }),
  movieDetail: (id: number) =>
    tmdb<MovieDetail>(`/movie/${id}`, { append_to_response: 'credits,similar,videos' }),
  tvDetail: (id: number) =>
    tmdb<TVDetail>(`/tv/${id}`, { append_to_response: 'credits,similar,videos' }),
  search: (query: string) => tmdb<TMDBList>('/search/multi', { query }),
};
