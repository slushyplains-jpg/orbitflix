import { i as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as Tablet, h as Monitor, i as Trash2, r as Tv, s as Smartphone } from "../_libs/lucide-react.mjs";
import { n as PageShell, t as PageHero } from "./PageShell-BqUwRpgP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/devices-CRs9553T.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SEED = [
	{
		id: "1",
		name: "Living Room TV",
		type: "tv",
		location: "Berlin, DE",
		lastActive: "Active now",
		current: true
	},
	{
		id: "2",
		name: "Astra's iPhone",
		type: "phone",
		location: "Berlin, DE",
		lastActive: "2 hours ago"
	},
	{
		id: "3",
		name: "MacBook Pro",
		type: "desktop",
		location: "Berlin, DE",
		lastActive: "Yesterday"
	},
	{
		id: "4",
		name: "iPad Air",
		type: "tablet",
		location: "Lisbon, PT",
		lastActive: "3 days ago"
	},
	{
		id: "5",
		name: "Bedroom Chromecast",
		type: "tv",
		location: "Berlin, DE",
		lastActive: "1 week ago"
	}
];
var ICONS = {
	tv: Tv,
	phone: Smartphone,
	tablet: Tablet,
	desktop: Monitor
};
function DevicesPage() {
	const [devices, setDevices] = (0, import_react.useState)(SEED);
	const remove = (id) => setDevices((d) => d.filter((x) => x.id !== id));
	const removeAll = () => setDevices((d) => d.filter((x) => x.current));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
		eyebrow: "Account · Security",
		title: "Devices",
		description: "Every device currently signed into your account. Remove any you don't recognize."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-[1100px] px-6 md:px-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs uppercase tracking-[0.25em] text-muted-foreground",
						children: [
							devices.length,
							" device",
							devices.length === 1 ? "" : "s"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: removeAll,
						className: "text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground",
						children: "Sign out everywhere else"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-2xl border border-border bg-surface",
					children: devices.map((d, i) => {
						const Icon = ICONS[d.type];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `flex items-center gap-5 p-5 md:p-6 ${i !== 0 ? "border-t border-border" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-display font-semibold",
											children: d.name
										}), d.current && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full border border-ice/40 bg-ice/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-ice",
											children: "This device"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											d.location,
											" · ",
											d.lastActive
										]
									})]
								}),
								!d.current && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => remove(d.id),
									className: "flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:bg-background hover:text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" }), " Remove"]
								})
							]
						}, d.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-xs text-muted-foreground",
					children: "See a device you don't recognize? Remove it, then change your password from Profile."
				})
			]
		})
	})] });
}
//#endregion
export { DevicesPage as component };
