export interface AnalysisCategory {
  id: string;
  name: string;
  description: string;
  prompts: string[];
}

export interface ImageAnalysisRequest {
  imageData: string; // base64 encoded image
  category: string;
  customPrompt?: string;
}

export interface ImageAnalysisResult {
  id: string;
  imageData: string;
  category: string;
  prompt: string;
  result: string;
  confidence?: number;
  timestamp: string;
  metadata?: {
    imageSize?: string;
    imageType?: string;
    processingTime?: number;
  };
}

export interface ImageAnalyzerState {
  currentImage: string | null;
  selectedCategory: string;
  customPrompt: string;
  analysisResults: ImageAnalysisResult[];
  isAnalyzing: boolean;
  error: string | null;
  categories: AnalysisCategory[];
}

export const DEFAULT_CATEGORIES: AnalysisCategory[] = [
  {
    id: "animals",
    name: "Animals & Pets",
    description: "Identify animal breeds, species, and characteristics",
    prompts: ["What type of animal is this and what breed?", "Describe the animal's characteristics and behavior", "Is this animal healthy? What can you tell about its condition?", "What is the estimated age of this animal?"],
  },
  {
    id: "celebrities",
    name: "Film/TV Stars",
    description: "Identify actors, celebrities, and public figures",
    prompts: ["Who is this person? Provide their name and notable works.", "What movies or TV shows is this person known for?", "When was this photo likely taken based on their appearance?", "What character might they be portraying in this image?"],
  },
  {
    id: "movies_tv",
    name: "Movies & TV Shows",
    description: "Identify scenes, shows, and movie content",
    prompts: ["What movie or TV show is this from?", "Describe the scene and its context in the story", "What genre is this content and when was it made?", "Who are the main characters visible in this scene?"],
  },
  {
    id: "objects",
    name: "Objects & Items",
    description: "Identify and analyze objects, products, and items",
    prompts: ["What is this object and what is it used for?", "What brand or model is this item?", "Estimate the value or age of this object", "What materials is this made from?"],
  },
  {
    id: "locations",
    name: "Places & Locations",
    description: "Identify landmarks, cities, and geographical locations",
    prompts: ["Where is this location? Be as specific as possible.", "What is the historical or cultural significance of this place?", "What time period does this architecture suggest?", "What activities typically happen at this location?"],
  },
  {
    id: "food",
    name: "Food & Cuisine",
    description: "Identify dishes, ingredients, and culinary items",
    prompts: ["What dish is this and what cuisine is it from?", "What are the main ingredients in this food?", "How is this dish typically prepared?", "What is the estimated nutritional value?"],
  },
  {
    id: "art",
    name: "Art & Design",
    description: "Analyze artwork, design, and creative content",
    prompts: ["What art style or movement does this represent?", "Who might be the artist or what period is this from?", "Describe the techniques and materials used", "What is the cultural or historical context?"],
  },
  {
    id: "general",
    name: "General Analysis",
    description: "Open-ended analysis for any type of image",
    prompts: ["Describe everything you see in this image in detail", "What is the main subject and context of this image?", "What emotions or mood does this image convey?", "What questions would you ask about this image?"],
  },
];
