"use client";

import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { parseYouTubeUrls } from "@/lib/youtube";

export function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  return <LiteYouTubeEmbed id={videoId} title={title} />;
}

/** Renders every video in a "YouTube URLs" long-text field (0, 1, or many). */
export function YouTubeEmbedList({ raw, title }: { raw?: string | null; title: string }) {
  const ids = parseYouTubeUrls(raw);
  if (!ids.length) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {ids.map((id) => (
        <YouTubeEmbed key={id} videoId={id} title={title} />
      ))}
    </div>
  );
}
