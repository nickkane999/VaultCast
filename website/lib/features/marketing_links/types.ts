export interface MarketingQuery {
  id: string;
  query: string;
  product?: string;
  targetAudience?: string;
  platform?: string;
  budget?: string;
  experience?: string;
  createdAt: string;
}

export interface TrendKeyword {
  keyword: string;
  relatedQueries: string[];
  searchVolume: "Low" | "Medium" | "High" | "Very High";
  competition: "Low" | "Medium" | "High";
  trend: "Rising" | "Stable" | "Declining";
  googleTrendsUrl: string;
}

export interface AffiliateOpportunity {
  id: string;
  keyword: string;
  platform: string;
  productSuggestions: string[];
  affiliatePrograms: AffiliateProgram[];
  marketingAngle: string;
  estimatedRevenue: string;
}

export interface AffiliateProgram {
  name: string;
  commission: string;
  url: string;
  description: string;
  pros: string[];
  requirements: string[];
}

export interface MarketingAnalysis {
  id: string;
  query: string;
  keywords: TrendKeyword[];
  opportunities: AffiliateOpportunity[];
  competitorInsights: CompetitorInsight[];
  actionPlan: ActionItem[];
  estimatedTimeToProfit: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  createdAt: string;
}

export interface CompetitorInsight {
  keyword: string;
  topCompetitors: string[];
  gapOpportunities: string[];
  recommendedStrategy: string;
}

export interface ActionItem {
  step: number;
  title: string;
  description: string;
  timeEstimate: string;
  priority: "High" | "Medium" | "Low";
  resources: string[];
}

export interface MarketingLinksState {
  currentQuery: string;
  currentPlatform: string;
  currentTargetAudience: string;
  currentBudget: string;
  currentExperience: string;
  isAnalyzing: boolean;
  analyses: MarketingAnalysis[];
  savedQueries: MarketingQuery[];
  error: string | null;
  selectedAnalysis: string | null;
}

export interface AnalyzeMarketingRequest {
  query: string;
  targetAudience?: string;
  platform?: string;
  budget?: string;
  experience?: string;
}

export interface GoogleTrendsData {
  keyword: string;
  interest: number[];
  relatedTopics: string[];
  relatedQueries: string[];
  geoData: { [country: string]: number };
}
