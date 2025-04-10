import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop()
  age: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Create text indexes for better search performance with regex queries
UserSchema.index({ name: 'text', email: 'text' });
