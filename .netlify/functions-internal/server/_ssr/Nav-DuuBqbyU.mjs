import { i as __toESM } from "../_runtime.mjs";
import { n as tmdbApi, t as IMG_URL } from "./tmdb-RYPw0Ln_.mjs";
import { i as require_react, r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as Bell, d as Search, g as Menu, t as X } from "../_libs/lucide-react.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Nav-DuuBqbyU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var supabase = createClient("https://eydiaabfbrtyfykaivri.supabase.co", "sb_publishable_045nV53i3sS4JzUet_yBqw_ROb5eBOB");
function useAuth() {
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(session?.user ?? null);
			setLoading(false);
		});
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});
		return () => subscription.unsubscribe();
	}, []);
	return {
		user,
		loading
	};
}
var LINKS = [
	{
		label: "Home",
		to: "/"
	},
	{
		label: "Films",
		to: "/films"
	},
	{
		label: "Series",
		to: "/series"
	},
	{
		label: "Anime",
		to: "/anime"
	},
	{
		label: "My List",
		to: "/my-list"
	}
];
function Nav() {
	const [scrolled, setScrolled] = (0, import_react.useState)(false);
	const [searchOpen, setSearchOpen] = (0, import_react.useState)(false);
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const inputRef = (0, import_react.useRef)(null);
	const { user } = useAuth();
	const { data: searchResults } = useQuery({
		queryKey: ["search", query],
		queryFn: () => tmdbApi.search(query),
		enabled: query.length > 1
	});
	(0, import_react.useEffect)(() => {
		const onScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	(0, import_react.useEffect)(() => {
		if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
	}, [searchOpen]);
	(0, import_react.useEffect)(() => {
		if (mobileOpen) document.body.style.overflow = "hidden";
		else document.body.style.overflow = "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileOpen]);
	const results = searchResults?.results?.filter((r) => r.media_type !== "person" && r.poster_path) ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: `fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "backdrop-blur-xl bg-background/70 border-b border-border" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-baseline gap-1 font-display text-2xl font-bold tracking-tight",
					onClick: () => setMobileOpen(false),
					children: ["ORBIT", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sup", {
						className: "text-[10px] font-normal text-muted-foreground",
						children: "®"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex",
					children: LINKS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: l.to,
						activeOptions: { exact: true },
						activeProps: { className: "text-foreground" },
						className: "transition-colors hover:text-foreground",
						children: l.label
					}, l.to))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 md:gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setSearchOpen(true),
						className: "rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "hidden rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground md:flex",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden h-8 w-px bg-border md:block" }),
					user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/profile",
						className: "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-ice to-accent ring-2 ring-border text-sm font-bold text-primary-foreground",
						children: (user.email ?? "?")[0].toUpperCase()
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						className: "hidden rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-primary-foreground md:block",
						children: "Sign In"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setMobileOpen((v) => !v),
						className: "rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground md:hidden",
						"aria-label": "Toggle menu",
						children: mobileOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
					})
				]
			})]
		}), mobileOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border bg-background/95 backdrop-blur-2xl md:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex flex-col px-6 py-6 gap-1",
				children: [LINKS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: l.to,
					activeOptions: { exact: true },
					activeProps: { className: "text-foreground bg-surface" },
					className: "rounded-lg px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground",
					onClick: () => setMobileOpen(false),
					children: l.label
				}, l.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 border-t border-border pt-4",
					children: user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/profile",
						onClick: () => setMobileOpen(false),
						className: "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-muted-foreground hover:bg-surface hover:text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-ice to-accent text-sm font-bold text-primary-foreground",
							children: (user.email ?? "?")[0].toUpperCase()
						}), "Profile"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						onClick: () => setMobileOpen(false),
						className: "block rounded-full border border-border px-5 py-3 text-center text-sm font-semibold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-primary-foreground",
						children: "Sign In"
					})
				})]
			})
		})]
	}), searchOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-2xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-4 border-b border-border px-6 py-5 md:px-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-5 w-5 text-muted-foreground flex-shrink-0" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Search movies, series, anime...",
					className: "flex-1 bg-transparent text-xl outline-none placeholder:text-muted-foreground"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						setSearchOpen(false);
						setQuery("");
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5 text-muted-foreground hover:text-foreground" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 overflow-y-auto px-6 py-8 md:px-10",
			children: [
				query.length > 1 && results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted-foreground",
					children: [
						"No results for \"",
						query,
						"\""
					]
				}),
				results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-6 text-xs uppercase tracking-[0.25em] text-muted-foreground",
					children: [results.length, " results"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
					children: results.map((item) => {
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchResultCard, {
							item,
							type: item.media_type === "tv" ? "tv" : "movie",
							onSelect: () => {
								setSearchOpen(false);
								setQuery("");
							}
						}, item.id);
					})
				})] }),
				query.length <= 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Start typing to search…"
				})
			]
		})]
	})] });
}
function SearchResultCard({ item, type, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: type === "movie" ? "/movie/$movieId" : "/tv/$tvId",
		params: type === "movie" ? { movieId: String(item.id) } : { tvId: String(item.id) },
		onClick: onSelect,
		className: "group block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "aspect-[2/3] overflow-hidden rounded-md border border-border bg-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: IMG_URL(item.poster_path, "w300"),
				alt: item.title || item.name,
				className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
				loading: "lazy"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs font-medium leading-tight truncate",
			children: item.title || item.name
		})]
	});
}
//#endregion
export { supabase as n, useAuth as r, Nav as t };
