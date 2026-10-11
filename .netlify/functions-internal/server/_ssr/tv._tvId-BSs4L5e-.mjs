import { i as __toESM } from "../_runtime.mjs";
import { n as tmdbApi, t as IMG_URL } from "./tmdb-RYPw0Ln_.mjs";
import { i as require_react, r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as ChevronDown, T as Calendar, b as Clock, o as Star, r as Tv } from "../_libs/lucide-react.mjs";
import { t as Nav } from "./Nav-DuuBqbyU.mjs";
import { t as Route } from "./tv._tvId-rh7iN2bg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tv._tvId-BSs4L5e-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TVPage() {
	const { tvId } = Route.useParams();
	const id = Number(tvId);
	const { data: show, isLoading } = useQuery({
		queryKey: ["tv", id],
		queryFn: () => tmdbApi.tvDetail(id)
	});
	const seasons = show?.seasons?.filter((s) => s.season_number > 0) ?? [];
	const [selectedSeason, setSelectedSeason] = (0, import_react.useState)(1);
	const [selectedEpisode, setSelectedEpisode] = (0, import_react.useState)(1);
	(0, import_react.useEffect)(() => {
		setSelectedEpisode(1);
	}, [selectedSeason]);
	(0, import_react.useEffect)(() => {
		if (show?.name) document.title = `${show.name} — ORBIT`;
		return () => {
			document.title = "ORBIT";
		};
	}, [show?.name]);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingScreen, {});
	if (!show) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorScreen, {});
	IMG_URL(show.backdrop_path, "original");
	const poster = IMG_URL(show.poster_path, "w342");
	const year = show.first_air_date?.slice(0, 4) ?? "";
	const runtime = show.episode_run_time?.[0] ? `~${show.episode_run_time[0]}m / ep` : "";
	const cast = show.credits?.cast?.slice(0, 8) ?? [];
	const similar = show.similar?.results?.filter((m) => m.poster_path).slice(0, 12) ?? [];
	const episodeCount = seasons.find((s) => s.season_number === selectedSeason)?.episode_count ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pt-[73px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-6 pt-6 md:px-16 lg:px-24",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-hidden rounded-xl bg-black",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									position: "relative",
									paddingBottom: "56.25%",
									height: 0
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
									src: `https://player.videasy.net/tv/${id}/${selectedSeason}/${selectedEpisode}?color=6366f1&nextEpisode=true&autoplayNextEpisode=true&overlay=true`,
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
								}, `${id}-${selectedSeason}-${selectedEpisode}`)
							})
						}) }), seasons.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col rounded-xl border border-border bg-surface/40 overflow-hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 border-b border-border px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: selectedSeason,
										onChange: (e) => setSelectedSeason(Number(e.target.value)),
										className: "w-full appearance-none rounded-md border border-border bg-background px-3 py-2 pr-7 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ice cursor-pointer",
										children: seasons.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: s.season_number,
											children: s.name
										}, s.id))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex-shrink-0 text-xs text-muted-foreground",
									children: [episodeCount, " eps"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-y-auto",
								style: { maxHeight: "320px" },
								children: Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setSelectedEpisode(ep),
									className: `w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50 last:border-0 ${selectedEpisode === ep ? "bg-ice/10 text-ice" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${selectedEpisode === ep ? "bg-ice text-background" : "bg-border/60"}`,
										children: ep
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm",
										children: ["Episode ", ep]
									})]
								}, ep))
							})]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-8 md:px-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-6",
						children: [poster && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: poster,
							alt: show.name,
							className: "hidden h-[160px] w-[107px] flex-shrink-0 rounded-lg border border-border object-cover shadow-lg sm:block"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [
								show.tagline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground",
									children: show.tagline
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl",
									children: show.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground",
									children: [
										year && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }), year]
										}),
										runtime && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }), runtime]
										}),
										show.number_of_seasons > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "h-3.5 w-3.5" }),
												show.number_of_seasons,
												" Season",
												show.number_of_seasons > 1 ? "s" : ""
											]
										}),
										show.vote_average > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5 text-yellow-400",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3.5 w-3.5 fill-current" }), show.vote_average.toFixed(1)]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 flex flex-wrap gap-2",
									children: show.genres?.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground",
										children: g.name
									}, g.id))
								}),
								show.overview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-sm leading-relaxed text-muted-foreground",
									children: show.overview
								})
							]
						})]
					}), cast.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground",
							children: "Cast"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8",
							children: cast.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mx-auto mb-2 h-14 w-14 overflow-hidden rounded-full border border-border bg-surface",
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
										className: "text-[11px] font-medium leading-tight",
										children: member.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-[10px] text-muted-foreground leading-tight line-clamp-1",
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
								type: "tv"
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
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "h-10 w-10 animate-pulse text-muted-foreground" })
	});
}
function ErrorScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Could not load show."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-4 inline-block text-sm underline",
				children: "Go home"
			})]
		})
	});
}
//#endregion
export { TVPage as component };
