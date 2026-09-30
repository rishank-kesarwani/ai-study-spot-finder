import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudyList, StudyListSchema } from './schemas/study-list.schema';
import { SavedSpotsService } from './saved-spots.service';
import { SavedSpotsController } from './saved-spots.controller';
import { SpotsModule } from '../spots/spots.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudyList.name, schema: StudyListSchema },
    ]),
    SpotsModule,
    UsersModule,
  ],
  controllers: [SavedSpotsController],
  providers: [SavedSpotsService],
  exports: [SavedSpotsService],
})
export class SavedSpotsModule {}
