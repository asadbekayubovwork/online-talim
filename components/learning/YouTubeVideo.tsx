"use client";

import { useEffect, useRef, useState } from "react";
import { saveProtectedProgress } from "@/lib/learning";

interface YouTubePlayer {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

interface YouTubeApi {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      width?: string;
      height?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
        onError?: () => void;
      };
    },
  ) => YouTubePlayer;
  PlayerState: { ENDED: number; PLAYING: number };
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube pleyeri ishga tushmadi"));
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error("YouTube pleyerini yuklab bo‘lmadi"));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

/**
 * YouTube-hosted lesson video. Watch time is reported to the API on the same
 * cadence as the uploaded-video player, so lesson completion stays gated.
 */
export default function YouTubeVideo({
  lessonId,
  videoId,
  trackProgress = true,
  onCompleted,
}: {
  lessonId: string;
  videoId: string;
  trackProgress?: boolean;
  onCompleted?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const lastSavedRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Kept in refs so a late sign-in or a new callback identity never tears the
  // player down mid-lesson.
  const trackProgressRef = useRef(trackProgress);
  const onCompletedRef = useRef(onCompleted);

  useEffect(() => {
    trackProgressRef.current = trackProgress;
    onCompletedRef.current = onCompleted;
  });

  useEffect(() => {
    const host = hostRef.current;
    let cancelled = false;
    let player: YouTubePlayer | null = null;
    let ticker: ReturnType<typeof setInterval> | undefined;
    lastSavedRef.current = 0;

    function reportProgress(seconds: number, completed = false) {
      if (!trackProgressRef.current) return;
      saveProtectedProgress(lessonId, { watchedSeconds: seconds, completed: completed || undefined })
        .then(() => {
          if (completed && !cancelled) onCompletedRef.current?.();
        })
        .catch(() => {
          // Playback stays usable; the page keeps its manual completion button.
        });
    }

    loadYouTubeApi()
      .then((api) => {
        if (cancelled || !host) return;
        // YouTube replaces the element it is given with an iframe, so it gets a
        // node React does not manage.
        const target = document.createElement("div");
        host.appendChild(target);
        player = new api.Player(target, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (!cancelled) setLoading(false);
            },
            onStateChange: (event) => {
              if (cancelled || !player) return;
              if (event.data === api.PlayerState.PLAYING && !ticker) {
                ticker = setInterval(() => {
                  const seconds = Math.floor(player?.getCurrentTime() ?? 0);
                  if (seconds - lastSavedRef.current < 15) return;
                  lastSavedRef.current = seconds;
                  reportProgress(seconds);
                }, 1000);
              }
              if (event.data === api.PlayerState.ENDED) {
                const seconds = Math.floor(player.getDuration() || player.getCurrentTime() || 0);
                lastSavedRef.current = seconds;
                reportProgress(seconds, true);
              }
            },
            onError: () => {
              if (!cancelled) {
                setLoading(false);
                setError("Videoni ijro etib bo‘lmadi. Havola noto‘g‘ri yoki video yopiq bo‘lishi mumkin.");
              }
            },
          },
        });
      })
      .catch((reason: Error) => {
        if (cancelled) return;
        setLoading(false);
        setError(reason.message);
      });

    return () => {
      cancelled = true;
      if (ticker) clearInterval(ticker);
      player?.destroy();
      host?.replaceChildren();
    };
  }, [lessonId, videoId]);

  return (
    <div className="relative h-full w-full bg-black">
      <div ref={hostRef} className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full" />
      {loading && !error && (
        <div className="absolute inset-0 grid place-items-center bg-slate-950 text-sm text-slate-300">
          <span className="inline-flex items-center gap-3">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Video yuklanmoqda…
          </span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-slate-950 px-6 text-center text-sm text-red-300">
          <div>
            <p>{error}</p>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              YouTube’da ochish
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
