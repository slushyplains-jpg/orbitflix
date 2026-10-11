import { t as IMG_URL } from "./tmdb-RYPw0Ln_.mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Trash2 } from "../_libs/lucide-react.mjs";
import { n as PageShell, t as PageHero } from "./PageShell-BqUwRpgP.mjs";
import { t as useMyList } from "./use-my-list-BmsXjJRF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/my-list-Dh9eI5Oa.js
var import_jsx_runtime = require_jsx_runtime();
function MyListPage() {
	const { list, remove, clear } = useMyList();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
		eyebrow: "Account · Watchlist",
		title: "My List",
		description: `${list.length} title${list.length === 1 ? "" : "s"} saved for later viewing.`
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-[1600px] px-6 md:px-10",
			children: list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-dashed border-border bg-surface/40 p-16 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-2xl font-semibold",
						children: "Your list is empty."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: [
							"Tap the ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: "+"
							}),
							" on any title to save it for later."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/films",
						className: "mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground",
						children: "Browse Films"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs uppercase tracking-[0.25em] text-muted-foreground",
					children: [list.length, " saved"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: clear,
					className: "text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground",
					children: "Clear all"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
				children: list.map((entry) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "group relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: entry.type === "tv" ? "/tv/$tvId" : "/movie/$movieId",
							params: entry.type === "tv" ? { tvId: String(entry.id) } : { movieId: String(entry.id) },
							className: "block aspect-[2/3] overflow-hidden rounded-md border border-border bg-surface",
							children: [
								entry.poster_path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: IMG_URL(entry.poster_path, "w500"),
									alt: entry.title,
									loading: "lazy",
									className: "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-full w-full items-center justify-center text-xs text-muted-foreground",
									children: entry.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-70" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute bottom-3 left-3 right-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-sm font-semibold line-clamp-2",
										children: entry.title
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => remove(entry.id, entry.type),
							className: "absolute right-2 top-2 rounded-full border border-border bg-background/70 p-2 backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100",
							"aria-label": "Remove",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
						})]
					}, `${entry.type}-${entry.id}`);
				})
			})] })
		})
	})] });
}
//#endregion
export { MyListPage as component };
