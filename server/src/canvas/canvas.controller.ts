import { Body,Controller,Post } from "@nestjs/common";
import { CanvasService } from "./canvas.service";
import { CanvasDto } from "./dto/canvas.dto";


@Controller('canvas')
export class CanvasController {
  constructor(private readonly canvasService: CanvasService) {}

  @Post('create')
  async createCanvas(@Body() body: CanvasDto) {
    const { name, drawingData } = body;
    return this.canvasService.createCanvas(name, drawingData);
  }
}