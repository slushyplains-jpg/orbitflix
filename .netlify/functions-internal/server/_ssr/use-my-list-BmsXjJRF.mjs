import { i as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as supabase, r as useAuth } from "./Nav-DuuBqbyU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-my-list-BmsXjJRF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var KEY = "orbit:my-list";
function readLocal() {
	if (typeof window === "undefined") return [];
	try {
		return JSON.parse(localStorage.getItem(KEY) || "[]");
	} catch {
		return [];
	}
}
function writeLocal(entries) {
	localStorage.setItem(KEY, JSON.stringify(entries));
}
function useMyList() {
	const { user } = useAuth();
	const [list, setList] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (user) supabase.from("watchlist").select("*").order("added_at", { ascending: false }).then(({ data }) => {
			if (data) setList(data.map((r) => ({
				id: r.tmdb_id,
				type: r.media_type,
				title: r.title,
				poster_path: r.poster_path,
				addedAt: new Date(r.added_at).getTime()
			})));
		});
		else {
			setList(readLocal());
			const handler = () => setList(readLocal());
			window.addEventListener("storage", handler);
			return () => window.removeEventListener("storage", handler);
		}
	}, [user]);
	return {
		list,
		add: (0, import_react.useCallback)(async (entry) => {
			if (user) {
				await supabase.from("watchlist").upsert({
					user_id: user.id,
					tmdb_id: entry.id,
					media_type: entry.type,
					title: entry.title,
					poster_path: entry.poster_path
				});
				setList((prev) => {
					const filtered = prev.filter((e) => !(e.id === entry.id && e.type === entry.type));
					return [{
						...entry,
						addedAt: Date.now()
					}, ...filtered];
				});
			} else {
				const next = [{
					...entry,
					addedAt: Date.now()
				}, ...readLocal().filter((e) => !(e.id === entry.id && e.type === entry.type))];
				writeLocal(next);
				setList(next);
			}
		}, [user]),
		remove: (0, import_react.useCallback)(async (id, type) => {
			if (user) await supabase.from("watchlist").delete().match({
				user_id: user.id,
				tmdb_id: id,
				media_type: type
			});
			else writeLocal(readLocal().filter((e) => !(e.id === id && e.type === type)));
			setList((prev) => prev.filter((e) => !(e.id === id && e.type === type)));
		}, [user]),
		clear: (0, import_react.useCallback)(async () => {
			if (user) await supabase.from("watchlist").delete().match({ user_id: user.id });
			else localStorage.removeItem(KEY);
			setList([]);
		}, [user]),
		isInList: (0, import_react.useCallback)((id, type) => list.some((e) => e.id === id && e.type === type), [list])
	};
}
//#endregion
export { useMyList as t };
