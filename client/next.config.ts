import type { NextConfig } from "next";

function apiRemotePatternFromEnv():
  | { protocol: "http" | "https"; hostname: string; port?: string; pathname?: string }
  | null {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const protocol = u.protocol.replace(":", "") as "http" | "https";
    if (protocol !== "http" && protocol !== "https") return null;
    return {
      protocol,
      hostname: u.hostname,
      port: u.port || undefined,
      pathname: "/storage/**",
    };
  } catch {
    return null;
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["images.unsplash.com"],
    remotePatterns: apiRemotePatternFromEnv() ? [apiRemotePatternFromEnv()!] : [],
  },
};

export default nextConfig;
