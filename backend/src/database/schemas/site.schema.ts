import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SiteDocument = Site & Document;

@Schema({ collection: 'sites', timestamps: true })
export class Site {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  address!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true })
  html!: string;

  @Prop({ required: true })
  searchableText!: string;

  @Prop({ required: true, index: true })
  authorId!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const SiteSchema = SchemaFactory.createForClass(Site);

// Compound text index on title (weight 3) and searchableText (weight 1)
SiteSchema.index(
  { title: 'text', searchableText: 'text' },
  { weights: { title: 3, searchableText: 1 }, name: 'SiteTextIndex' },
);
