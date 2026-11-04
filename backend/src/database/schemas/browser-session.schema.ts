import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NavigationDestination, NavigationStatus } from '../../common/types/navigation.types';

export type BrowserSessionDocument = BrowserSession & Document;

@Schema({ _id: false })
export class NavigationEntrySubdocument {
  @Prop({ required: true })
  entryId!: string;

  @Prop({ type: Object, required: true })
  destination!: NavigationDestination;

  @Prop({ required: true, default: '' })
  title!: string;

  @Prop({ required: true, enum: ['loaded', 'not-found', 'error'], default: 'loaded' })
  status!: NavigationStatus;

  @Prop({ required: true, default: 0 })
  scrollPosition!: number;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const NavigationEntrySchema = SchemaFactory.createForClass(NavigationEntrySubdocument);

@Schema({ collection: 'browserSessions', timestamps: true })
export class BrowserSession {
  @Prop({ required: true, unique: true, index: true })
  personId!: string;

  @Prop({ type: [NavigationEntrySchema], default: [] })
  entries!: NavigationEntrySubdocument[];

  @Prop({ required: true, default: 0 })
  currentIndex!: number;

  @Prop({ required: true, default: 1 })
  version!: number;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const BrowserSessionSchema = SchemaFactory.createForClass(BrowserSession);
