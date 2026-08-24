import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils";

// Sitemap estático (Fase 1). En fases posteriores se agregarán
// las fichas de producto desde la DB.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/tienda`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
