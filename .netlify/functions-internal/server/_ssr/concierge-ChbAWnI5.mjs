import { i as TSS_SERVER_FUNCTION, l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as Anthropic } from "../_libs/@anthropic-ai/sdk+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/concierge-ChbAWnI5.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var TMDB_KEY = "dddf373a16513b75dbbed7847f542f95";
async function searchTMDB(query, type = "multi") {
	const url = `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=1`;
	return ((await (await fetch(url)).json()).results ?? []).slice(0, 8);
}
function formatResults(results, fallbackType) {
	return results.filter((r) => r.poster_path).slice(0, 6).map((r) => ({
		id: r.id,
		title: r.title || r.name,
		media_type: r.media_type || fallbackType,
		year: (r.release_date || r.first_air_date || "").slice(0, 4),
		rating: r.vote_average ? r.vote_average.toFixed(1) : null,
		overview: (r.overview ?? "").slice(0, 160),
		poster_path: r.poster_path
	}));
}
var SYSTEM = `You are ORBIT's AI Movie Concierge — a sophisticated, cinematic guide for film lovers.
Personality: knowledgeable, passionate about cinema, slightly poetic, concise.

Rules:
- ALWAYS call search_content before recommending anything. Never invent titles.
- After searching, present 3-5 picks with 1-sentence evocative descriptions each.
- Format: plain prose, no markdown headers or bullet symbols. Title in quotes.
- Keep total response under 180 words.
- If asked about a specific movie/show, search for it and give a short review + similar picks.
- If asked something off-topic, gently redirect to film/series discovery.`;
var askConcierge_createServerFn_handler = createServerRpc({
	id: "104ab998a74b2c68797d912e64133b8591b961b4d1026dcb4caaa6e711018f75",
	name: "askConcierge",
	filename: "src/lib/concierge.ts"
}, (opts) => askConcierge.__executeServer(opts));
var askConcierge = createServerFn({ method: "POST" }).validator((data) => data).handler(askConcierge_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.ANTHROPIC_API_KEY;
	if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set. Add it to your .env file and Netlify environment variables.");
	const client = new Anthropic({ apiKey });
	const tools = [{
		name: "search_content",
		description: "Search for movies or TV shows by keyword, genre, mood, or title.",
		input_schema: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description: "Search query"
				},
				type: {
					type: "string",
					enum: [
						"movie",
						"tv",
						"multi"
					],
					description: "Content type. Use multi when unsure."
				}
			},
			required: ["query"]
		}
	}];
	let movies = [];
	const first = await client.messages.create({
		model: "claude-haiku-4-5-20251001",
		max_tokens: 1024,
		system: SYSTEM,
		tools,
		messages: data.messages
	});
	let reply = "";
	if (first.stop_reason === "tool_use") {
		const toolBlock = first.content.find((b) => b.type === "tool_use");
		if (toolBlock) {
			const input = toolBlock.input;
			movies = formatResults(await searchTMDB(input.query, input.type ?? "multi"), input.type ?? "movie");
			reply = (await client.messages.create({
				model: "claude-haiku-4-5-20251001",
				max_tokens: 1024,
				system: SYSTEM,
				tools,
				messages: [
					...data.messages,
					{
						role: "assistant",
						content: first.content
					},
					{
						role: "user",
						content: [{
							type: "tool_result",
							tool_use_id: toolBlock.id,
							content: JSON.stringify(movies)
						}]
					}
				]
			})).content.filter((b) => b.type === "text").map((b) => b.text).join("");
		}
	} else reply = first.content.filter((b) => b.type === "text").map((b) => b.text).join("");
	return {
		reply,
		movies
	};
});
//#endregion
export { askConcierge_createServerFn_handler };
