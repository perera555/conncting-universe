"use client";

import { useState, type FormEvent } from "react";
import type { Dict } from "@/content/en";
import { useStored, uid } from "./use-stored";
import Tilt from "./tilt";

type Video = { id: string; yt: string; title: string };

/** Pull the 11-char video id out of any common YouTube URL shape. */
function parseYouTube(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return u.pathname.slice(1, 12) || null;
    if (host.endsWith("youtube.com") || host === "youtube-nocookie.com") {
      const v = u.searchParams.get("v");
      if (v) return v.slice(0, 11);
      const m = u.pathname.match(/\/(embed|shorts|live|v)\/([\w-]{11})/);
      if (m) return m[2];
    }
  } catch {}
  return null;
}

export default function VideoWall({ t }: { t: Dict["videos"] }) {
  const [videos, setVideos, loaded] = useStored<Video[]>("cu-videos", []);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);

  const add = (e: FormEvent) => {
    e.preventDefault();
    const yt = parseYouTube(url);
    if (!yt) {
      setError(t.error);
      return;
    }
    setVideos((all) => [{ id: uid(), yt, title: title.trim() || t.defaultTitle }, ...all]);
    setUrl("");
    setTitle("");
    setError("");
    setPlaying(yt);
  };

  return (
    <div>
      <form onSubmit={add} className="glass grid gap-3 rounded-3xl p-5 md:grid-cols-[2fr_1.3fr_auto]">
        <input
          className="field"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t.urlPh}
          aria-label={t.urlPh}
        />
        <input
          className="field"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.titlePh}
          aria-label={t.titlePh}
        />
        <button className="btn btn-primary justify-center">{t.add}</button>
        {error && <p className="text-sm text-rose md:col-span-3">{error}</p>}
      </form>

      {loaded && videos.length === 0 && (
        <p className="mt-8 text-center text-muted">{t.empty}</p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <Tilt key={v.id} max={8} className="fade-in rounded-3xl">
            <figure className="glass overflow-hidden rounded-3xl">
              <div className="relative aspect-video bg-black">
                {playing === v.yt ? (
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${v.yt}?autoplay=1&rel=0`}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <button onClick={() => setPlaying(v.yt)} className="group absolute inset-0" aria-label={`${t.play}: ${v.title}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail */}
                    <img
                      src={`https://i.ytimg.com/vi/${v.yt}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                    />
                    <span className="pop absolute inset-0 grid place-items-center">
                      <span className="grid h-16 w-16 place-items-center rounded-full bg-gold/90 text-2xl text-night shadow-[0_0_40px_rgb(245_200_107/0.7)] transition group-hover:scale-110">
                        ▶
                      </span>
                    </span>
                  </button>
                )}
              </div>
              <figcaption className="flex items-center justify-between gap-3 p-4">
                <span className="truncate font-medium">{v.title}</span>
                <button
                  onClick={() => {
                    setVideos((all) => all.filter((x) => x.id !== v.id));
                    if (playing === v.yt) setPlaying(null);
                  }}
                  className="text-xs text-muted hover:text-rose"
                >
                  {t.remove}
                </button>
              </figcaption>
            </figure>
          </Tilt>
        ))}
      </div>
    </div>
  );
}
