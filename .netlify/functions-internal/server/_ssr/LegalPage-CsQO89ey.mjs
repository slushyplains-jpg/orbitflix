import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as PageShell, t as PageHero } from "./PageShell-BqUwRpgP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/LegalPage-CsQO89ey.js
var import_jsx_runtime = require_jsx_runtime();
function LegalPage({ eyebrow, title, description, updated, sections }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
		eyebrow,
		title,
		description
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-[1200px] grid-cols-12 gap-10 px-6 md:px-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "col-span-12 md:col-span-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sticky top-28 space-y-3 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-[0.3em] text-muted-foreground",
							children: "Last updated"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-lg",
							children: updated
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "mt-6 space-y-2",
							children: sections.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `#s${i}`,
								className: "block text-muted-foreground hover:text-foreground",
								children: [
									String(i + 1).padStart(2, "0"),
									" · ",
									s.h
								]
							}, s.h))
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12 space-y-12 md:col-span-9",
				children: [sections.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					id: `s${i}`,
					className: "scroll-mt-32",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground",
							children: ["Section ", String(i + 1).padStart(2, "0")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl font-semibold",
							children: s.h
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "prose-invert mt-5 max-w-none space-y-4 text-sm leading-relaxed text-muted-foreground",
							children: s.body
						})
					]
				}, s.h)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "border-t border-border pt-8 text-xs text-muted-foreground",
					children: "This page is maintained by Orbit Pictures to answer common questions about how ORBIT works. It is not a legal contract and does not replace any signed agreement."
				})]
			})]
		})
	})] });
}
//#endregion
export { LegalPage as t };
