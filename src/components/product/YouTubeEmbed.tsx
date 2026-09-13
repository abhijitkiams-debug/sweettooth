"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { YouTubeEmbed as YT } from "@/lib/types";

/** Parse "mm:ss" / "m:ss" / seconds into a YouTube `t=` value. */
function toSeconds(ts?: string | null): number {
  if (!ts) return 0;
  const parts = ts.split(":").map((n) => parseInt(n, 10));
  if (parts.some(Number.isNaN)) return 0;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

/**
 * Lazy YouTube embed with a CGM time-offset deep link. The iframe only mounts
 * after the user clicks the poster, keeping the page light.
 */
export function YouTubeEmbed({ video }: { video: YT }) {
  const [playing, setPlaying] = useState(false);
  const start = toSeconds(video.cgmTimestamp);

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-video w-full bg-ink">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&start=${start}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 grid place-items-center"
            style={{
              backgroundImage: `url(https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-label={`Play: ${video.title}`}
          >
            <span className="absolute inset-0 bg-ink/30 transition group-hover:bg-ink/20" />
            <span className="relative grid h-14 w-14 place-items-center rounded-full bg-white/90 text-mint-700 shadow-lg transition group-hover:scale-105">
              <Play size={24} className="ml-0.5 fill-current" />
            </span>
            {video.cgmTimestamp && (
              <span className="absolute bottom-3 right-3 rounded-md bg-ink/80 px-2 py-1 text-xs font-medium text-white">
                CGM @ {video.cgmTimestamp}
              </span>
            )}
          </button>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-ink">{video.title}</p>
        <p className="text-xs text-ink-muted">{video.channelName}</p>
      </div>
    </div>
  );
}
