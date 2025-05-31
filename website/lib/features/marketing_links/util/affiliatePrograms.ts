import { AffiliateProgram } from "../types";

export const POPULAR_AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  {
    name: "Amazon Associates",
    commission: "1-10%",
    url: "https://affiliate-program.amazon.com/",
    description: "The world's largest affiliate program with millions of products",
    pros: ["Huge product selection", "Trusted brand", "Easy integration"],
    requirements: ["Active website", "3 qualifying sales within 180 days"],
  },
  {
    name: "ShareASale",
    commission: "5-30%",
    url: "https://www.shareasale.com/",
    description: "Large network with thousands of merchants in various niches",
    pros: ["Wide variety of merchants", "Good tracking", "Regular payments"],
    requirements: ["Website review required", "Quality content"],
  },
  {
    name: "CJ Affiliate (Commission Junction)",
    commission: "2-50%",
    url: "https://www.cj.com/",
    description: "Premium affiliate network with top-tier brands",
    pros: ["High-quality brands", "Advanced tracking", "Good support"],
    requirements: ["Professional website", "Application review"],
  },
  {
    name: "ClickBank",
    commission: "10-75%",
    url: "https://www.clickbank.com/",
    description: "Digital product marketplace with high commissions",
    pros: ["High commission rates", "Digital products", "Instant approval"],
    requirements: ["Basic application", "Valid payment method"],
  },
  {
    name: "Impact Radius",
    commission: "5-40%",
    url: "https://impact.com/",
    description: "Technology-focused affiliate platform",
    pros: ["Advanced analytics", "Real-time tracking", "API access"],
    requirements: ["Website review", "Performance standards"],
  },
];

export const NICHE_PROGRAMS = {
  fitness: [
    {
      name: "Bodybuilding.com",
      commission: "5-15%",
      url: "https://www.bodybuilding.com/affiliates",
      description: "Leading fitness and supplement retailer",
      pros: ["Fitness expertise", "Wide product range", "Good conversion"],
      requirements: ["Fitness-related content", "Quality traffic"],
    },
  ],
  tech: [
    {
      name: "Best Buy Affiliate Program",
      commission: "1-4%",
      url: "https://www.bestbuy.com/site/affiliate-program/",
      description: "Electronics and technology retailer",
      pros: ["Trusted electronics brand", "Wide product selection"],
      requirements: ["Technology content", "Application review"],
    },
  ],
  fashion: [
    {
      name: "ASOS Affiliate Programme",
      commission: "3-7%",
      url: "https://www.asos.com/partner-with-us/",
      description: "Fashion retailer for young adults",
      pros: ["Trendy fashion", "Global shipping", "Good conversion"],
      requirements: ["Fashion/lifestyle content", "Quality audience"],
    },
  ],
};

export function getRelevantPrograms(keywords: string[], niche?: string): AffiliateProgram[] {
  const programs = [...POPULAR_AFFILIATE_PROGRAMS];

  if (niche && NICHE_PROGRAMS[niche as keyof typeof NICHE_PROGRAMS]) {
    programs.push(...NICHE_PROGRAMS[niche as keyof typeof NICHE_PROGRAMS]);
  }

  return programs.slice(0, 3);
}

export function generateAffiliateUrl(program: string, productId?: string): string {
  const baseUrls = {
    amazon: "https://www.amazon.com/dp/",
    shareasale: "https://www.shareasale.com/r.cfm?b=",
    cj: "https://www.anrdoezrs.net/links/",
    clickbank: "https://hop.clickbank.net/?affiliate=",
  };

  const programKey = program.toLowerCase().replace(/\s+/g, "");
  const baseUrl = baseUrls[programKey as keyof typeof baseUrls];

  if (baseUrl && productId) {
    return `${baseUrl}${productId}`;
  }

  return "#";
}

export const KEYWORD_TO_NICHE_MAP = {
  fitness: ["workout", "exercise", "gym", "protein", "supplement", "running", "yoga"],
  tech: ["laptop", "phone", "gadget", "software", "app", "device", "computer"],
  fashion: ["clothing", "shoes", "fashion", "style", "accessories", "jewelry"],
  home: ["kitchen", "furniture", "decor", "appliance", "garden", "tools"],
  beauty: ["skincare", "makeup", "beauty", "cosmetics", "hair", "wellness"],
  automotive: ["car", "auto", "vehicle", "motorcycle", "parts", "accessories"],
  travel: ["travel", "vacation", "hotel", "flight", "luggage", "booking"],
  education: ["course", "learning", "education", "training", "skill", "certification"],
};

export function detectNiche(query: string, keywords: string[]): string | undefined {
  const allText = `${query} ${keywords.join(" ")}`.toLowerCase();

  for (const [niche, terms] of Object.entries(KEYWORD_TO_NICHE_MAP)) {
    if (terms.some((term) => allText.includes(term))) {
      return niche;
    }
  }

  return undefined;
}
