import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as PageShell, t as PageHero } from "./PageShell-BqUwRpgP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/press-BHSBLMG_.js
var import_jsx_runtime = require_jsx_runtime();
var ARTICLES = [
	{
		date: "Jun 2026",
		source: "Variety",
		title: "ORBIT crosses 80M global subscribers, doubles down on anime originals"
	},
	{
		date: "May 2026",
		source: "Hollywood Reporter",
		title: "Inside the ORBIT writers' room: how prestige series get greenlit"
	},
	{
		date: "Apr 2026",
		source: "Indiewire",
		title: "ORBIT's late-night programming strategy is quietly winning awards"
	},
	{
		date: "Mar 2026",
		source: "The Verge",
		title: "ORBIT rolls out spatial audio across all premium tiers"
	},
	{
		date: "Feb 2026",
		source: "Bloomberg",
		title: "Streaming wars: ORBIT positions itself as the cinephile alternative"
	}
];
function PressPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
		eyebrow: "Studio · Newsroom",
		title: "Press",
		description: "Releases, coverage, and resources for journalists writing about ORBIT."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-[1300px] grid-cols-12 gap-10 px-6 md:px-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12 md:col-span-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-8 font-display text-2xl font-semibold",
					children: "In the news"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border rounded-2xl border border-border bg-surface",
					children: ARTICLES.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-col gap-2 p-6 md:flex-row md:items-center md:gap-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-24 flex-shrink-0 text-[10px] uppercase tracking-[0.25em] text-muted-foreground",
								children: a.date
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] uppercase tracking-[0.25em] text-ice",
									children: a.source
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-1 font-display text-lg font-semibold leading-snug",
									children: a.title
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#",
								className: "text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground",
								children: "Read →"
							})
						]
					}, a.title))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12 md:col-span-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-surface p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl font-semibold",
							children: "Media kit"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: "Brand assets, logos, executive bios, and high-res stills from our originals."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#",
							className: "mt-6 inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground",
							children: "Download Media Kit"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 rounded-2xl border border-border bg-surface p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl font-semibold",
							children: "Press contact"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: "For all media inquiries:"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "mailto:press@orbit.tv",
							className: "mt-3 block text-sm text-ice hover:underline",
							children: "press@orbit.tv"
						})
					]
				})]
			})]
		})
	})] });
}
//#endregion
export { PressPage as component };
