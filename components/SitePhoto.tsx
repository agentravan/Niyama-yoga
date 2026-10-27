import Image from "next/image";
import { getPhoto, type PhotoKey } from "@/lib/photos";

type Props = {
  photo: PhotoKey;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Rendered instead when the photo isn't available (e.g. download failed at build). */
  fallback?: React.ReactNode;
};

/** Fills its (relatively positioned) parent with a cover-cropped site photo. */
export function SitePhoto({ photo, sizes, className = "", priority, fallback = null }: Props) {
  const p = getPhoto(photo);
  if (!p) return <>{fallback}</>;
  return <Image src={p.src} alt={p.alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />;
}
