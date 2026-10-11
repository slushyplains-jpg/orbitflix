import { i as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { P as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as supabase, r as useAuth } from "./Nav-DuuBqbyU.mjs";
import { n as PageShell } from "./PageShell-BqUwRpgP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-DBn-Xh6c.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	const { user } = useAuth();
	(0, import_react.useEffect)(() => {
		if (user) navigate({ to: "/profile" });
	}, [user, navigate]);
	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		setMessage("");
		setLoading(true);
		try {
			if (mode === "signup") {
				const { error } = await supabase.auth.signUp({
					email,
					password,
					options: { data: { display_name: name } }
				});
				if (error) throw error;
				setMessage("Account created! Check your email to confirm, then sign in.");
				setMode("signin");
			} else {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password
				});
				if (error) throw error;
				navigate({ to: "/profile" });
			}
		} catch (err) {
			setError(err.message ?? "Something went wrong.");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "relative",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid min-h-[80vh] max-w-[1600px] grid-cols-12 gap-10 px-6 py-16 md:px-10 md:py-24",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12 flex flex-col justify-center md:col-span-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-ice/60" }), mode === "signin" ? "Welcome back" : "Create your account"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-6xl",
						children: mode === "signin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							"Step back",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-ice text-glow",
								children: "into orbit."
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							"Begin your",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-ice text-glow",
								children: "journey."
							})
						] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 max-w-md text-sm text-muted-foreground",
						children: mode === "signin" ? "Your watchlist, your devices, your continue-watching — all in one place." : "Create a free account. Your watchlist syncs across all your devices."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "col-span-12 md:col-span-6 md:col-start-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-surface/60 p-8 backdrop-blur-md md:p-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-8 flex gap-2 rounded-full border border-border bg-background p-1",
							children: ["signin", "signup"].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									setMode(m);
									setError("");
									setMessage("");
								},
								className: `flex-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${mode === m ? "bg-foreground text-primary-foreground" : "text-muted-foreground"}`,
								children: m === "signin" ? "Sign In" : "Sign Up"
							}, m))
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive",
							children: error
						}),
						message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-5 rounded-lg border border-ice/30 bg-ice/10 px-4 py-3 text-sm text-ice",
							children: message
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleSubmit,
							className: "space-y-5",
							children: [
								mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Name",
									type: "text",
									placeholder: "Your name",
									value: name,
									onChange: (e) => setName(e.target.value),
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Email",
									type: "email",
									placeholder: "you@example.com",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Password",
									type: "password",
									placeholder: "••••••••",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									required: true,
									minLength: 6
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "submit",
									disabled: loading,
									className: "flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60",
									children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), mode === "signin" ? "Sign In" : "Create Account"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-8 text-center text-xs text-muted-foreground",
							children: [
								"By continuing you agree to our",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/terms",
									className: "text-foreground hover:text-ice",
									children: "Terms"
								}),
								" &",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/privacy",
									className: "text-foreground hover:text-ice",
									children: "Privacy"
								}),
								"."
							]
						})
					]
				})
			})]
		})
	}) });
}
function Field({ label, ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-2 block text-[10px] uppercase tracking-[0.25em] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			...rest,
			className: "w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ice"
		})]
	});
}
//#endregion
export { AuthPage as component };
