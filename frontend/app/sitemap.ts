import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://outran.in";
  return ["", "/products", "/products/terrain-core-tank-cover", "/cart", "/checkout", "/about", "/journal", "/contact", "/warranty", "/shipping", "/privacy", "/terms"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date()
  }));
}
