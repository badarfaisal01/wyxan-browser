import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  NavigationDestination,
  NavigationStatus,
  NavigationTransitionSource,
} from '../../common/types/navigation.types';

export type VisitDocument = Visit & Document;

@Schema({ collection: 'visits', timestamps: false })
export class Visit {
  @Prop({ required: true, index: true })
  personId!: string;

  @Prop({ required: true, trim: true })
  address!: string;

  @Prop({ required: false })
  siteId?: string;

  @Prop({ type: Object, required: true })
  destination!: NavigationDestination;

  @Prop({
    required: true,
    enum: ['typed', 'link', 'back', 'forward', 'history', 'refresh'],
  })
  transition!: NavigationTransitionSource;

  @Prop({ required: true, enum: ['loaded', 'not-found', 'error'], default: 'loaded' })
  outcome!: NavigationStatus;

  @Prop({ default: Date.now, index: true })
  visitedAt!: Date;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);

// Compound index for fast chronological audit history queries per person
VisitSchema.index({ personId: 1, visitedAt: -1 });
