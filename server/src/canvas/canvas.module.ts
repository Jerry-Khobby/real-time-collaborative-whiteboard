// canvas.module.ts
import { Module } from "@nestjs/common";
import { CanvasController } from "./canvas.controller"; // Make sure this exists
import { CanvasService } from "./canvas.service";
import { CanvasSchema, Canvas } from "src/schemas/canvas.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { AppGateway } from "src/canvas.gateway";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Canvas.name, schema: CanvasSchema }])
  ],
  controllers: [CanvasController], // Add controller here
  providers: [CanvasService, AppGateway],
  exports: [CanvasService] // Export service if other modules need it
})
export class CanvasModule {}