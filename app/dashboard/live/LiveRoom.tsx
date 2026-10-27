"use client";

import type { DailyCall } from "@daily-co/daily-js";
import { Loader2, LogOut, Maximize2, Mic, Video } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoSession } from "@/lib/video";

type JitsiAPI = { dispose(): void; addListener(event: string, fn: () => void): void };
declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => JitsiAPI;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Couldn't load the video library"));
    document.body.appendChild(s);
  });
}

export function LiveRoom({ room, title }: { room: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<{ leave: () => void } | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "joined" | "error">("idle");
  const [error, setError] = useState<string>();

  const leave = useCallback(() => {
    callRef.current?.leave();
    callRef.current = null;
    if (containerRef.current) containerRef.current.innerHTML = "";
    setState("idle");
  }, []);

  useEffect(() => () => callRef.current?.leave(), []);

  async function join() {
    setState("loading");
    setError(undefined);
    try {
      const res = await fetch("/api/video/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room }),
      });
      const data = (await res.json()) as VideoSession & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't join the class.");
      const el = containerRef.current!;

      if (data.provider === "daily") {
        const { default: DailyIframe } = await import("@daily-co/daily-js");
        const frame: DailyCall = DailyIframe.createFrame(el, {
          showLeaveButton: true,
          showFullscreenButton: true,
          iframeStyle: { width: "100%", height: "100%", border: "0", borderRadius: "1.5rem" },
        });
        frame.on("left-meeting", () => {
          frame.destroy();
          callRef.current = null;
          setState("idle");
        });
        callRef.current = { leave: () => void frame.destroy() };
        await frame.join({ url: data.url, token: data.token });
      } else {
        await loadScript(`https://${data.domain}/external_api.js`);
        if (!window.JitsiMeetExternalAPI) throw new Error("Video library unavailable");
        const api = new window.JitsiMeetExternalAPI(data.domain, {
          roomName: data.roomName,
          parentNode: el,
          width: "100%",
          height: "100%",
          userInfo: { displayName: data.displayName, email: data.email },
          configOverwrite: { prejoinPageEnabled: true, disableDeepLinking: true, startWithAudioMuted: true },
          interfaceConfigOverwrite: { MOBILE_APP_PROMO: false, SHOW_JITSI_WATERMARK: false },
        });
        api.addListener("readyToClose", () => leave());
        callRef.current = { leave: () => api.dispose() };
      }
      setState("joined");
    } catch (e) {
      callRef.current?.leave();
      callRef.current = null;
      setError(e instanceof Error ? e.message : "Couldn't join the class.");
      setState("error");
    }
  }

  return (
    <div className="glass overflow-hidden rounded-[2rem] p-2">
      <div className="relative aspect-video min-h-[420px] w-full overflow-hidden rounded-3xl bg-sage-950 sm:min-h-[480px]">
        <div ref={containerRef} className="absolute inset-0" />
        {state !== "joined" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-sage-900 via-sage-950 to-black p-6 text-center text-sand-50">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
            <p className="mt-4 text-xs font-semibold tracking-widest text-sage-300 uppercase">Live studio</p>
            <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
            <p className="mt-2 max-w-md text-sm text-sand-100/70">
              You&apos;ll check your camera &amp; microphone before entering. Place your device so your whole mat is visible.
            </p>
            <div className="mt-5 flex gap-4 text-sand-100/60">
              <Video className="h-5 w-5" /> <Mic className="h-5 w-5" /> <Maximize2 className="h-5 w-5" />
            </div>
            <button onClick={join} disabled={state === "loading"} className="btn mt-7 bg-sand-50 !px-8 !py-3.5 text-base text-sage-900 hover:bg-white">
              {state === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" /> Connecting…</> : "Join class now"}
            </button>
            {error && <p className="mt-4 rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-100">{error}</p>}
          </div>
        )}
      </div>
      {state === "joined" && (
        <div className="flex justify-end p-2">
          <button onClick={leave} className="btn-ghost text-sm">
            <LogOut className="h-4 w-4" /> Leave studio
          </button>
        </div>
      )}
    </div>
  );
}
