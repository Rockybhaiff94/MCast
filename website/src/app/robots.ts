import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/link/"],
      },
    ],
    sitemap: "https://mcast.fun/sitemap.xml",
  };
}

