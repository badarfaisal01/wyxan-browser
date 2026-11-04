import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { SeedModule } from './seed/seed.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { SitesModule } from './modules/sites/sites.module';
import { SearchModule } from './modules/search/search.module';
import { PeopleModule } from './modules/people/people.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/wyxan',
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    SeedModule,
    NavigationModule,
    SitesModule,
    SearchModule,
    PeopleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

