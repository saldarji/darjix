"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PhotoItem } from "@/lib/types";

interface PhotoGalleryProps {
  images: PhotoItem[];
  title: string;
}

export default function PhotoGallery({ images, title }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const activeImage = images[currentIndex];
  const activeUrl = activeImage.url ? encodeURI(activeImage.url) : "";

  return (
    <div className="relative w-full my-4">
      <div className="relative overflow-hidden bg-gray-100 rounded border border-gray-200 aspect-[4/3] md:aspect-[16/10]">
        <img
          src={activeUrl}
          alt={activeImage.alt_text || title}
          className="w-full h-full object-contain block"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-2 rounded-full transition z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-2 rounded-full transition z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentIndex ? "bg-white scale-110" : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="absolute bottom-3 right-3 text-xs bg-black/70 text-white px-2 py-1 rounded">
              Photo {currentIndex + 1} of {images.length}
            </div>
          </>
        )}
      </div>

      {activeImage.caption && (
        <p className="mt-2 text-sm text-gray-600 italic px-2">
          {activeImage.caption}
        </p>
      )}
    </div>
  );
}
