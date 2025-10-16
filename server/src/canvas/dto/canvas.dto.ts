import { IsNotEmpty,IsString,IsArray, IsNumber,ValidateNested } from "class-validator";
import {Type} from 'class-transformer';




class PointDto{
  @IsNumber()
  x:number;

  @IsNumber()
  y:number;
}


class StrokeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PointDto)
  points: PointDto[];

  @IsString()
  color: string;

  @IsNumber()
  brushSize: number;
}


export class CanvasDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StrokeDto)
  drawingData: StrokeDto[];
}