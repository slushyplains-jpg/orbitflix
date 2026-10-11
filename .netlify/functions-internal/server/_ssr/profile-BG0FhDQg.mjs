import { i as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { P as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as LoaderCircle, _ as LogOut, f as Save, o as Star, r as Tv, y as Film } from "../_libs/lucide-react.mjs";
import { n as supabase, r as useAuth } from "./Nav-DuuBqbyU.mjs";
import { n as PageShell, t as PageHero } from "./PageShell-BqUwRpgP.mjs";
import { t as useMyList } from "./use-my-list-BmsXjJRF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-BG0FhDQg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const navigate = useNavigate();
	const { user, loading: authLoading } = useAuth();
	const { list } = useMyList();
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [displayName, setDisplayName] = (0, import_react.useState)("");
	const [avatarUrl, setAvatarUrl] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)(false);
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!authLoading && !user) navigate({ to: "/auth" });
	}, [
		user,
		authLoading,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
			if (data) {
				setProfile(data);
				setDisplayName(data.display_name ?? "");
				setAvatarUrl(data.avatar_url ?? "");
			}
		});
	}, [user]);
	async function handleSave() {
		if (!user) return;
		setSaving(true);
		await supabase.from("profiles").upsert({
			id: user.id,
			display_name: displayName,
			avatar_url: avatarUrl
		});
		setSaving(false);
		setSaved(true);
		setTimeout(() => setSaved(false), 2e3);
	}
	async function handleSignOut() {
		setSigningOut(true);
		await supabase.auth.signOut();
		navigate({ to: "/" });
	}
	if (authLoading || !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[60vh] items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" })
	}) });
	const movieCount = list.filter((i) => i.type === "movie").length;
	const tvCount = list.filter((i) => i.type === "tv").length;
	const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric"
	}) : "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
		eyebrow: "Account",
		title: "Profile",
		description: "Your account and preferences."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-[1600px] grid-cols-12 gap-8 px-6 md:px-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "col-span-12 md:col-span-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-surface p-8 text-center",
					children: [
						avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: avatarUrl,
							alt: displayName,
							className: "mx-auto h-28 w-28 rounded-full object-cover border-2 border-border"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-ice to-accent text-3xl font-bold text-primary-foreground",
							children: (displayName || user.email || "?")[0].toUpperCase()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-6 font-display text-2xl font-semibold",
							children: displayName || "No name set"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: user.email
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-ice",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3 w-3 fill-ice text-ice" }), " Member"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 space-y-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/my-list",
								className: "block w-full rounded-full border border-border py-3 text-xs font-semibold uppercase tracking-widest hover:bg-background",
								children: [
									"My List (",
									list.length,
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: handleSignOut,
								disabled: signingOut,
								className: "flex w-full items-center justify-center gap-2 rounded-full border border-destructive/40 py-3 text-xs font-semibold uppercase tracking-widest text-destructive hover:bg-destructive/10",
								children: [signingOut ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3 w-3" }), "Sign Out"]
							})]
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12 space-y-8 md:col-span-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-5 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "h-3 w-3" }),
								label: "Films saved",
								value: String(movieCount)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "h-3 w-3" }),
								label: "Series saved",
								value: String(tvCount)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3 w-3 fill-ice text-ice" }),
								label: "Member since",
								value: memberSince
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-surface p-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl font-semibold",
							children: "Edit Profile"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Display Name",
									value: displayName,
									onChange: (e) => setDisplayName(e.target.value),
									placeholder: "Your name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Avatar URL",
									value: avatarUrl,
									onChange: (e) => setAvatarUrl(e.target.value),
									placeholder: "https://...",
									type: "url"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: handleSave,
										disabled: saving,
										className: "flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60",
										children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3 w-3" }), "Save Changes"]
									}), saved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-ice",
										children: "Saved ✓"
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-surface p-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl font-semibold",
							children: "Account Details"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 space-y-5 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Email",
									value: user.email ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Member Since",
									value: memberSince
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "User ID",
									value: user.id.slice(0, 8) + "..."
								})
							]
						})]
					})
				]
			})]
		})
	})] });
}
function Stat({ icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-surface p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground",
			children: [
				icon,
				" ",
				label
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 font-display text-3xl font-semibold",
			children: value
		})]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs uppercase tracking-[0.2em] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium",
			children: value
		})]
	});
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
export { ProfilePage as component };
