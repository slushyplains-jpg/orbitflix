import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

const WS_URL = "wss://api.orbitflix.site/room";

type Server = "videasy" | "vidsrc" | "clean";
export const SERVER_IDX: Record<Server, string> = { videasy: "1", vidsrc: "2", clean: "3" };
export const IDX_SERVER: Record<string, Server> = { "1": "videasy", "2": "vidsrc", "3": "clean" };

interface FollowPrompt {
  movieId: number;
  movieTitle?: string;
  server: Server;
}

interface RoomCtx {
  activeRoom: string | null;
  server: Server;
  setServer: (s: Server) => void;
  joinRoom: (code: string, srv?: Server) => void;
  leaveRoom: () => void;
  copyRoomCode: (movieId: number) => void;
  copied: boolean;
  broadcastMovieChange: (movieId: number, movieTitle: string, srv: Server) => void;
  followPrompt: FollowPrompt | null;
  dismissFollowPrompt: () => void;
  acceptFollowPrompt: () => void;
  // Native (no-extension) video sync
  sendVideoEvent: (event: string, time: number) => void;
  registerRoomCmdHandler: (fn: ((event: string, time: number) => void) | null) => void;
}

const RoomContext = createContext<RoomCtx | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [server, setServer] = useState<Server>("videasy");
  const [copied, setCopied] = useState(false);
  const [followPrompt, setFollowPrompt] = useState<FollowPrompt | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const roomRef = useRef<string | null>(null);
  const roomCmdHandlerRef = useRef<((event: string, time: number) => void) | null>(null);
  const isSyncingRef = useRef(false);
  const navigate = useNavigate();

  const connect = useCallback((room: string) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    roomRef.current = room;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", room }));
    };

    ws.onmessage = (e) => {
      let msg: any;
      try { msg = JSON.parse(e.data); } catch { return; }

      if (msg.type === "MOVIE_CHANGE" && msg.room === roomRef.current) {
        setFollowPrompt({
          movieId: msg.movieId,
          movieTitle: msg.movieTitle,
          server: IDX_SERVER[msg.server] ?? "videasy",
        });
      }

      if (msg.type === "VIDEO_EVENT" && roomCmdHandlerRef.current) {
        isSyncingRef.current = true;
        roomCmdHandlerRef.current(msg.event, msg.time);
        setTimeout(() => { isSyncingRef.current = false; }, 500);
      }
    };

    ws.onclose = () => {
      // Reconnect only if still in room
      if (roomRef.current === room) {
        setTimeout(() => connect(room), 3000);
      }
    };
  }, []);

  const joinRoom = useCallback((code: string, srv?: Server) => {
    const room = code.trim().toUpperCase();
    if (!room) return;
    setActiveRoom(room);
    if (srv) setServer(srv);
    roomRef.current = room;
    window.postMessage({ type: "JOIN_ROOM", room }, "*");
    connect(room);
  }, [connect]);

  const leaveRoom = useCallback(() => {
    setActiveRoom(null);
    roomRef.current = null;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const broadcastMovieChange = useCallback((movieId: number, movieTitle: string, srv: Server) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !roomRef.current) return;
    wsRef.current.send(JSON.stringify({
      type: "MOVIE_CHANGE",
      room: roomRef.current,
      movieId,
      movieTitle,
      server: SERVER_IDX[srv],
    }));
  }, []);

  const sendVideoEvent = useCallback((event: string, time: number) => {
    if (isSyncingRef.current) return; // don't echo back received events
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !roomRef.current) return;
    wsRef.current.send(JSON.stringify({ type: "VIDEO_EVENT", room: roomRef.current, event, time }));
  }, []);

  const registerRoomCmdHandler = useCallback((fn: ((event: string, time: number) => void) | null) => {
    roomCmdHandlerRef.current = fn;
  }, []);

  const copyRoomCode = useCallback((movieId: number) => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(`${movieId}-${SERVER_IDX[server]}-${activeRoom}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [activeRoom, server]);

  const dismissFollowPrompt = useCallback(() => setFollowPrompt(null), []);

  const acceptFollowPrompt = useCallback(() => {
    if (!followPrompt) return;
    setServer(followPrompt.server);
    setFollowPrompt(null);
    navigate({ to: "/movie/$movieId", params: { movieId: String(followPrompt.movieId) } });
  }, [followPrompt, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      roomRef.current = null;
      wsRef.current?.close();
    };
  }, []);

  return (
    <RoomContext.Provider value={{
      activeRoom, server, setServer,
      joinRoom, leaveRoom,
      copyRoomCode, copied,
      broadcastMovieChange,
      followPrompt, dismissFollowPrompt, acceptFollowPrompt,
      sendVideoEvent, registerRoomCmdHandler,
    }}>
      {children}
      <FollowPromptBanner />
    </RoomContext.Provider>
  );
}

function FollowPromptBanner() {
  const ctx = useContext(RoomContext)!;
  const { followPrompt, dismissFollowPrompt, acceptFollowPrompt } = ctx;
  if (!followPrompt) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[300] -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm">
      <div className="flex items-center gap-3 rounded-xl border border-indigo-500/40 bg-background/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Someone switched to</p>
          <p className="text-sm font-semibold truncate">
            {followPrompt.movieTitle ?? `Movie #${followPrompt.movieId}`}
          </p>
        </div>
        <button
          onClick={dismissFollowPrompt}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 transition-colors flex-shrink-0"
        >
          Ignore
        </button>
        <button
          onClick={acceptFollowPrompt}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors flex-shrink-0"
        >
          Follow →
        </button>
      </div>
    </div>
  );
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used inside RoomProvider");
  return ctx;
}
