import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { IMG_URL } from "@/lib/tmdb";
import { askConcierge, type MovieResult, type ChatMessage } from "@/lib/concierge";

type Message = {
  role: "user" | "assistant";
  content: string;
  movies?: MovieResult[];
};

const STARTERS = [
  "Something like Interstellar but scarier",
  "Best crime dramas of the last decade",
  "Anime with stunning visuals",
  "A feel-good movie for tonight",
];

export function AiConcierge() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const data = await askConcierge({
        data: {
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })) as ChatMessage[],
        },
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, movies: data.movies },
      ]);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_32px_rgba(99,102,241,0.7)] ${open ? "opacity-0 pointer-events-none scale-90" : "opacity-100"}`}
        aria-label="Open AI Concierge"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </button>

      {/* Panel */}
      <div
        className={`fixed bottom-0 right-0 z-50 flex flex-col transition-all duration-300 ease-out
          sm:bottom-6 sm:right-6 sm:rounded-2xl sm:shadow-2xl
          ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
          w-full sm:w-[400px] h-[85dvh] sm:h-[600px]
          border border-white/10 bg-[#0d0d12]/95 backdrop-blur-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-700">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">ORBIT Concierge</p>
              <p className="text-[11px] text-white/40">AI-powered film guide</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <div>
                <p className="text-sm font-medium text-white/80">What are you in the mood for?</p>
                <p className="mt-1 text-xs text-white/40">Ask me anything about movies or series</p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white/8 text-white/90 rounded-bl-sm border border-white/10"
                  }`}
                >
                  {msg.content}
                </div>

                {/* Movie cards */}
                {msg.movies && msg.movies.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 w-full max-w-full">
                    {msg.movies.slice(0, 6).map((m) => {
                      const to = m.media_type === "tv" ? "/tv/$tvId" : "/movie/$movieId";
                      const params =
                        m.media_type === "tv"
                          ? { tvId: String(m.id) }
                          : { movieId: String(m.id) };
                      return (
                        <Link
                          key={m.id}
                          to={to}
                          params={params}
                          onClick={() => setOpen(false)}
                          className="group block"
                        >
                          <div className="aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-white/5">
                            {m.poster_path ? (
                              <img
                                src={IMG_URL(m.poster_path, "w300")}
                                alt={m.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center p-1 text-center text-[10px] text-white/40">
                                {m.title}
                              </div>
                            )}
                          </div>
                          <p className="mt-1 truncate text-[10px] text-white/60 group-hover:text-white transition-colors">
                            {m.title}
                          </p>
                          {m.year && (
                            <p className="text-[10px] text-white/30">{m.year}</p>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/10 bg-white/8 px-4 py-3">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white/40" />
                <span className="text-xs text-white/40">Searching the archives…</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-3">
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any movie or series…"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition-all hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-white/20">
            Powered by Claude AI · Real data from TMDB
          </p>
        </div>
      </div>

      {/* Backdrop on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
