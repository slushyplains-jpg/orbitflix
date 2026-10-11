//#region node_modules/.nitro/vite/services/ssr/assets/tmdb-RYPw0Ln_.js
var API_KEY = "dddf373a16513b75dbbed7847f542f95";
var BASE = "https://api.themoviedb.org/3";
var IMG_URL = (path, size = "w500") => path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
async function tmdb(path, params = {}) {
	const url = new URL(`${BASE}${path}`);
	url.searchParams.set("api_key", API_KEY);
	url.searchParams.set("language", "en-US");
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error(`TMDB ${res.status}`);
	return res.json();
}
var tmdbApi = {
	trending: () => tmdb("/trending/all/week"),
	popularMovies: () => tmdb("/movie/popular"),
	popularTV: () => tmdb("/tv/popular"),
	topRatedMovies: () => tmdb("/movie/top_rated"),
	actionMovies: () => tmdb("/discover/movie", {
		with_genres: "28",
		sort_by: "popularity.desc"
	}),
	scifiMovies: () => tmdb("/discover/movie", {
		with_genres: "878",
		sort_by: "popularity.desc"
	}),
	animeTV: () => tmdb("/discover/tv", {
		with_genres: "16",
		sort_by: "popularity.desc",
		with_origin_country: "JP"
	}),
	movieDetail: (id) => tmdb(`/movie/${id}`, { append_to_response: "credits,similar,videos" }),
	tvDetail: (id) => tmdb(`/tv/${id}`, { append_to_response: "credits,similar,videos" }),
	search: (query) => tmdb("/search/multi", { query })
};
//#endregion
export { tmdbApi as n, IMG_URL as t };
