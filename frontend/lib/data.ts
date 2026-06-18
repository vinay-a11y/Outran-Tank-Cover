import { Droplet, Lock, Map, ShieldCheck, Sparkles, Truck, Undo2, UserRoundCheck } from "lucide-react";

export const asset = (name: string) => `/assets/${name}`;

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Build", href: "/products/terrain-core-tank-cover" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" }
];

export const productGallery = [
  asset("feature-quick-lock.png"),
  asset("feature-waterproof.png"),
  asset("feature-premium-craft.png"),
  asset("feature-terrain-fit.png")
];

export const productColors = [
  { name: "Stealth Black", value: "#090909", sku: "OTR-TC-H450-BLK" },
  { name: "Black / Orange Stitch", value: "#2B1A0F", sku: "OTR-TC-H450-ORG" },
  { name: "Trail Green", value: "#313926", sku: "OTR-TC-H450-GRN" }
];

export const products = [
  {
    id: "terrain-core-tank-cover",
    slug: "terrain-core-tank-cover",
    name: "Terrain Core Tank Cover",
    subtitle: "For Himalayan 450",
    price: 4999,
    compareAt: 5999,
    badge: "Founders Edition",
    rating: 4.9,
    reviews: 256,
    image: productGallery[0],
    gallery: productGallery,
    colors: productColors,
    color: productColors[0].name,
    material: "1000D Waterproof Fabric",
    category: "Tank Covers",
    description: "Waterproof four-point tank cover system made for Royal Enfield Himalayan 450. Locks tight, protects paint, and keeps essentials accessible on long rides."
  }
];

export const tankCoverProduct = products[0];

export const trustItems = [
  { icon: Droplet, title: "100% Waterproof", copy: "Rain-tested materials to keep your tank 100% dry." },
  { icon: Lock, title: "Zero Tank Wobble", copy: "4-point secure fit. Locked at any speed, on any terrain." },
  { icon: ShieldCheck, title: "Tough as Hell", copy: "Built with precision. Made for brutal Indian terrain." },
  { icon: Map, title: "Made for India", copy: "Designed, tested, and trusted by ADV riders across India." }
];

export const featureImages = [
  {
    title: "Quick lock buckles",
    copy: "Fast, secure hardware that stays locked through rough trails.",
    image: asset("feature-quick-lock.png"),
    fallback: asset("product-detail.jpeg")
  },
  {
    title: "100% waterproof fabric",
    copy: "Rain-tested textile and sealed protection for wet rides.",
    image: asset("feature-waterproof.png"),
    fallback: asset("cart-page.jpeg")
  },
  {
    title: "Premium craftsmanship",
    copy: "Tight stitching, rugged panels, and a precision tank fit.",
    image: asset("feature-premium-craft.png"),
    fallback: asset("success-page.jpeg")
  },
  {
    title: "Terrain ready fit",
    copy: "Made to sit low, stable, and ride-ready on Himalayan 450.",
    image: asset("feature-terrain-fit.png"),
    fallback: asset("checkout-page.jpeg")
  }
];

export const riderStories = [
  { title: "Mountain trail", image: asset("story-mountain-trail.png"), fallback: asset("checkout-page.jpeg") },
  { title: "Camp ready", image: asset("story-camp-ready.png"), fallback: asset("cart-page.jpeg") },
  { title: "Into the wild", image: asset("story-wild-ride.png"), fallback: asset("success-page.jpeg") },
  { title: "Golden hour", image: asset("story-golden-hour.png"), fallback: asset("image.png") },
  { title: "Rain tested", image: asset("story-rain-tested.png"), fallback: asset("product-detail.jpeg") },
  { title: "Rider proof", image: asset("story-rider-proof.png"), fallback: asset("hero-page.png") }
];

export const serviceItems = [
  { icon: Truck, title: "Free Shipping", copy: "On all prepaid orders" },
  { icon: Undo2, title: "Easy Returns", copy: "7-day hassle-free returns" },
  { icon: ShieldCheck, title: "1 Year Warranty", copy: "Built to last. Guaranteed." },
  { icon: UserRoundCheck, title: "Rider Support", copy: "We ride. We understand." }
];

export const specs = [
  ["Compatibility", "Royal Enfield Himalayan 450"],
  ["Material", "1000D waterproof fabric"],
  ["Fit Type", "4-point secure fit"],
  ["Access", "Fuel cap access without removing cover"],
  ["Warranty", "1 year manufacturer warranty"],
  ["Weight", "~450g"]
];

export const productFeatures = [
  ["100% Waterproof", "Rain-tested fabric, coated panels, and water-shedding construction."],
  ["Zero Tank Wobble", "Four anchor points keep the cover planted at highway speed."],
  ["Quick Install", "Quick lock buckles make mounting and removal simple."],
  ["Paint Protection", "Soft contact zones reduce scratches and tank scuffs."],
  ["Premium Build", "Reinforced stitching and tactical webbing for long-term use."],
  ["Easy Access", "Fuel-cap access without removing the cover."]
];

export const storyStats = [
  ["12+", "Months testing"],
  ["5000+", "KMS tested"],
  ["100+", "Rider feedback"],
  ["1 Goal", "Built for the ride beyond roads"]
];

export const checkoutSteps = ["Cart", "Shipping", "Payment", "Review"];

export const foundersBadge = { icon: Sparkles, label: "Founders Edition", sub: "First 100 units" };
