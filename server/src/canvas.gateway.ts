import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CanvasService } from "./canvas/canvas.service";
import { Logger } from "@nestjs/common";

interface ConnectedUser {
  id: string;
  canvasId: string;
}

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AppGateway.name);

  // ✅ Using Map of Maps to avoid duplicates
  private connectedUsers: Map<string, Map<string, ConnectedUser>> = new Map();

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
    this.removeUserFromAllCanvases(client.id);
  }

  // ✅ Get all users in a given canvas
  private getUsersInCanvas(canvasId: string): ConnectedUser[] {
    const userMap = this.connectedUsers.get(canvasId);
    return userMap ? Array.from(userMap.values()) : [];
  }

  // ✅ Add user uniquely to a canvas
  private addUserToCanvas(canvasId: string, client: Socket): void {
    if (!this.connectedUsers.has(canvasId)) {
      this.connectedUsers.set(canvasId, new Map());
    }

    const userMap = this.connectedUsers.get(canvasId)!;
    userMap.set(client.id, { id: client.id, canvasId }); // Automatically replaces if duplicate
  }

  // ✅ Remove user from all canvases
  private removeUserFromAllCanvases(userId: string): void {
    for (const [canvasId, userMap] of this.connectedUsers.entries()) {
      if (userMap.has(userId)) {
        userMap.delete(userId);
        this.server.to(canvasId).emit("user-left", {
          userId,
          canvasId,
          users: Array.from(userMap.values()),
          message: `User left the canvas`,
        });
      }
    }
  }

  // ✅ Remove user from a specific canvas
  private removeUserFromCanvas(canvasId: string, userId: string): ConnectedUser[] {
    const userMap = this.connectedUsers.get(canvasId);
    if (userMap) {
      userMap.delete(userId);
      return Array.from(userMap.values());
    }
    return [];
  }

  @SubscribeMessage("join-canvas")
  async handleJoinCanvas(client: Socket, data: any): Promise<void> {
    try {
      const { canvasId } = data;
      const canvasExists = await this.canvasService.canvasExists(canvasId);

      if (!canvasExists) {
        client.emit("error", `Canvas with id ${canvasId} does not exist`);
        return;
      }

      // Remove from any previous canvas before joining new one
      this.removeUserFromAllCanvases(client.id);

      await client.join(canvasId);
      this.addUserToCanvas(canvasId, client);

      const currentUsers = this.getUsersInCanvas(canvasId);
      this.logger.log(`User ${client.id} joined canvas: ${canvasId}`);

      client.emit("joined-canvas", {
        success: true,
        canvasId,
        users: currentUsers,
        message: `Successfully joined canvas ${canvasId}`,
      });

      client.to(canvasId).emit("user-joined", {
        userId: client.id,
        canvasId,
        users: currentUsers,
        message: `New user joined the canvas`,
      });
    } catch (error) {
      this.logger.error("Error joining canvas:", error);
      client.emit("error", "Failed to join canvas");
    }
  }

  @SubscribeMessage("draw")
  async handleDraw(client: Socket, data: any): Promise<void> {
    try {
      const { points, color, brushSize, strokeId } = data;
      const rooms = Array.from(client.rooms);
      const canvasRoom = rooms.find((room) => room !== client.id);

      if (!canvasRoom) {
        client.emit("error", "You must join a canvas before drawing");
        return;
      }

      client.to(canvasRoom).emit("drawing-data", {
        points,
        color,
        brushSize,
        strokeId,
        userId: client.id,
      });

      this.logger.log(`User ${client.id} drew in canvas: ${canvasRoom}`);
    } catch (error) {
      this.logger.error("Error handling draw:", error);
      client.emit("error", "Failed to process drawing");
    }
  }

  @SubscribeMessage("clear")
  async handleClearDrawCanvas(client: Socket, data: any): Promise<void> {
    try {
      const rooms = Array.from(client.rooms);
      const canvasRoom = rooms.find((room) => room !== client.id);

      if (!canvasRoom) {
        client.emit("error", "You must join a canvas before clearing");
        return;
      }

      this.server.to(canvasRoom).emit("canvas-cleared", {
        clearedBy: client.id,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`User ${client.id} cleared canvas: ${canvasRoom}`);
    } catch (error) {
      this.logger.error("Error clearing canvas:", error);
      client.emit("error", "Failed to clear canvas");
    }
  }

  @SubscribeMessage("leave-canvas")
  async handleLeaveCanvas(client: Socket, data: any): Promise<void> {
    try {
      const rooms = Array.from(client.rooms);
      const canvasRoom = rooms.find((room) => room !== client.id);

      if (canvasRoom) {
        const updatedUsers = this.removeUserFromCanvas(canvasRoom, client.id);
        await client.leave(canvasRoom);

        client.to(canvasRoom).emit("user-left", {
          userId: client.id,
          canvasId: canvasRoom,
          users: updatedUsers,
          message: `User left the canvas`,
        });

        this.logger.log(`User ${client.id} left canvas: ${canvasRoom}`);
      }

      client.emit("left-canvas", {
        success: true,
        message: "Successfully left canvas",
      });
    } catch (error) {
      this.logger.error("Error leaving canvas:", error);
      client.emit("error", "Failed to leave canvas");
    }
  }
}
