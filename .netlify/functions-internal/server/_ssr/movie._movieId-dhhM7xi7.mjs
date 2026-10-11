import { i as __toESM } from "../_runtime.mjs";
import { n as tmdbApi, t as IMG_URL } from "./tmdb-RYPw0Ln_.mjs";
import { i as require_react, r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as Calendar, b as Clock, m as Play, o as Star } from "../_libs/lucide-react.mjs";
import { t as Nav } from "./Nav-DuuBqbyU.mjs";
import { t as Route } from "./movie._movieId-C-3Vpnfh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/movie._movieId-dhhM7xi7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MoviePage() {
	const { movieId } = Route.useParams();
	const id = Number(movieId);
	const { data: movie, isLoading } = useQuery({
		queryKey: ["movie", id],
		queryFn: () => tmdbApi.movieDetail(id)
	});
	(0, import_react.useEffect)(() => {
		if (movie?.title) document.title = `${movie.title} — ORBIT`;
		return () => {
			document.title = "ORBIT";
		};
	}, [movie?.title]);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingScreen, {});
	if (!movie) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorScreen, {});
	IMG_URL(movie.backdrop_path, "original");
	const poster = IMG_URL(movie.poster_path, "w342");
	const year = movie.release_date?.slice(0, 4) ?? "";
	const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "";
	const cast = movie.credits?.cast?.slice(0, 8) ?? [];
	const similar = movie.similar?.results?.filter((m) => m.poster_path).slice(0, 12) ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pt-[73px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-6 pt-6 md:px-16 lg:px-24",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-hidden rounded-xl bg-black",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								position: "relative",
								paddingBottom: "56.25%",
								height: 0
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
								src: `https://player.videasy.net/movie/${id}?color=6366f1&overlay=true`,
								style: {
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%"
								},
								frameBorder: "0",
								allowFullScreen: true,
								allow: "encrypted-media autoplay fullscreen"
							})
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-10 md:px-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-8",
						children: [poster && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: poster,
							alt: movie.title,
							className: "hidden h-[210px] w-[140px] flex-shrink-0 rounded-xl border border-border object-cover shadow-xl sm:block"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [
								movie.tagline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground",
									children: movie.tagline
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl",
									children: movie.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-wrap items-center gap-5 text-base text-muted-foreground",
									children: [
										year && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4" }), year]
										}),
										runtime && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4" }), runtime]
										}),
										movie.vote_average > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5 text-yellow-400",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-4 w-4 fill-current" }), movie.vote_average.toFixed(1)]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: movie.genres?.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted-foreground",
										children: g.name
									}, g.id))
								}),
								movie.overview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-5 text-base leading-relaxed text-muted-foreground",
									children: movie.overview
								})
							]
						})]
					}), cast.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-5 text-xs uppercase tracking-[0.25em] text-muted-foreground",
							children: "Cast"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8",
							children: cast.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mx-auto mb-2 h-16 w-16 overflow-hidden rounded-full border border-border bg-surface",
										children: member.profile_path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: IMG_URL(member.profile_path, "w185"),
											alt: member.name,
											className: "h-full w-full object-cover"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex h-full items-center justify-center text-lg text-muted-foreground",
											children: member.name[0]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium leading-tight",
										children: member.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-[11px] text-muted-foreground leading-tight line-clamp-1",
										children: member.character
									})
								]
							}, member.id))
						})]
					})]
				}),
				similar.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 py-12 md:px-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-6 font-display text-2xl font-semibold",
							children: "More Like This"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
							children: similar.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimilarCard, {
								item: m,
								type: "movie"
							}, m.id))
						})]
					})
				})
			]
		})]
	});
}
function SimilarCard({ item, type }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: type === "movie" ? "/movie/$movieId" : "/tv/$tvId",
		params: type === "movie" ? { movieId: String(item.id) } : { tvId: String(item.id) },
		className: "group block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-hidden rounded-md border border-border bg-surface aspect-[2/3]",
			children: item.poster_path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: IMG_URL(item.poster_path, "w300"),
				alt: item.title || item.name,
				className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
				loading: "lazy"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full items-center justify-center text-xs text-muted-foreground p-2 text-center",
				children: item.title || item.name
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs font-medium leading-tight truncate",
			children: item.title || item.name
		})]
	});
}
function LoadingScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-10 w-10 animate-pulse text-muted-foreground" })
	});
}
function ErrorScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Could not load movie."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-4 inline-block text-sm underline",
				children: "Go home"
			})]
		})
	});
}
//#endregion
export { MoviePage as component };
