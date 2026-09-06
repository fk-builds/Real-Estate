import { serverConfig } from "@/lib/env";

/**
 * MEDIA ABSTRACTION
 * -----------------
 * `MediaService` owns how stored media becomes a usable URL (and where uploads
 * go). The UI never hard-codes a bucket/cloud name — it always asks this layer,
 * so the whole app can move Supabase Storage -> Cloudinary -> S3 by flipping
 * MEDIA_PROVIDER and registering an adapter, with no component rewrites.
 */
export interface MediaService {
  readonly provider: "supabase" | "cloudinary" | "s3";
  /** Absolute URL for a stored object reference. */
  getUrl(ref: string): string;
  /** Build a responsive-ish srcset from an object ref (provider-specific sizing). */
  srcset(ref: string, widths: number[]): string;
  /** Path within the provider for a logical media entity (folder convention). */
  folderPath(kind: MediaFolderKind, id: string, filename: string): string;
}

export type MediaFolderKind =
  | "listing"
  | "project"
  | "agent"
  | "floorplan"
  | "document"
  | "video"
  | "logo"
  | "banner";

const BUCKET = serverConfig.NEXT_PUBLIC_SUPABASE_BUCKET;

/** Supabase Storage: public bucket via the /storage/v1/object/public API. */
class SupabaseMediaService implements MediaService {
  readonly provider = "supabase" as const;
  private base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;
  getUrl(ref: string) {
    return ref.startsWith("http") ? ref : `${this.base}/${ref.replace(/^\//, "")}`;
  }
  srcset(ref: string, widths: number[]) {
    return widths.map((w) => `${this.getUrl(ref)}?width=${w} ${w}w`).join(", ");
  }
  folderPath(kind: MediaFolderKind, id: string, filename: string) {
    return `${kind}s/${id}/${filename}`;
  }
}

/** Cloudinary adapter — activate with MEDIA_PROVIDER=cloudinary. */
class CloudinaryMediaService implements MediaService {
  readonly provider = "cloudinary" as const;
  private cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
  getUrl(ref: string) {
    return `https://res.cloudinary.com/${this.cloud}/image/upload/${ref.replace(/^\//, "")}`;
  }
  srcset(ref: string, widths: number[]) {
    const clean = ref.replace(/^\//, "");
    return widths
      .map((w) => `https://res.cloudinary.com/${this.cloud}/image/upload/w_${w}/q_auto/${clean} ${w}w`)
      .join(", ");
  }
  folderPath(kind: MediaFolderKind, id: string, filename: string) {
    return `manzil/${kind}s/${id}/${filename}`;
  }
}

/** S3 adapter (via CloudFront/object URL) — activate with MEDIA_PROVIDER=s3. */
class S3MediaService implements MediaService {
  readonly provider = "s3" as const;
  private bucket = process.env.S3_BUCKET ?? "";
  private region = process.env.S3_REGION ?? "";
  getUrl(ref: string) {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${ref.replace(/^\//, "")}`;
  }
  srcset(ref: string, widths: number[]) {
    // real impl would transform via imgix/Thumbor or push resized objects.
    return widths.map((w) => `${this.getUrl(ref)} ${w}w`).join(", ");
  }
  folderPath(kind: MediaFolderKind, id: string, filename: string) {
    return `manzil/${kind}s/${id}/${filename}`;
  }
}

let instance: MediaService | null = null;

export function getMediaService(): MediaService {
  if (instance) return instance;
  switch (serverConfig.MEDIA_PROVIDER) {
    case "cloudinary":
      if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        return (instance = new CloudinaryMediaService());
      }
      break;
    case "s3":
      if (process.env.S3_BUCKET) return (instance = new S3MediaService());
      break;
  }
  return (instance = new SupabaseMediaService());
}
