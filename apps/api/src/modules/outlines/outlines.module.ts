import { Module } from '@nestjs/common';
import { OutlinesService } from './outlines.service';
import { OutlinesController } from './outlines.controller';

@Module({
  controllers: [OutlinesController],
  providers: [OutlinesService],
  exports: [OutlinesService],
})
export class OutlinesModule {}

