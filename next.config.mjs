/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Serve modern AVIF/WebP whenever the client accepts them (the optimizer
    // re-encodes from the source); JPEG/PNG remains the fallback.
    formats: ["image/avif", "image/webp"],
    // When self-hosting uploaded media is enabled these remote patterns are
    // used. The same asset URLs are returned by the MediaService so swapping
    // Cloudinary/S3 later only changes URL shape here.
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
};

export default nextConfig;
