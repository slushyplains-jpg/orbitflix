import { createServerFn } from "@tanstack/react-start";
import Anthropic from "@anthropic-ai/sdk";

const TMDB_KEY = "dddf373a16513b75dbbed7847f542f95";

async function searchTMDB(query: string, type: string = "multi") {
  const url = `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=1`;
  const res = await fetch(url);
  const data = (await res.json()) as { results?: any[] };
  return (data.results ?? []).slice(0, 8);
}

function formatResults(results: any[], fallbackType: string) {
  return results
    .filter((r) => r.poster_path)
    .slice(0, 6)
    .map((r) => ({
      id: r.id as number,
      title: (r.title || r.name) as string,
      media_type: (r.media_type || fallbackType) as string,
      year: ((r.release_date || r.first_air_date || "") as string).slice(0, 4),
      rating: r.vote_average ? (r.vote_average as number).toFixed(1) : null,
      overview: ((r.overview as string) ?? "").slice(0, 160),
      poster_path: r.poster_path as string,
    }));
}

export type MovieResult = ReturnType<typeof formatResults>[number];
export type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM = `You are ORBIT's AI Movie Concierge — a sophisticated, cinematic guide for film lovers.
Personality: knowledgeable, passionate about cinema, slightly poetic, concise.

Rules:
- ALWAYS call search_content before recommending anything. Never invent titles.
- After searching, present 3-5 picks with 1-sentence evocative descriptions each.
- Format: plain prose, no markdown headers or bullet symbols. Title in quotes.
- Keep total response under 180 words.
- If asked about a specific movie/show, search for it and give a short review + similar picks.
- If asked something off-topic, gently redirect to film/series discovery.`;

export const askConcierge = createServerFn({ method: "POST" })
  .validator((data: { messages: ChatMessage[] }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to your .env file and Netlify environment variables."
      );
    }

    const client = new Anthropic({ apiKey });

    const tools: Anthropic.Tool[] = [
      {
        name: "search_content",
        description: "Search for movies or TV shows by keyword, genre, mood, or title.",
        input_schema: {
          type: "object" as const,
          properties: {
            query: { type: "string", description: "Search query" },
            type: {
              type: "string",
              enum: ["movie", "tv", "multi"],
              description: "Content type. Use multi when unsure.",
            },
          },
          required: ["query"],
        },
      },
    ];

    let movies: MovieResult[] = [];

    const first = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM,
      tools,
      messages: data.messages as Anthropic.MessageParam[],
    });

    let reply = "";

    if (first.stop_reason === "tool_use") {
      const toolBlock = first.content.find((b) => b.type === "tool_use") as
        | Anthropic.ToolUseBlock
        | undefined;

      if (toolBlock) {
        const input = toolBlock.input as { query: string; type?: string };
        const rawResults = await searchTMDB(input.query, input.type ?? "multi");
        movies = formatResults(rawResults, input.type ?? "movie");

        const second = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: SYSTEM,
          tools,
          messages: [
            ...(data.messages as Anthropic.MessageParam[]),
            { role: "assistant", content: first.content },
            {
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: toolBlock.id,
                  content: JSON.stringify(movies),
                },
              ],
            },
          ],
        });

        reply = second.content
          .filter((b) => b.type === "text")
          .map((b) => (b as Anthropic.TextBlock).text)
          .join("");
      }
    } else {
      reply = first.content
        .filter((b) => b.type === "text")
        .map((b) => (b as Anthropic.TextBlock).text)
        .join("");
    }

    return { reply, movies };
  });
