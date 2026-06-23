import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

const KEY = "orbit:my-list";

export interface MyListEntry {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  addedAt: number;
}

function readLocal(): MyListEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(entries: MyListEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function useMyList() {
  const { user } = useAuth();
  const [list, setList] = useState<MyListEntry[]>([]);

  // Load list — from Supabase if logged in, localStorage otherwise
  useEffect(() => {
    if (user) {
      supabase
        .from("watchlist")
        .select("*")
        .order("added_at", { ascending: false })
        .then(({ data }) => {
          if (data) {
            setList(
              data.map((r) => ({
                id: r.tmdb_id,
                type: r.media_type as "movie" | "tv",
                title: r.title,
                poster_path: r.poster_path,
                addedAt: new Date(r.added_at).getTime(),
              }))
            );
          }
        });
    } else {
      setList(readLocal());
      const handler = () => setList(readLocal());
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    }
  }, [user]);

  const add = useCallback(
    async (entry: Omit<MyListEntry, "addedAt">) => {
      if (user) {
        await supabase.from("watchlist").upsert({
          user_id: user.id,
          tmdb_id: entry.id,
          media_type: entry.type,
          title: entry.title,
          poster_path: entry.poster_path,
        });
        setList((prev) => {
          const filtered = prev.filter(
            (e) => !(e.id === entry.id && e.type === entry.type)
          );
          return [{ ...entry, addedAt: Date.now() }, ...filtered];
        });
      } else {
        const next = [
          { ...entry, addedAt: Date.now() },
          ...readLocal().filter(
            (e) => !(e.id === entry.id && e.type === entry.type)
          ),
        ];
        writeLocal(next);
        setList(next);
      }
    },
    [user]
  );

  const remove = useCallback(
    async (id: number, type: "movie" | "tv") => {
      if (user) {
        await supabase
          .from("watchlist")
          .delete()
          .match({ user_id: user.id, tmdb_id: id, media_type: type });
      } else {
        const next = readLocal().filter(
          (e) => !(e.id === id && e.type === type)
        );
        writeLocal(next);
      }
      setList((prev) => prev.filter((e) => !(e.id === id && e.type === type)));
    },
    [user]
  );

  const clear = useCallback(async () => {
    if (user) {
      await supabase.from("watchlist").delete().match({ user_id: user.id });
    } else {
      localStorage.removeItem(KEY);
    }
    setList([]);
  }, [user]);

  const isInList = useCallback(
    (id: number, type: "movie" | "tv") =>
      list.some((e) => e.id === id && e.type === type),
    [list]
  );

  return { list, add, remove, clear, isInList };
}
