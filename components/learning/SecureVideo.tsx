"use client";

import { useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/auth";
import { getPlayback, saveProtectedProgress } from "@/lib/learning";

export default function SecureVideo({
  lessonId,
  onCompleted,
}: {
  lessonId: string;
  onCompleted?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSavedRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let destroyHls: (() => void) | undefined;
    let refreshing = false;

    lastSavedRef.current = 0;

    function restorePlayback(video: HTMLVideoElement, seconds: number, shouldPlay: boolean) {
      if (Number.isFinite(seconds) && seconds > 0) {
        video.currentTime = Math.min(seconds, Math.max(video.duration - 0.5, 0));
      }
      if (shouldPlay) video.play().catch(() => {});
      setLoading(false);
    }

    async function attachTicket(preservePlayback: boolean) {
      const video = videoRef.current;
      if (!video || cancelled) return;

      const resumeAt = preservePlayback ? video.currentTime : 0;
      const shouldPlay = preservePlayback && !video.paused && !video.ended;
      if (!preservePlayback) setLoading(true);
      setError(null);
      if (refreshTimer) clearTimeout(refreshTimer);

      try {
        const ticket = await getPlayback(lessonId);
        if (cancelled || !videoRef.current) return;

        destroyHls?.();
        destroyHls = undefined;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          const loaded = () => restorePlayback(video, resumeAt, shouldPlay);
          video.addEventListener("loadedmetadata", loaded, { once: true });
          video.src = ticket.manifestUrl;
          video.load();
          destroyHls = () => video.removeEventListener("loadedmetadata", loaded);
        } else {
          const { default: Hls } = await import("hls.js");
          if (!Hls.isSupported()) {
            throw new Error("Brauzer HLS videoni qo‘llab-quvvatlamaydi");
          }

          const hls = new Hls({
            enableWorker: true,
            maxBufferLength: 30,
            backBufferLength: 30,
          });
          hls.attachMedia(video);
          hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(ticket.manifestUrl));
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            refreshing = false;
            restorePlayback(video, resumeAt, shouldPlay);
          });
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (!data.fatal || cancelled) return;
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !refreshing) {
              refreshing = true;
              attachTicket(true).catch(() => {
                setError("Video ulanishini yangilab bo‘lmadi");
              });
              return;
            }
            setError("Videoni uzatishda xatolik yuz berdi");
          });
          destroyHls = () => hls.destroy();
        }

        const renewAfterSeconds = Math.max(ticket.expiresIn - 45, 30);
        refreshTimer = setTimeout(() => {
          refreshing = true;
          attachTicket(true)
            .catch(() => setError("Video ruxsatini yangilab bo‘lmadi"))
            .finally(() => {
              refreshing = false;
            });
        }, renewAfterSeconds * 1000);
      } catch (reason) {
        if (!cancelled) {
          setLoading(false);
          setError(getApiErrorMessage(reason, "Videoni ochib bo‘lmadi"));
        }
      }
    }

    attachTicket(false);

    return () => {
      cancelled = true;
      if (refreshTimer) clearTimeout(refreshTimer);
      destroyHls?.();
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [lessonId, retryKey]);

  function handleTimeUpdate(event: React.SyntheticEvent<HTMLVideoElement>) {
    const seconds = Math.floor(event.currentTarget.currentTime);
    if (seconds - lastSavedRef.current < 15) return;
    lastSavedRef.current = seconds;
    saveProtectedProgress(lessonId, { watchedSeconds: seconds }).catch(() => {});
  }

  async function handleEnded(event: React.SyntheticEvent<HTMLVideoElement>) {
    const seconds = Math.floor(event.currentTarget.duration || event.currentTarget.currentTime);
    try {
      await saveProtectedProgress(lessonId, { watchedSeconds: seconds, completed: true });
      onCompleted?.();
    } catch {
      // The page keeps the video usable and allows a manual retry.
    }
  }

  return (
    <div className="relative h-full w-full bg-black">
      <video
        ref={videoRef}
        className="h-full w-full"
        controls
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        onContextMenu={(event) => event.preventDefault()}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-slate-950 text-sm text-slate-300">
          <span className="inline-flex items-center gap-3">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Himoyalangan video tayyorlanmoqda…
          </span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-slate-950 px-6 text-center text-sm text-red-300">
          <div>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((value) => value + 1)}
              className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Qayta urinish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
