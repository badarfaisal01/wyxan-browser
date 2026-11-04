import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Person, PersonSchema } from './schemas/person.schema';
import { Site, SiteSchema } from './schemas/site.schema';
import { BrowserSession, BrowserSessionSchema } from './schemas/browser-session.schema';
import { Visit, VisitSchema } from './schemas/visit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Person.name, schema: PersonSchema },
      { name: Site.name, schema: SiteSchema },
      { name: BrowserSession.name, schema: BrowserSessionSchema },
      { name: Visit.name, schema: VisitSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
