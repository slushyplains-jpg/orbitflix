import { t as IMG_URL } from "./tmdb-RYPw0Ln_.mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as Star } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/MediaGrid-BnCO1PJs.js
var import_jsx_runtime = require_jsx_runtime();
function MediaGrid({ items, mediaType, loading }) {
	if (loading || !items.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
		children: Array.from({ length: 18 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-[2/3] rounded-md bg-surface animate-pulse" }, i))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
		children: items.filter((i) => i.poster_path).map((item) => {
			const type = mediaType ?? (item.media_type === "tv" ? "tv" : "movie");
			const to = type === "tv" ? "/tv/$tvId" : "/movie/$movieId";
			const params = type === "tv" ? { tvId: String(item.id) } : { movieId: String(item.id) };
			const title = item.title || item.name || "";
			const year = (item.release_date || item.first_air_date)?.slice(0, 4) ?? "";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to,
				params,
				className: "group relative block aspect-[2/3] overflow-hidden rounded-md border border-border bg-surface",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: IMG_URL(item.poster_path, "w500"),
						alt: title,
						loading: "lazy",
						className: "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-80" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-x-0 bottom-0 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-sm font-semibold leading-tight line-clamp-2",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: year }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3 w-3 fill-ice text-ice" }),
									" ",
									item.vote_average?.toFixed(1) ?? "—"
								]
							})]
						})]
					})
				]
			}, item.id);
		})
	});
}
//#endregion
export { MediaGrid as t };
