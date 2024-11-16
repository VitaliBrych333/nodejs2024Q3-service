import { Module } from '@nestjs/common';
import { TrackController } from './track.controller';
import { TrackService } from './track.servise';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
