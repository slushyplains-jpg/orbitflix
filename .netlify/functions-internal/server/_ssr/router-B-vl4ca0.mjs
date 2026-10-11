import { i as __toESM } from "../_runtime.mjs";
import { t as IMG_URL } from "./tmdb-RYPw0Ln_.mjs";
import { i as require_react, n as QueryClientProvider, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { F as useRouter, O as redirect, c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { D as Sparkles, O as LoaderCircle, c as Shield, l as Share2, t as X, u as Send } from "../_libs/lucide-react.mjs";
import { i as TSS_SERVER_FUNCTION, l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as Route$17 } from "./movie._movieId-C-3Vpnfh.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-sacnbM7V.mjs";
import { t as Route$18 } from "./tv._tvId-rh7iN2bg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-B-vl4ca0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-4iGl7q0l.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
function TelegramBanner() {
	const [visible, setVisible] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const t = setTimeout(() => setVisible(true), 3e3);
		return () => clearTimeout(t);
	}, []);
	function dismiss() {
		setVisible(false);
		setTimeout(() => setVisible(true), 12e4);
	}
	if (!visible) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed bottom-6 right-4 z-[200] w-[340px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-4 fade-in duration-500",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative overflow-hidden rounded-2xl border border-border bg-surface/90 p-5 shadow-2xl backdrop-blur-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: dismiss,
				className: "absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-border/40 hover:text-foreground transition-colors",
				"aria-label": "Dismiss",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#229ED9]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 24 24",
						className: "h-6 w-6 fill-white",
						xmlns: "http://www.w3.org/2000/svg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 pr-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1",
							children: "Heads up"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold leading-snug text-foreground",
							children: "The site may close tomorrow"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-xs leading-relaxed text-muted-foreground",
							children: "If that happens, the ORBIT Telegram channel will be the only place where you'll find the new link. Join now while you're thinking about it."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "https://t.me/+Ej3I0qkIEJFkZWI0",
							target: "_blank",
							rel: "noopener noreferrer",
							onClick: dismiss,
							className: "mt-3 inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
								viewBox: "0 0 24 24",
								className: "h-3.5 w-3.5 fill-white",
								xmlns: "http://www.w3.org/2000/svg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" })
							}), "Join Telegram"]
						})
					]
				})]
			})]
		})
	});
}
typeof window !== "undefined" && window.location.href;
var SHARE_TEXT = "Watch free movies, series & anime on ORBIT 🎬";
var BUTTONS = [
	{
		label: "Telegram",
		color: "#229ED9",
		href: (url) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(SHARE_TEXT)}`,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 24 24",
			className: "h-4 w-4 fill-white",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" })
		})
	},
	{
		label: "WhatsApp",
		color: "#25D366",
		href: (url) => `https://wa.me/?text=${encodeURIComponent("Watch free movies, series & anime on ORBIT 🎬 " + url)}`,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 24 24",
			className: "h-4 w-4 fill-white",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" })
		})
	},
	{
		label: "X / Twitter",
		color: "#000000",
		href: (url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(url)}`,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 24 24",
			className: "h-4 w-4 fill-white",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" })
		})
	},
	{
		label: "Facebook",
		color: "#1877F2",
		href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 24 24",
			className: "h-4 w-4 fill-white",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" })
		})
	},
	{
		label: "Reddit",
		color: "#FF4500",
		href: (url) => `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(SHARE_TEXT)}`,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 24 24",
			className: "h-4 w-4 fill-white",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" })
		})
	}
];
function FloatingShare() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const url = typeof window !== "undefined" ? window.location.href : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed right-0 top-1/2 -translate-y-1/2 z-[150] flex flex-col items-end",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => setOpen((v) => !v),
			className: "flex items-center gap-2 rounded-l-xl bg-surface border border-r-0 border-border px-3 py-3 text-muted-foreground hover:text-foreground transition-colors shadow-xl",
			"aria-label": "Share",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] font-semibold uppercase tracking-widest hidden sm:block writing-mode-vertical",
				children: "Share"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `flex flex-col overflow-hidden rounded-l-2xl border border-r-0 border-border bg-surface/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ${open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`,
			children: BUTTONS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: b.href(url),
				target: "_blank",
				rel: "noopener noreferrer",
				title: b.label,
				className: "group flex items-center gap-3 px-4 py-3 hover:bg-border/30 transition-colors",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
					style: { backgroundColor: b.color },
					children: b.icon
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap pr-1",
					children: b.label
				})]
			}, b.label))
		})]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var askConcierge = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("104ab998a74b2c68797d912e64133b8591b961b4d1026dcb4caaa6e711018f75"));
var STARTERS = [
	"Something like Interstellar but scarier",
	"Best crime dramas of the last decade",
	"Anime with stunning visuals",
	"A feel-good movie for tonight"
];
function AiConcierge() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [input, setInput] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const bottomRef = (0, import_react.useRef)(null);
	const inputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (open) setTimeout(() => inputRef.current?.focus(), 100);
	}, [open]);
	(0, import_react.useEffect)(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, loading]);
	async function send(text) {
		const userText = (text ?? input).trim();
		if (!userText || loading) return;
		const newMessages = [...messages, {
			role: "user",
			content: userText
		}];
		setMessages(newMessages);
		setInput("");
		setLoading(true);
		setError("");
		try {
			const data = await askConcierge({ data: { messages: newMessages.map((m) => ({
				role: m.role,
				content: m.content
			})) } });
			setMessages((prev) => [...prev, {
				role: "assistant",
				content: data.reply,
				movies: data.movies
			}]);
		} catch (e) {
			setError(e.message ?? "Something went wrong");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => setOpen(true),
			className: `fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_32px_rgba(99,102,241,0.7)] ${open ? "opacity-0 pointer-events-none scale-90" : "opacity-100"}`,
			"aria-label": "Open AI Concierge",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-6 w-6 text-white" })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `fixed bottom-0 right-0 z-50 flex flex-col transition-all duration-300 ease-out
          sm:bottom-6 sm:right-6 sm:rounded-2xl sm:shadow-2xl
          ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
          w-full sm:w-[400px] h-[85dvh] sm:h-[600px]
          border border-white/10 bg-[#0d0d12]/95 backdrop-blur-2xl overflow-hidden`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-white/10 px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-700",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-white" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-white",
							children: "ORBIT Concierge"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-white/40",
							children: "AI-powered film guide"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setOpen(false),
						className: "rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto px-4 py-4 space-y-4",
					children: [
						messages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center justify-center h-full gap-6 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-white/80",
								children: "What are you in the mood for?"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-white/40",
								children: "Ask me anything about movies or series"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 gap-2 w-full",
								children: STARTERS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => send(s),
									className: "rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white",
									children: s
								}, s))
							})]
						}),
						messages.map((msg, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `flex ${msg.role === "user" ? "justify-end" : "justify-start"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white/8 text-white/90 rounded-bl-sm border border-white/10"}`,
									children: msg.content
								}), msg.movies && msg.movies.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-3 gap-2 w-full max-w-full",
									children: msg.movies.slice(0, 6).map((m) => {
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: m.media_type === "tv" ? "/tv/$tvId" : "/movie/$movieId",
											params: m.media_type === "tv" ? { tvId: String(m.id) } : { movieId: String(m.id) },
											onClick: () => setOpen(false),
											className: "group block",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-white/5",
													children: m.poster_path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
														src: IMG_URL(m.poster_path, "w300"),
														alt: m.title,
														className: "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "flex h-full items-center justify-center p-1 text-center text-[10px] text-white/40",
														children: m.title
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 truncate text-[10px] text-white/60 group-hover:text-white transition-colors",
													children: m.title
												}),
												m.year && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[10px] text-white/30",
													children: m.year
												})
											]
										}, m.id);
									})
								})]
							})
						}, i)),
						loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-start",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/10 bg-white/8 px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin text-white/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-white/40",
									children: "Searching the archives…"
								})]
							})
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: bottomRef })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-white/10 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							send();
						},
						className: "flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: inputRef,
							value: input,
							onChange: (e) => setInput(e.target.value),
							placeholder: "Ask about any movie or series…",
							className: "flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30",
							disabled: loading
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: !input.trim() || loading,
							className: "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition-all hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-center text-[10px] text-white/20",
						children: "Powered by Claude AI · Real data from TMDB"
					})]
				})
			]
		}),
		open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-40 bg-black/60 sm:hidden",
			onClick: () => setOpen(false)
		})
	] });
}
var NORDVPN_LINK = "https://go.nordvpn.net/aff_c?offer_id=15&aff_id=YOUR_AFFILIATE_ID&url_id=902";
function VpnBanner() {
	const [visible, setVisible] = (0, import_react.useState)(false);
	const [dismissed, setDismissed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (sessionStorage.getItem("vpn_banner_dismissed")) return;
		const timer = setTimeout(() => setVisible(true), 8e3);
		return () => clearTimeout(timer);
	}, []);
	function dismiss() {
		setVisible(false);
		setDismissed(true);
		sessionStorage.setItem("vpn_banner_dismissed", "1");
	}
	if (dismissed || !visible) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `fixed bottom-24 left-0 right-0 z-30 flex justify-center px-4 transition-all duration-500 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full max-w-xl items-center gap-4 rounded-2xl border border-white/10 bg-[#0d0d12]/95 px-5 py-3.5 shadow-2xl backdrop-blur-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#4687FF]/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4 text-[#4687FF]" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold text-white",
						children: "Stream safely with NordVPN"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 truncate text-[11px] text-white/50",
						children: "Protect your connection while watching — 67% off today"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: NORDVPN_LINK,
					target: "_blank",
					rel: "noopener noreferrer",
					onClick: dismiss,
					className: "flex-shrink-0 rounded-full bg-[#4687FF] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90",
					children: "Get Deal"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: dismiss,
					className: "flex-shrink-0 rounded-full p-1 text-white/30 transition-colors hover:text-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
				})
			]
		})
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$16 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "ORBIT — Watch Free Movies, Series & Anime Online" },
			{
				name: "description",
				content: "Stream thousands of movies, TV series and anime for free on ORBIT. No sign-up required. HD quality, updated daily."
			},
			{
				name: "author",
				content: "ORBIT"
			},
			{
				name: "keywords",
				content: "watch movies online free, free streaming, watch anime online, watch tv series free, ORBIT stream"
			},
			{
				name: "robots",
				content: "index, follow"
			},
			{
				property: "og:title",
				content: "ORBIT — Watch Free Movies, Series & Anime Online"
			},
			{
				property: "og:description",
				content: "Stream thousands of movies, TV series and anime for free on ORBIT. No sign-up required. HD quality, updated daily."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:site_name",
				content: "ORBIT"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@OrbitStream"
			},
			{
				name: "twitter:title",
				content: "ORBIT — Watch Free Movies, Series & Anime Online"
			},
			{
				name: "twitter:description",
				content: "Stream thousands of movies, TV series and anime for free on ORBIT."
			}
		],
		scripts: [
			{
				src: "https://quge5.com/88/tag.min.js",
				async: true,
				"data-zone": "253178",
				"data-cfasync": "false"
			},
			{ children: `var _Hasync=_Hasync||[];
_Hasync.push(['Histats.start','1,XXXXXXXX,4,0,0,0,00010000']);
_Hasync.push(['Histats.fasi','1']);
_Hasync.push(['Histats.track_hits','']);
(function(){var hs=document.createElement('script');hs.type='text/javascript';hs.async=true;
hs.src='//s10.histats.com/js15_as.js';
(document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(hs);})();` },
			{
				src: "https://static.cloudflareinsights.com/beacon.min.js",
				defer: true,
				"data-cf-beacon": "{\"token\":\"9e9f4c95643d4d7781381ea1af15629f\"}"
			},
			{ children: `(function(d,z,s){s.src='https://'+d+'/400/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('perttelimers.net',ZONE_ID,document.createElement('script'));` }
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.svg",
				type: "image/svg+xml"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$16.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TelegramBanner, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingShare, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiConcierge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VpnBanner, {})
		]
	});
}
var $$splitComponentImporter$14 = () => import("./terms-LAIbCS-1.mjs");
var Route$15 = createFileRoute("/terms")({
	head: () => ({ meta: [{ title: "Terms of Service — ORBIT" }, {
		name: "description",
		content: "Terms governing your use of the ORBIT streaming platform."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./subscription-bNDIxRkf.mjs");
var Route$14 = createFileRoute("/subscription")({
	head: () => ({ meta: [{ title: "Subscription — ORBIT" }, {
		name: "description",
		content: "Pick the ORBIT plan that fits your viewing. Change or cancel any time."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./series-FhXg1M72.mjs");
var Route$13 = createFileRoute("/series")({
	head: () => ({ meta: [
		{ title: "Series — ORBIT" },
		{
			name: "description",
			content: "Binge-worthy series, prestige dramas and limited runs curated on ORBIT."
		},
		{
			property: "og:title",
			content: "Series — ORBIT"
		},
		{
			property: "og:description",
			content: "Television, reimagined."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./profile-BG0FhDQg.mjs");
var Route$12 = createFileRoute("/profile")({
	head: () => ({ meta: [{ title: "Profile — ORBIT" }, {
		name: "description",
		content: "Manage your ORBIT profile."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./privacy-CXbRgiN-.mjs");
var Route$11 = createFileRoute("/privacy")({
	head: () => ({ meta: [{ title: "Privacy Policy — ORBIT" }, {
		name: "description",
		content: "How ORBIT handles your data, cookies, and privacy."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./press-BHSBLMG_.mjs");
var Route$10 = createFileRoute("/press")({
	head: () => ({ meta: [{ title: "Press — ORBIT" }, {
		name: "description",
		content: "Press releases, media kit, and coverage of ORBIT."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./my-list-Dh9eI5Oa.mjs");
var Route$9 = createFileRoute("/my-list")({
	head: () => ({ meta: [{ title: "My List — ORBIT" }, {
		name: "description",
		content: "Your personal ORBIT watchlist."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var Route$8 = createFileRoute("/list")({ beforeLoad: () => {
	throw redirect({ to: "/my-list" });
} });
var $$splitComponentImporter$7 = () => import("./films-zUGGyxf7.mjs");
var Route$7 = createFileRoute("/films")({
	head: () => ({ meta: [
		{ title: "Films — ORBIT" },
		{
			name: "description",
			content: "Browse the ORBIT film catalogue. Popular, top rated, action, and sci-fi cinema curated for the night."
		},
		{
			property: "og:title",
			content: "Films — ORBIT"
		},
		{
			property: "og:description",
			content: "A handpicked universe of cinema."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./dmca-9wC4NanU.mjs");
var Route$6 = createFileRoute("/dmca")({
	head: () => ({ meta: [{ title: "DMCA Policy — ORBIT" }, {
		name: "description",
		content: "ORBIT's DMCA policy and how to submit a copyright takedown notice."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./devices-CRs9553T.mjs");
var Route$5 = createFileRoute("/devices")({
	head: () => ({ meta: [{ title: "Devices — ORBIT" }, {
		name: "description",
		content: "Manage devices signed into your ORBIT account."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./cookies-CUSUT-gN.mjs");
var Route$4 = createFileRoute("/cookies")({
	head: () => ({ meta: [{ title: "Cookie Preferences — ORBIT" }, {
		name: "description",
		content: "Manage your cookie preferences for ORBIT."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./careers-CFIABoR0.mjs");
var Route$3 = createFileRoute("/careers")({
	head: () => ({ meta: [{ title: "Careers — ORBIT" }, {
		name: "description",
		content: "Help build the next chapter of cinematic streaming. Open roles at ORBIT."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./auth-DBn-Xh6c.mjs");
var Route$2 = createFileRoute("/auth")({
	head: () => ({ meta: [{ title: "Sign In — ORBIT" }, {
		name: "description",
		content: "Sign in or create your ORBIT account."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./anime-DgIUcdnV.mjs");
var Route$1 = createFileRoute("/anime")({
	head: () => ({ meta: [
		{ title: "Anime — ORBIT" },
		{
			name: "description",
			content: "Anime selections from Tokyo to the cosmos — curated on ORBIT."
		},
		{
			property: "og:title",
			content: "Anime — ORBIT"
		},
		{
			property: "og:description",
			content: "From Tokyo to the cosmos."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./routes-CPov2q3z.mjs");
var Route = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "ORBIT — Cinematic Streaming for Film, Series & Anime" },
		{
			name: "description",
			content: "ORBIT is a cinematic streaming platform for films, series and anime. Discover boundless worlds, hand-curated catalogues, and exclusive originals."
		},
		{
			property: "og:title",
			content: "ORBIT — Cinematic Streaming"
		},
		{
			property: "og:description",
			content: "Films, series and anime, curated like cinema."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var TermsRoute = Route$15.update({
	id: "/terms",
	path: "/terms",
	getParentRoute: () => Route$16
});
var SubscriptionRoute = Route$14.update({
	id: "/subscription",
	path: "/subscription",
	getParentRoute: () => Route$16
});
var SeriesRoute = Route$13.update({
	id: "/series",
	path: "/series",
	getParentRoute: () => Route$16
});
var ProfileRoute = Route$12.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => Route$16
});
var PrivacyRoute = Route$11.update({
	id: "/privacy",
	path: "/privacy",
	getParentRoute: () => Route$16
});
var PressRoute = Route$10.update({
	id: "/press",
	path: "/press",
	getParentRoute: () => Route$16
});
var MyListRoute = Route$9.update({
	id: "/my-list",
	path: "/my-list",
	getParentRoute: () => Route$16
});
var ListRoute = Route$8.update({
	id: "/list",
	path: "/list",
	getParentRoute: () => Route$16
});
var FilmsRoute = Route$7.update({
	id: "/films",
	path: "/films",
	getParentRoute: () => Route$16
});
var DmcaRoute = Route$6.update({
	id: "/dmca",
	path: "/dmca",
	getParentRoute: () => Route$16
});
var DevicesRoute = Route$5.update({
	id: "/devices",
	path: "/devices",
	getParentRoute: () => Route$16
});
var CookiesRoute = Route$4.update({
	id: "/cookies",
	path: "/cookies",
	getParentRoute: () => Route$16
});
var CareersRoute = Route$3.update({
	id: "/careers",
	path: "/careers",
	getParentRoute: () => Route$16
});
var AuthRoute = Route$2.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$16
});
var AnimeRoute = Route$1.update({
	id: "/anime",
	path: "/anime",
	getParentRoute: () => Route$16
});
var IndexRoute = Route.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$16
});
var TvTvIdRoute = Route$18.update({
	id: "/tv/$tvId",
	path: "/tv/$tvId",
	getParentRoute: () => Route$16
});
var rootRouteChildren = {
	IndexRoute,
	AnimeRoute,
	AuthRoute,
	CareersRoute,
	CookiesRoute,
	DevicesRoute,
	DmcaRoute,
	FilmsRoute,
	ListRoute,
	MyListRoute,
	PressRoute,
	PrivacyRoute,
	ProfileRoute,
	SeriesRoute,
	SubscriptionRoute,
	TermsRoute,
	MovieMovieIdRoute: Route$17.update({
		id: "/movie/$movieId",
		path: "/movie/$movieId",
		getParentRoute: () => Route$16
	}),
	TvTvIdRoute
};
var routeTree = Route$16._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
