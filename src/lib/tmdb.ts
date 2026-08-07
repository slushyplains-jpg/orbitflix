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

export const MOVIE_GENRES = [
  { id: 0,   name: 'All' },
  { id: 28,  name: 'Action' },
  { id: 12,  name: 'Adventure' },
  { id: 16,  name: 'Animation' },
  { id: 35,  name: 'Comedy' },
  { id: 80,  name: 'Crime' },
  { id: 99,  name: 'Documentary' },
  { id: 18,  name: 'Drama' },
  { id: 14,  name: 'Fantasy' },
  { id: 27,  name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53,  name: 'Thriller' },
  { id: 10752, name: 'War' },
];

export const TV_GENRES = [
  { id: 0,   name: 'All' },
  { id: 10759, name: 'Action' },
  { id: 16,  name: 'Animation' },
  { id: 35,  name: 'Comedy' },
  { id: 80,  name: 'Crime' },
  { id: 99,  name: 'Documentary' },
  { id: 18,  name: 'Drama' },
  { id: 10765, name: 'Sci-Fi' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War' },
  { id: 37,  name: 'Western' },
];

export const ANIME_GENRES = [
  { id: 0,   name: 'All' },
  { id: 28,  name: 'Action' },
  { id: 12,  name: 'Adventure' },
  { id: 35,  name: 'Comedy' },
  { id: 18,  name: 'Drama' },
  { id: 14,  name: 'Fantasy' },
  { id: 27,  name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
];

export const SORT_OPTIONS = [
  { value: 'popularity.desc',     label: 'Most Popular' },
  { value: 'vote_average.desc',   label: 'Top Rated' },
  { value: 'release_date.desc',   label: 'Newest' },
  { value: 'revenue.desc',        label: 'Box Office' },
];

export const TV_SORT_OPTIONS = [
  { value: 'popularity.desc',     label: 'Most Popular' },
  { value: 'vote_average.desc',   label: 'Top Rated' },
  { value: 'first_air_date.desc', label: 'Newest' },
];

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
  discoverMovies: (page: number, genre: number, sort: string) =>
    tmdb<TMDBList>('/discover/movie', {
      sort_by: sort,
      page: String(page),
      'vote_count.gte': '100',
      ...(genre ? { with_genres: String(genre) } : {}),
    }),
  discoverTV: (page: number, genre: number, sort: string) =>
    tmdb<TMDBList>('/discover/tv', {
      sort_by: sort,
      page: String(page),
      'vote_count.gte': '50',
      ...(genre ? { with_genres: String(genre) } : {}),
    }),
  discoverAnime: (page: number, genre: number, sort: string) =>
    tmdb<TMDBList>('/discover/tv', {
      with_genres: genre ? `16,${genre}` : '16',
      sort_by: sort,
      page: String(page),
      with_origin_country: 'JP',
      'vote_count.gte': '50',
    }),
  movieDetail: (id: number) =>
    tmdb<MovieDetail>(`/movie/${id}`, { append_to_response: 'credits,similar,videos' }),
  tvDetail: (id: number) =>
    tmdb<TVDetail>(`/tv/${id}`, { append_to_response: 'credits,similar,videos' }),
  topImdb: (page: number) =>
    tmdb<TMDBList>('/discover/movie', {
      sort_by: 'vote_average.desc',
      page: String(page),
      'vote_count.gte': '5000',
    }),
  movieReviews: (id: number) =>
    tmdb<{ results: TMDBReview[] }>(`/movie/${id}/reviews`, { page: '1' }),
  search: (query: string) => tmdb<TMDBList>('/search/multi', { query }),
};

export interface TMDBReview {
  id: string;
  author: string;
  author_details: { avatar_path: string | null; rating: number | null };
  content: string;
  created_at: string;
  url: string;
}
