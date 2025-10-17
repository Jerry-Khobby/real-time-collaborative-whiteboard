import { Injectable,Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Canvas } from "src/schemas/canvas.schema";
import { randomBytes } from "crypto";
import { encrypt,decrypt } from "src/encryption/encrypt";




class Point{
  x:number;
  y:number;
}

class Stroke{
  points:Point[];
  color:string;
  brushSize:number;
}

@Injectable()
export class CanvasService{
  private readonly logger = new Logger(CanvasService.name);
  constructor(@InjectModel(Canvas.name) private canvasModel:Model<Canvas>){}




  //I want to create a canvas 
  async createCanvas(name:string,drawingData:Stroke[]):Promise<{data:any}>{
  try{
    let canvasId:string;
    let exists = true;

    do{
      canvasId = randomBytes(4).toString("hex");
      const existing = await this.canvasModel.findOne({canvasId});
      if(!existing) exists=false;
    }while(exists);


// create and save new canvas 
const newCanvas = new this.canvasModel({
  canvasId,
  name,
  drawingData,
})
const savedCanvas = await newCanvas.save();
this.logger.log(`Canvas ${name} created successfully ${canvasId}`)
return {data:savedCanvas};
  }catch(err){
    this.logger.error("Error creating canvas",err);
    throw err;
  }
  }


// to grab a canvas by it id 
async getCanvasById(canvasId:string):Promise<{success:boolean;canvas:any}>{
  //search through the database for this partical canvasId 
  const canvas = await this.canvasModel.findOne({canvasId}).lean();
  if(!canvas){
    throw new NotFoundException(`Canvas of this id ${canvasId} not found`)
  }

  return {
    success:true,
          canvas: {
        canvasId: canvas.canvasId,
        name: canvas.name,
        drawingData: canvas.drawingData || [],
        createdAt: canvas.createdAt,
        updatedAt: canvas.updatedAt,
      },
  }

  //I want to return the canvas 

// 

}



  

}