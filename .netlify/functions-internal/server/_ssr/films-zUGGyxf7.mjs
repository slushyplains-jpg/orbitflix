import { n as tmdbApi } from "./tmdb-RYPw0Ln_.mjs";
import { r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { n as PageShell, t as PageHero } from "./PageShell-BqUwRpgP.mjs";
import { t as MediaGrid } from "./MediaGrid-BnCO1PJs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/films-zUGGyxf7.js
var import_jsx_runtime = require_jsx_runtime();
function FilmsPage() {
	const popular = useQuery({
		queryKey: ["popularMovies"],
		queryFn: tmdbApi.popularMovies
	});
	const top = useQuery({
		queryKey: ["topRatedMovies"],
		queryFn: tmdbApi.topRatedMovies
	});
	const action = useQuery({
		queryKey: ["actionMovies"],
		queryFn: tmdbApi.actionMovies
	});
	const scifi = useQuery({
		queryKey: ["scifiMovies"],
		queryFn: tmdbApi.scifiMovies
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
			eyebrow: "Catalogue · Cinema",
			title: "Films",
			description: "From midnight noir to blockbuster spectacle — every frame curated for the screen."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Popular Now",
			items: popular.data?.results ?? [],
			loading: popular.isLoading
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Top Rated",
			items: top.data?.results ?? [],
			loading: top.isLoading
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Action & Adventure",
			items: action.data?.results ?? [],
			loading: action.isLoading
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Sci-Fi & Fantasy",
			items: scifi.data?.results ?? [],
			loading: scifi.isLoading
		})
	] });
}
function Section({ title, items, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-[1600px] px-6 md:px-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-8 font-display text-2xl font-semibold md:text-3xl",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaGrid, {
				items,
				mediaType: "movie",
				loading
			})]
		})
	});
}
//#endregion
export { FilmsPage as component };
