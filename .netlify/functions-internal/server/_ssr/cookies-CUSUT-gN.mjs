import { i as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as PageShell, t as PageHero } from "./PageShell-BqUwRpgP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cookies-CUSUT-gN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORIES = [
	{
		id: "essential",
		name: "Strictly necessary",
		body: "Required to keep you signed in and run core security functions. These cannot be disabled.",
		required: true
	},
	{
		id: "analytics",
		name: "Analytics",
		body: "Helps us understand aggregated traffic patterns via Google Analytics. Data is anonymized — no personal information is collected."
	},
	{
		id: "thirdparty",
		name: "Third-party embeds",
		body: "Video content is served by third-party embed providers. These providers may set their own cookies when you play content. We have no control over these."
	}
];
function CookiesPage() {
	const [prefs, setPrefs] = (0, import_react.useState)({
		essential: true,
		analytics: true,
		thirdparty: true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
		eyebrow: "Legal · Preferences",
		title: "Cookie Preferences",
		description: "ORBIT uses minimal cookies to keep the service running. Here's what each one does and how to control them."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-[900px] px-6 md:px-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-8 rounded-2xl border border-border bg-surface/50 p-6 text-sm leading-relaxed text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "ORBIT does not use advertising or tracking cookies. The categories below relate to functional and third-party embed cookies only. Third-party video providers may set their own cookies independent of your preferences here." })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4",
					children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-5 rounded-2xl border border-border bg-surface p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-lg font-semibold",
									children: c.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: c.body
								}),
								c.required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-[10px] uppercase tracking-[0.25em] text-ice",
									children: "Always active"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							disabled: c.required,
							onClick: () => setPrefs((p) => ({
								...p,
								[c.id]: !p[c.id]
							})),
							className: `relative mt-1 h-7 w-12 flex-shrink-0 rounded-full transition-colors ${prefs[c.id] ? "bg-ice" : "bg-border"} disabled:opacity-50`,
							"aria-label": `Toggle ${c.name}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute top-0.5 h-6 w-6 rounded-full bg-background transition-transform ${prefs[c.id] ? "translate-x-[1.4rem]" : "translate-x-0.5"}` })
						})]
					}, c.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 flex flex-wrap items-center justify-end gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setPrefs({
								essential: true,
								analytics: false,
								thirdparty: false
							}),
							className: "rounded-full border border-border px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-surface",
							children: "Reject all"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setPrefs({
								essential: true,
								analytics: true,
								thirdparty: true
							}),
							className: "rounded-full border border-border px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-surface",
							children: "Accept all"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground",
							children: "Save Preferences"
						})
					]
				})
			]
		})
	})] });
}
//#endregion
export { CookiesPage as component };
