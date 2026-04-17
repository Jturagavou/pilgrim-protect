"use client";

import { useState } from "react";

interface PhotoGalleryProps {
  photos?: string[];
}

export default function PhotoGallery({ photos = [] }: PhotoGalleryProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!photos.length) {
    return (
      <div className="bg-gradient-to-br from-paper-depth to-muted rounded-xl h-48 flex items-center justify-center border border-border">
        <p className="text-sm text-muted-foreground">No photos available yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map((url, i) => (
          <button
            key={i}
            onClick={() => setSelected(url)}
            className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity"
          >
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <img
            src={selected}
            alt="Full size"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
          />
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-black/70"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}
