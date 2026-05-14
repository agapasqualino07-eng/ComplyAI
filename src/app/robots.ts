import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard/", "/onboarding/", "/account/"] },
    ],
    sitemap: "https://aicomplyonline.it/sitemap.xml",
  };
}
