export enum SpotCategory {
  CAFE = 'cafe',
  LIBRARY = 'library',
  UNIVERSITY_CAMPUS = 'university_campus',
  COWORKING = 'coworking',
  BOOKSHOP_CAFE = 'bookshop_cafe',
  PARK_OUTDOOR = 'park_outdoor',
  HOTEL_LOBBY = 'hotel_lobby',
  COMMUNITY_CENTER = 'community_center',
}

export enum NoiseLevel {
  SILENT = 'silent',          // Silent study, zero talking
  QUIET = 'quiet',            // Muffled whispers, light typing
  MODERATE = 'moderate',      // Soft background chatter, low acoustic music
  BUZZING = 'buzzing',        // Energetic, cafe background bustle
}

export enum WifiSpeed {
  ULTRA_FAST = 'ultra_fast',  // > 100 Mbps, video calls & huge downloads
  FAST = 'fast',              // 30 - 100 Mbps, smooth browsing & streaming
  DECENT = 'decent',          // 10 - 30 Mbps, general research & docs
  SLOW_NONE = 'slow_none',    // < 10 Mbps or offline focus only
}

export enum OutletDensity {
  ABUNDANT = 'abundant',      // Every table has multiple power outlets
  MODERATE = 'moderate',      // Accessible near wall tables & booths
  SCARCE = 'scarce',          // Only 1 or 2 outlets in the whole venue
  NONE = 'none',              // Battery power required
}

export enum SeatingComfort {
  ERGONOMIC = 'ergonomic',    // Herman Miller / office chairs, wide desks
  COZY_LOUNGE = 'cozy_lounge',// Plush armchairs, sofas, low coffee tables
  COMMUNAL = 'communal',      // Long wooden shared workbenches
  STANDARD = 'standard',      // Classic bistro chairs & tables
}

export enum PriceLevel {
  FREE = 'free',              // Libraries, public campus spots, parks
  AFFORDABLE = '$',           // < $5 filter coffee / tea
  MODERATE = '$$',            // $5 - $10 specialty brew / pastry
  PREMIUM = '$$$',            // Hourly day pass / high-end coworking
}
