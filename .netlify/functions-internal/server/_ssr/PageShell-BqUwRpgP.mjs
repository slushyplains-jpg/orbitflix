import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as Nav } from "./Nav-DuuBqbyU.mjs";
import { t as Footer } from "./Footer-KWfzC4Kr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PageShell-BqUwRpgP.js
var import_jsx_runtime = require_jsx_runtime();
function PageShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "pt-28",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
function PageHero({ eyebrow, title, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "relative border-b border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-[1600px] px-6 py-16 md:px-10 md:py-24",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-ice/60" }), eyebrow]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl md:text-7xl",
					children: title
				}),
				description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground",
					children: description
				})
			]
		})
	});
}
//#endregion
export { PageShell as n, PageHero as t };
