export type SpotCategory =
  | 'cafe'
  | 'library'
  | 'university_campus'
  | 'coworking'
  | 'bookshop_cafe'
  | 'park_outdoor'
  | 'hotel_lobby'
  | 'community_center';

export type NoiseLevel = 'silent' | 'quiet' | 'moderate' | 'buzzing';
export type WifiSpeed = 'ultra_fast' | 'fast' | 'decent' | 'slow_none';
export type OutletDensity = 'abundant' | 'moderate' | 'scarce' | 'none';
export type SeatingComfort = 'ergonomic' | 'cozy_lounge' | 'communal' | 'standard';
export type PriceLevel = 'free' | '$' | '$$' | '$$$';

export interface DayHours {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface WeeklyHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface Spot {
  _id: string;
  name: string;
  slug: string;
  category: SpotCategory;
  address: string;
  city: string;
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  noiseLevel: NoiseLevel;
  wifiSpeed: WifiSpeed;
  wifiSpeedMbps: number;
  outletDensity: OutletDensity;
  seatingComfort: SeatingComfort;
  priceLevel: PriceLevel;
  hours?: WeeklyHours;
  amenities: string[];
  photos: string[];
  rating: number;
  reviewCount: number;
  checkInCount: number;
  savedCount: number;
  tags: string[];
  aiSummary: string;
  bestFor: string;
  insiderTip?: string;
  websiteUrl?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  spotId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  noiseReported: NoiseLevel;
  wifiReported: WifiSpeed;
  outletsReported: OutletDensity;
  content: string;
  proTip?: string;
  photos?: string[];
  helpfulCount: number;
  helpfulUserIds?: string[];
  createdAt: string;
}

export interface StudyPreferences {
  preferredNoiseLevels: NoiseLevel[];
  preferredCategories: SpotCategory[];
  minWifiSpeedMbps: number;
  requiresOutlets: boolean;
  favoriteDrink: string;
  studyPersona: string;
}

export interface CheckInRecord {
  spotId: string;
  spotName: string;
  visitedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'moderator';
  avatar?: string;
  studyPreferences: StudyPreferences;
  savedSpotIds?: string[];
  checkIns?: CheckInRecord[];
}

export interface StudyList {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic: boolean;
  spotIds: Spot[] | string[];
  createdAt: string;
}

export interface RecommendedSpotMatch {
  spotId?: string;
  name: string;
  category: string;
  matchReason: string;
  matchScore: number;
  bestFeatures: string[];
  recommendedStudyType: string;
  spot?: Spot;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  suggestedSpots?: RecommendedSpotMatch[];
  enrichedSpots?: RecommendedSpotMatch[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  meta?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}
