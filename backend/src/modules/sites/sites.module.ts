import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { HtmlSanitizerService } from './security/html-sanitizer.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SitesController],
  providers: [SitesService, HtmlSanitizerService],
  exports: [SitesService, HtmlSanitizerService],
})
export class SitesModule {}
