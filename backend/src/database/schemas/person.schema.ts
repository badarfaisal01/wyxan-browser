import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PersonDocument = Person & Document;

@Schema({ collection: 'people', timestamps: { createdAt: true, updatedAt: false } })
export class Person {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
