import { i as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { w as Check } from "../_libs/lucide-react.mjs";
import { n as PageShell, t as PageHero } from "./PageShell-BqUwRpgP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/subscription-bNDIxRkf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PLANS = [
	{
		id: "basic",
		name: "Basic",
		price: "$7.99",
		features: [
			"HD streaming",
			"1 device at a time",
			"Limited downloads",
			"Standard catalogue"
		]
	},
	{
		id: "standard",
		name: "Standard",
		price: "$14.99",
		features: [
			"Full HD streaming",
			"2 devices at a time",
			"Unlimited downloads",
			"Full catalogue"
		],
		highlight: true
	},
	{
		id: "premium",
		name: "Premium",
		price: "$22.99",
		features: [
			"4K HDR + Dolby Atmos",
			"4 devices at a time",
			"Spatial audio",
			"Originals previews"
		]
	}
];
function SubscriptionPage() {
	const [current, setCurrent] = (0, import_react.useState)("premium");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
		eyebrow: "Account · Billing",
		title: "Subscription",
		description: "Pick a plan that matches how you watch. Change or cancel any time."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-[1300px] px-6 md:px-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-10 rounded-2xl border border-border bg-surface p-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-[0.3em] text-muted-foreground",
							children: "Current Plan"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "mt-2 font-display text-2xl font-semibold",
							children: [PLANS.find((p) => p.id === current)?.name, " · Renews Aug 12"]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "rounded-full border border-border px-5 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-background",
							children: "Cancel Subscription"
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-6 md:grid-cols-3",
					children: PLANS.map((p) => {
						const active = p.id === current;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `relative flex flex-col rounded-2xl border p-8 transition-all ${p.highlight ? "border-ice/40 bg-surface" : "border-border bg-surface/60"} ${active ? "ring-2 ring-ice" : ""}`,
							children: [
								p.highlight && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-ice/40 bg-background px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-ice",
									children: "Most Popular"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-2xl font-semibold",
									children: p.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex items-baseline gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-5xl font-bold",
										children: p.price
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm text-muted-foreground",
										children: "/ month"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-8 flex-1 space-y-3 text-sm",
									children: p.features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-start gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-ice" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f })]
									}, f))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setCurrent(p.id),
									disabled: active,
									className: `mt-8 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors ${active ? "border border-border text-muted-foreground" : "bg-foreground text-primary-foreground hover:scale-[1.02]"}`,
									children: active ? "Current Plan" : "Switch to this plan"
								})
							]
						}, p.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-10 text-center text-xs text-muted-foreground",
					children: "All plans include offline downloads on mobile and unlimited streaming. Taxes may apply."
				})
			]
		})
	})] });
}
//#endregion
export { SubscriptionPage as component };
