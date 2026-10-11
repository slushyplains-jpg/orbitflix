import { n as tmdbApi } from "./tmdb-RYPw0Ln_.mjs";
import { r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { n as PageShell, t as PageHero } from "./PageShell-BqUwRpgP.mjs";
import { t as MediaGrid } from "./MediaGrid-BnCO1PJs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/series-FhXg1M72.js
var import_jsx_runtime = require_jsx_runtime();
function SeriesPage() {
	const popular = useQuery({
		queryKey: ["popularTV"],
		queryFn: tmdbApi.popularTV
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
		eyebrow: "Catalogue · Television",
		title: "Series",
		description: "Prestige dramas, sharp comedies, and limited runs built for late-night marathons."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-[1600px] px-6 md:px-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-8 font-display text-2xl font-semibold md:text-3xl",
				children: "Popular Series"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaGrid, {
				items: popular.data?.results ?? [],
				mediaType: "tv",
				loading: popular.isLoading
			})]
		})
	})] });
}
//#endregion
export { SeriesPage as component };
