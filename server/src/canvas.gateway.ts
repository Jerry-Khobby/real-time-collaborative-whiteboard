//app.gateway.ts

import {
    MessageBody, OnGatewayConnection,
    OnGatewayDisconnect, SubscribeMessage,
    WebSocketGateway, WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {CanvasService} from "./canvas/canvas.service";
import { Logger } from "@nestjs/common";



@WebSocketGateway({
  cors: {
    origin: "*",
  }
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AppGateway.name);
  
  constructor(private readonly canvasService: CanvasService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log("WebSocket Gateway initialized");
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-canvas')
  async handleJoinCanvas(client: Socket, data: any): Promise<void> {
    try {
      const { canvasId } = data;
      const canvasExists = await this.canvasService.canvasExists(canvasId);
      
      if (!canvasExists) {
        client.emit('error', `Canvas with id ${canvasId} does not exist`);
        return;
      }
      
      await client.join(canvasId);
      this.logger.log(`User ${client.id} joined canvas: ${canvasId}`);

      client.emit('joined-canvas', {
        success: true,
        canvasId: canvasId,
        message: `Successfully joined canvas ${canvasId}`
      });

      client.to(canvasId).emit('user-joined', {
        userId: client.id,
        canvasId: canvasId,
        message: `New user joined the canvas`
      });

    } catch (error) {
      this.logger.error('Error joining canvas:', error);
      client.emit('error', 'Failed to join canvas');
    }
  }

  @SubscribeMessage('draw')
  async handleDraw(client: Socket, data: any): Promise<void> {
    try {
      const { points, color, brushSize, strokeId } = data;
      const rooms = Array.from(client.rooms);
      const canvasRoom = rooms.find(room => room !== client.id);
      
      if (!canvasRoom) {
        client.emit('error', 'You must join a canvas before drawing');
        return;
      }

      client.to(canvasRoom).emit('drawing-data', {
        points: points,
        color: color,
        brushSize: brushSize,
        strokeId: strokeId,
        userId: client.id
      });

      this.logger.log(`User ${client.id} drew in canvas: ${canvasRoom}`);

    } catch (error) {
      this.logger.error('Error handling draw:', error);
      client.emit('error', 'Failed to process drawing');
    }
  }

  @SubscribeMessage('clear')
  async handleClearDrawCanvas(client: Socket, data: any): Promise<void> {
    try {
      const rooms = Array.from(client.rooms);
      const canvasRoom = rooms.find(room => room !== client.id);
      
      if (!canvasRoom) {
        client.emit('error', 'You must join a canvas before clearing');
        return;
      }

      // Broadcast to everyone in the room INCLUDING the sender
      this.server.to(canvasRoom).emit('canvas-cleared', {
        clearedBy: client.id,
        timestamp: new Date().toISOString()
      });

      this.logger.log(`User ${client.id} cleared canvas: ${canvasRoom}`);

    } catch (error) {
      this.logger.error('Error clearing canvas:', error);
      client.emit('error', 'Failed to clear canvas');
    }
  }

  @SubscribeMessage('leave-canvas')
  async handleLeaveCanvas(client: Socket, data: any): Promise<void> {
    try {
      const rooms = Array.from(client.rooms);
      const canvasRoom = rooms.find(room => room !== client.id);
      
      if (canvasRoom) {
        await client.leave(canvasRoom);
        
        client.to(canvasRoom).emit('user-left', {
          userId: client.id,
          canvasId: canvasRoom,
          message: `User left the canvas`
        });

        this.logger.log(`User ${client.id} left canvas: ${canvasRoom}`);
      }

      client.emit('left-canvas', {
        success: true,
        message: 'Successfully left canvas'
      });

    } catch (error) {
      this.logger.error('Error leaving canvas:', error);
      client.emit('error', 'Failed to leave canvas');
    }
  }
}