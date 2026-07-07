import Image from "next/image";
import type { ContentImage } from "@/types/airtable";

export function ImageGallery({ images }: { images: ContentImage[] }) {
  if (!images.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {images.map((image) => (
        <div key={image.id} className="relative aspect-4/3 overflow-hidden bg-black/5">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
