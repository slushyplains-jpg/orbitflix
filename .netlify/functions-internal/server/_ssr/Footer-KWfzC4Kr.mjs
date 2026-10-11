import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Footer-KWfzC4Kr.js
var import_jsx_runtime = require_jsx_runtime();
var COLS = [{
	h: "Browse",
	l: [
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
	]
}, {
	h: "Account",
	l: [
		{
			label: "Profile",
			to: "/profile"
		},
		{
			label: "My List",
			to: "/list"
		},
		{
			label: "Sign In",
			to: "/auth"
		}
	]
}];
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "relative mt-20 border-t border-border bg-surface/30 pb-10 pt-20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-[1600px] px-6 md:px-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-12 gap-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-12 md:col-span-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex items-baseline gap-1 font-display text-3xl font-bold tracking-tight",
							children: ["ORBIT", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sup", {
								className: "text-xs font-normal text-muted-foreground",
								children: "®"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 max-w-md text-sm leading-relaxed text-muted-foreground",
							children: "A cinematic streaming service for film, series and anime. Built for the dark hours, designed for the screen."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								className: "inline-block rounded-full border border-border px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-primary-foreground",
								children: "Sign In"
							})
						})
					]
				}), COLS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-6 md:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground",
						children: c.h
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-3 text-sm",
						children: c.l.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: i.to,
							className: "text-foreground/80 transition-colors hover:text-ice",
							children: i.label
						}) }, i.to + i.label))
					})]
				}, c.h))]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:flex-row md:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					"© ",
					(/* @__PURE__ */ new Date()).getFullYear(),
					" Orbit Pictures · All rights reserved"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/terms",
							className: "hover:text-foreground",
							children: "Terms"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/privacy",
							className: "hover:text-foreground",
							children: "Privacy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/cookies",
							className: "hover:text-foreground",
							children: "Cookie Preferences"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dmca",
							className: "hover:text-foreground",
							children: "DMCA"
						})
					]
				})]
			})]
		})
	});
}
//#endregion
export { Footer as t };
