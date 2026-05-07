"use client";

import { useEffect, useState } from "react";

export function Lightbox({
  urls,
  initialIndex,
  onClose,
}: {
  urls: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(urls.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [urls.length, onClose]);

  if (urls.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
      >
        Close
      </button>
      {index > 0 && (
        <button
          aria-label="Previous"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => Math.max(0, i - 1));
          }}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
        >
          ‹
        </button>
      )}
      {index < urls.length - 1 && (
        <button
          aria-label="Next"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => Math.min(urls.length - 1, i + 1));
          }}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
        >
          ›
        </button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urls[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain"
      />
      {urls.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/80 tabular-nums">
          {index + 1} / {urls.length}
        </div>
      )}
    </div>
  );
}
