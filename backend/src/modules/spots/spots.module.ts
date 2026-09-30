import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Spot, SpotSchema } from './schemas/spot.schema';
import { SpotsService } from './spots.service';
import { SpotsController } from './spots.controller';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Spot.name, schema: SpotSchema }]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [SpotsController],
  providers: [SpotsService],
  exports: [SpotsService, MongooseModule],
})
export class SpotsModule {}
