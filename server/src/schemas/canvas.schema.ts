import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define what a single point looks like
class Point {
  x: number;
  y: number;
}
class Stroke {
  points: Point[];
  color: string;  
  brushSize: number;
}

// Define what a canvas document looks like
@Schema()
export class Canvas extends Document {
  @Prop({ required: true, unique: true })
  canvasId: string;  // Like 'abc123'
  
  @Prop({ default: 'Untitled Canvas' })
  name: string;
  
  @Prop({ type: [Object], default: [] })
  drawingData: Stroke[];  // Array of strokes
  
  @Prop({ default: Date.now })
  createdAt: Date;
  
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CanvasSchema = SchemaFactory.createForClass(Canvas);