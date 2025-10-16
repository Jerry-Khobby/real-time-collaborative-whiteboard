import { Module } from "@nestjs/common";
import { CanvasController } from "./canvas.controller";
import { CanvasService } from "./canvas.service";
import { CanvasSchema,Canvas } from "src/schemas/canvas.schema";
import { MongooseModule } from "@nestjs/mongoose";







@Module({
  imports:[
    MongooseModule.forFeature([{name:Canvas.name,schema:CanvasSchema}])
  ],
  providers:[
    CanvasService
  ],
  controllers:[
    CanvasController,
  ]
})

export class CanvasModule{};