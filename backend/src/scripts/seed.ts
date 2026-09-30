import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Spot, SpotDocument } from '../modules/spots/schemas/spot.schema';
import { User, UserDocument } from '../modules/users/schemas/user.schema';
import { Review, ReviewDocument } from '../modules/reviews/schemas/review.schema';
import { StudyList, StudyListDocument } from '../modules/saved-spots/schemas/study-list.schema';
import {
  NoiseLevel,
  OutletDensity,
  PriceLevel,
  SeatingComfort,
  SpotCategory,
  WifiSpeed,
} from '../common/enums/spot.enum';
import { UserRole } from '../common/enums/roles.enum';

const SEED_SPOTS = [
  {
    name: 'The Rose Main Reading Room & Library',
    slug: 'the-rose-main-reading-room-and-library',
    category: SpotCategory.LIBRARY,
    address: '476 5th Ave, New York, NY 10018',
    city: 'New York',
    location: { type: 'Point', coordinates: [-73.9822, 40.7532] },
    noiseLevel: NoiseLevel.SILENT,
    wifiSpeed: WifiSpeed.FAST,
    wifiSpeedMbps: 120,
    outletDensity: OutletDensity.ABUNDANT,
    seatingComfort: SeatingComfort.ERGONOMIC,
    priceLevel: PriceLevel.FREE,
    rating: 4.9,
    reviewCount: 48,
    checkInCount: 1420,
    savedCount: 389,
    amenities: [
      'silent_zone',
      'natural_light',
      'wheelchair_accessible',
      'high_ceilings',
      'spacious_desks',
      'restrooms',
    ],
    photos: [
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['historic', 'silent', 'architectural', 'spacious', 'central'],
    aiSummary:
      'The crown jewel of silent academic focus. Towering 52-foot ceilings with arched windows flood the massive oak tables with diffused natural sunlight. Zero phone conversations permitted.',
    bestFor: 'Master’s Thesis, Bar Exam Cramming, Deep Literature Reading',
    insiderTip: 'Arrive before 10:30 AM to snag the south-facing tables near the center chandeliers with dual power strips.',
    websiteUrl: 'https://nypl.org/locations/schwarzman',
    phone: '+1 917-275-6975',
  },
  {
    name: 'Atelier Artisan Roasters & Workspace',
    slug: 'atelier-artisan-roasters-and-workspace',
    category: SpotCategory.CAFE,
    address: '142 Bedford Ave, Brooklyn, NY 11249',
    city: 'Brooklyn',
    location: { type: 'Point', coordinates: [-73.9575, 40.7188] },
    noiseLevel: NoiseLevel.QUIET,
    wifiSpeed: WifiSpeed.ULTRA_FAST,
    wifiSpeedMbps: 185,
    outletDensity: OutletDensity.ABUNDANT,
    seatingComfort: SeatingComfort.ERGONOMIC,
    priceLevel: PriceLevel.MODERATE,
    rating: 4.8,
    reviewCount: 34,
    checkInCount: 890,
    savedCount: 245,
    amenities: [
      'fiber_wifi',
      'power_strips',
      'specialty_coffee',
      'standing_counters',
      'outdoor_patio',
      'pet_friendly',
    ],
    photos: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['coffee', 'ergonomic', 'fast-wifi', 'bright', 'laptop-friendly'],
    aiSummary:
      'Purpose-built for remote developers and creators. Houses a custom 16-seat standing workstation bar alongside cozy booth seating and direct trade pour-over stations.',
    bestFor: 'Full-Stack Coding Sprints, Product Strategy, Creative Writing',
    insiderTip: 'Their cold brew is steeped for 24 hours. The back patio is heated in autumn and has surprisingly strong WiFi.',
  },
  {
    name: 'Glasshouse Botanical Atrium & Study Lounge',
    slug: 'glasshouse-botanical-atrium-and-study-lounge',
    category: SpotCategory.PARK_OUTDOOR,
    address: '990 Washington Ave, Brooklyn, NY 11225',
    city: 'Brooklyn',
    location: { type: 'Point', coordinates: [-73.9632, 40.6675] },
    noiseLevel: NoiseLevel.MODERATE,
    wifiSpeed: WifiSpeed.FAST,
    wifiSpeedMbps: 95,
    outletDensity: OutletDensity.MODERATE,
    seatingComfort: SeatingComfort.COZY_LOUNGE,
    priceLevel: PriceLevel.FREE,
    rating: 4.7,
    reviewCount: 29,
    checkInCount: 620,
    savedCount: 310,
    amenities: [
      'lush_greenery',
      'water_fountain',
      'natural_sunlight',
      'plush_armchairs',
      'tea_kiosk',
    ],
    photos: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['nature', 'plants', 'relaxing', 'calm', 'sunlit'],
    aiSummary:
      'A verdant conservatory enclosed in high glass walls filled with tropical ferns and calming stone water features. Perfect for low-stress reading and creative brainstorming.',
    bestFor: 'Philosophy & Psychology Reading, Concept Ideation, Low-Stress Review',
    insiderTip: 'Sit near the center koi pond benches where the ambient trickling water acts as natural white noise.',
  },
  {
    name: '24/7 Hacker Hub & Quantum Coworking',
    slug: '24-7-hacker-hub-and-quantum-coworking',
    category: SpotCategory.COWORKING,
    address: '250 Broadway, New York, NY 10007',
    city: 'New York',
    location: { type: 'Point', coordinates: [-74.0084, 40.7135] },
    noiseLevel: NoiseLevel.QUIET,
    wifiSpeed: WifiSpeed.ULTRA_FAST,
    wifiSpeedMbps: 500,
    outletDensity: OutletDensity.ABUNDANT,
    seatingComfort: SeatingComfort.ERGONOMIC,
    priceLevel: PriceLevel.PREMIUM,
    rating: 4.9,
    reviewCount: 52,
    checkInCount: 2150,
    savedCount: 420,
    amenities: [
      '24_7_access',
      'gigabit_fiber',
      'dual_monitors',
      'herman_miller_chairs',
      'phone_booths',
      'free_espresso',
      'snack_bar',
    ],
    photos: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['coworking', '24-7', 'tech', 'gigabit', 'ergonomic'],
    aiSummary:
      'The ultimate round-the-clock sanctuary for developers, quantitative researchers, and startups. Features Herman Miller Embody chairs, 4K USB-C monitors at every desk, and micro-kitchens.',
    bestFor: 'Night Owl Coding Marathons, Kaggle Competitions, System Architecture',
    insiderTip: 'Desks in Zone B (East Wing) feature soundproof divider screens and private task lighting with dimmers.',
  },
  {
    name: 'Old Heritage Bookshop & Tea Vault',
    slug: 'old-heritage-bookshop-and-tea-vault',
    category: SpotCategory.BOOKSHOP_CAFE,
    address: '828 Broadway, New York, NY 10003',
    city: 'New York',
    location: { type: 'Point', coordinates: [-73.9908, 40.7323] },
    noiseLevel: NoiseLevel.SILENT,
    wifiSpeed: WifiSpeed.DECENT,
    wifiSpeedMbps: 45,
    outletDensity: OutletDensity.MODERATE,
    seatingComfort: SeatingComfort.COZY_LOUNGE,
    priceLevel: PriceLevel.AFFORDABLE,
    rating: 4.7,
    reviewCount: 41,
    checkInCount: 780,
    savedCount: 290,
    amenities: [
      'antique_leather_chairs',
      'curated_tea_selection',
      'vintage_books',
      'quiet_corners',
    ],
    photos: [
      'https://images.unsplash.com/photo-1507842229451-9f232615e324?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['bookstore', 'vintage', 'tea', 'cozy', 'silent'],
    aiSummary:
      'Warm mahogany bookshelves spanning 3 floors. Hidden mezzanine alcoves with antique armchairs, warm brass lamps, and an artisanal loose-leaf tea bar serving over 40 blends.',
    bestFor: 'Literature Review, Historical Research, Journaling',
    insiderTip: 'Head straight to the 3rd-floor rare books nook for the quietest corner and soft amber lighting.',
  },
  {
    name: 'Luminary Media Lab & University Campus Hub',
    slug: 'luminary-media-lab-and-university-campus-hub',
    category: SpotCategory.UNIVERSITY_CAMPUS,
    address: '70 Washington Square S, New York, NY 10012',
    city: 'New York',
    location: { type: 'Point', coordinates: [-73.9972, 40.7295] },
    noiseLevel: NoiseLevel.QUIET,
    wifiSpeed: WifiSpeed.ULTRA_FAST,
    wifiSpeedMbps: 350,
    outletDensity: OutletDensity.ABUNDANT,
    seatingComfort: SeatingComfort.ERGONOMIC,
    priceLevel: PriceLevel.FREE,
    rating: 4.8,
    reviewCount: 38,
    checkInCount: 1650,
    savedCount: 340,
    amenities: [
      'campus_wifi',
      'soundproof_booths',
      'whiteboards',
      'large_monitors',
      'group_study_rooms',
    ],
    photos: [
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['university', 'collaborative', 'whiteboards', 'fast-wifi', 'campus'],
    aiSummary:
      'State-of-the-art campus learning commons with floor-to-ceiling magnetic whiteboards, acoustic isolation study pods, and high-speed academic network connectivity.',
    bestFor: 'Math Problem Sets, Group Capstone Projects, Whiteboarding Algorithms',
    insiderTip: 'Level 4 has 8 individual acoustic study pods with magnetic boards and HDMI displays bookable via the touch screen.',
  },
  {
    name: 'Midnight Oil 24-Hour Study Cafe',
    slug: 'midnight-oil-24-hour-study-cafe',
    category: SpotCategory.CAFE,
    address: '38 W 8th St, New York, NY 10011',
    city: 'New York',
    location: { type: 'Point', coordinates: [-73.9985, 40.7328] },
    noiseLevel: NoiseLevel.MODERATE,
    wifiSpeed: WifiSpeed.FAST,
    wifiSpeedMbps: 110,
    outletDensity: OutletDensity.ABUNDANT,
    seatingComfort: SeatingComfort.STANDARD,
    priceLevel: PriceLevel.AFFORDABLE,
    rating: 4.6,
    reviewCount: 65,
    checkInCount: 1980,
    savedCount: 450,
    amenities: [
      'open_24_hours',
      'night_menu',
      'bistro_tables',
      'power_strips',
      'matcha_bar',
    ],
    photos: [
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['24-hours', 'late-night', 'coffee', 'cramming', 'central'],
    aiSummary:
      'The legendary late-night haven for students and nocturnal creators. Serves matcha lattes, pour-overs, and warm savory snacks all through the night with lo-fi study beats playing softly.',
    bestFor: 'Overnight Cramming, Midterm Prep, Late-Night Brainstorming',
    insiderTip: 'Try the Kyoto Iced Drip Coffee after midnight; power strips run along the perimeter banquette seating.',
  },
  {
    name: 'Skyline Vista High-Floor Public Terrace',
    slug: 'skyline-vista-high-floor-public-terrace',
    category: SpotCategory.COMMUNITY_CENTER,
    address: '180 Maiden Ln, New York, NY 10038',
    city: 'New York',
    location: { type: 'Point', coordinates: [-74.0051, 40.7061] },
    noiseLevel: NoiseLevel.QUIET,
    wifiSpeed: WifiSpeed.FAST,
    wifiSpeedMbps: 130,
    outletDensity: OutletDensity.MODERATE,
    seatingComfort: SeatingComfort.COMMUNAL,
    priceLevel: PriceLevel.FREE,
    rating: 4.8,
    reviewCount: 22,
    checkInCount: 540,
    savedCount: 280,
    amenities: [
      'panoramic_views',
      'indoor_glass_atrium',
      'free_public_access',
      'clean_restrooms',
      'natural_light',
    ],
    photos: [
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['skyline', 'views', 'modern', 'free', 'bright'],
    aiSummary:
      'Enclosed multi-story glass public atrium overlooking the East River. Abundant sunlight, marble seating steps with wooden desk inserts, and quiet ambient sound levels.',
    bestFor: 'Reading, Essay Drafting, Inspiring Work Breaks',
    insiderTip: 'The upper mezzanine steps offer unobstructed harbor views and direct access to floor electrical pop-ups.',
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const spotModel = app.get<Model<SpotDocument>>(getModelToken(Spot.name));
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const reviewModel = app.get<Model<ReviewDocument>>(getModelToken(Review.name));
  const listModel = app.get<Model<StudyListDocument>>(getModelToken(StudyList.name));

  console.log('🌱 Starting database seeding for AI Study Spot Finder...');

  // 1. Clear existing seed data if needed
  await spotModel.deleteMany({});
  await userModel.deleteMany({});
  await reviewModel.deleteMany({});
  await listModel.deleteMany({});
  console.log('🧹 Cleaned existing collections.');

  // 2. Create demo user and admin accounts
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', salt);
  const demoPasswordHash = await bcrypt.hash('DemoPassword123!', salt);

  const adminUser = await userModel.create({
    name: 'Rishank Kesarwani (Admin)',
    email: 'admin@studyspot.ai',
    passwordHash: adminPasswordHash,
    role: UserRole.ADMIN,
    studyPreferences: {
      preferredNoiseLevels: [NoiseLevel.SILENT, NoiseLevel.QUIET],
      preferredCategories: [SpotCategory.LIBRARY, SpotCategory.COWORKING],
      minWifiSpeedMbps: 100,
      requiresOutlets: true,
      favoriteDrink: 'Cortado & Matcha',
      studyPersona: 'AI Architect & Researcher',
    },
  });

  const demoUser = await userModel.create({
    name: 'Maya Lin',
    email: 'scholar@studyspot.ai',
    passwordHash: demoPasswordHash,
    role: UserRole.USER,
    studyPreferences: {
      preferredNoiseLevels: [NoiseLevel.QUIET, NoiseLevel.MODERATE],
      preferredCategories: [SpotCategory.CAFE, SpotCategory.LIBRARY],
      minWifiSpeedMbps: 60,
      requiresOutlets: true,
      favoriteDrink: 'Oat Milk Flat White',
      studyPersona: 'Deep Work Scholar',
    },
  });

  console.log('👤 Created Admin & Demo users:');
  console.log('   - admin@studyspot.ai (AdminPassword123!)');
  console.log('   - scholar@studyspot.ai (DemoPassword123!)');

  // 3. Insert Study Spots
  const createdSpots = await spotModel.insertMany(SEED_SPOTS);
  console.log(`📍 Created ${createdSpots.length} curated study spots.`);

  // 4. Create sample authentic reviews
  const spot1 = createdSpots[0];
  const spot2 = createdSpots[1];

  await reviewModel.create([
    {
      spotId: spot1._id,
      userId: demoUser._id,
      userName: demoUser.name,
      rating: 5,
      noiseReported: NoiseLevel.SILENT,
      wifiReported: WifiSpeed.FAST,
      outletsReported: OutletDensity.ABUNDANT,
      content:
        'Unbelievable atmosphere for writing my dissertation. The silent policy is strictly observed, and the natural lighting through the arched windows makes 6-hour sessions feel effortless.',
      proTip: 'Bring light layers as the air conditioning can be quite crisp near the north windows.',
      helpfulCount: 14,
    },
    {
      spotId: spot2._id,
      userId: adminUser._id,
      userName: adminUser.name,
      rating: 5,
      noiseReported: NoiseLevel.QUIET,
      wifiReported: WifiSpeed.ULTRA_FAST,
      outletsReported: OutletDensity.ABUNDANT,
      content:
        'Clocked 185 Mbps on their WiFi while syncing huge Docker containers. Ergonomic standing bar in the back has power strips every 2 feet. Best specialty espresso in Brooklyn.',
      proTip: 'The oat flat white and almond croissant combo is unmatched.',
      helpfulCount: 8,
    },
  ]);

  // 5. Create default custom study list
  await listModel.create({
    userId: demoUser._id,
    title: 'Thesis Deep Work Sprints 📚',
    description: 'High-focus silent spots with great lighting and dependable power.',
    icon: '🎯',
    color: '#8b5cf6',
    isPublic: true,
    spotIds: [spot1._id, spot2._id],
  });

  // 6. Link saved spots to demo user
  demoUser.savedSpotIds = [spot1._id.toString(), spot2._id.toString()];
  await demoUser.save();

  console.log('✅ Seeding completed successfully!');
  await app.close();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
