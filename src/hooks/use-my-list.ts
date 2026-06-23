import { useEffect, useState, useCallback } from "react";

const KEY = "orbit:my-list";

export interface MyListEntry {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  addedAt: number;
}

function read(): MyListEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function useMyList() {
  const [list, setList] = useState<MyListEntry[]>([]);

  useEffect(() => {
    setList(read());
    const handler = () => setList(read());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const add = useCallback((entry: Omit<MyListEntry, "addedAt">) => {
    const next = [...read().filter((e) => !(e.id === entry.id && e.type === entry.type)), { ...entry, addedAt: Date.now() }];
    localStorage.setItem(KEY, JSON.stringify(next));
    setList(next);
  }, []);

  const remove = useCallback((id: number, type: "movie" | "tv") => {
    const next = read().filter((e) => !(e.id === id && e.type === type));
    localStorage.setItem(KEY, JSON.stringify(next));
    setList(next);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setList([]);
  }, []);

  return { list, add, remove, clear };
}
