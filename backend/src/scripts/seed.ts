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
import { DEFAULT_STUDY_SPOTS } from '../modules/spots/data/default-spots.data';
import { UserRole } from '../common/enums/roles.enum';

const SEED_SPOTS = DEFAULT_STUDY_SPOTS;

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
