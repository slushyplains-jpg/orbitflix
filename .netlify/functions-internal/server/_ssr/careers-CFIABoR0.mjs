import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as PageShell, t as PageHero } from "./PageShell-BqUwRpgP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/careers-CFIABoR0.js
var import_jsx_runtime = require_jsx_runtime();
var ROLES = [
	{
		team: "Engineering",
		title: "Senior Streaming Infrastructure Engineer",
		location: "Berlin · Remote OK"
	},
	{
		team: "Engineering",
		title: "Staff Frontend Engineer, Player",
		location: "Lisbon · Remote OK"
	},
	{
		team: "Design",
		title: "Principal Product Designer, Discovery",
		location: "Berlin · On-site"
	},
	{
		team: "Design",
		title: "Motion Designer, Brand",
		location: "Remote · Global"
	},
	{
		team: "Content",
		title: "Director, Anime Acquisitions",
		location: "Tokyo · On-site"
	},
	{
		team: "Content",
		title: "Editor, Originals",
		location: "Los Angeles · Hybrid"
	},
	{
		team: "Data",
		title: "ML Engineer, Recommendations",
		location: "Remote · EU"
	},
	{
		team: "Marketing",
		title: "Brand Partnerships Lead",
		location: "London · Hybrid"
	}
];
var VALUES = [
	{
		h: "Cinema first",
		b: "Every decision starts from the story. Frame rates, color, audio — we don't compromise on the experience."
	},
	{
		h: "Curated, not infinite",
		b: "We'd rather ship fewer titles done with care than a feed without a soul."
	},
	{
		h: "Quiet craft",
		b: "We sweat the typography, the timings, the sound design. The details are the product."
	}
];
function CareersPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
			eyebrow: "Studio · Hiring",
			title: "Careers",
			description: "Help us build the next chapter of cinematic streaming."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-[1300px] px-6 md:px-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-6 md:grid-cols-3",
					children: VALUES.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-surface p-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl font-semibold",
							children: v.h
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-muted-foreground",
							children: v.b
						})]
					}, v.h))
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-[1300px] px-6 md:px-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-10 font-display text-3xl font-semibold md:text-4xl",
						children: "Open roles"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-hidden rounded-2xl border border-border bg-surface",
						children: ROLES.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "#",
							className: `flex flex-col gap-2 p-6 transition-colors hover:bg-background md:flex-row md:items-center md:gap-8 ${i !== 0 ? "border-t border-border" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-32 flex-shrink-0 text-[10px] uppercase tracking-[0.25em] text-ice",
									children: r.team
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-lg font-semibold",
										children: r.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: r.location
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs uppercase tracking-[0.2em] text-muted-foreground",
									children: "Apply →"
								})
							]
						}, r.title))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-10 text-sm text-muted-foreground",
						children: [
							"Don't see your role? Send us a note at",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "mailto:careers@orbit.tv",
								className: "text-ice hover:underline",
								children: "careers@orbit.tv"
							}),
							"."
						]
					})
				]
			})
		})
	] });
}
//#endregion
export { CareersPage as component };
