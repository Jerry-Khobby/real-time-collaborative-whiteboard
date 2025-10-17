//app.gateway.ts

import {
    MessageBody, OnGatewayConnection,
    OnGatewayDisconnect, SubscribeMessage,
    WebSocketGateway, WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";



@WebSocketGateway({
  cors:{
    origin:"*",
  }
})
export class AppGateway implements OnGatewayConnection,
    OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;
    //implement lifecycle hooks 
    afterInit(server:Server){
      console.log("WebSocket Gateway initialized");
    }

    handleConnection(client: Socket): void {
        this.server.emit('room', client.id + ' joined!')
    }

    handleDisconnect(client: Socket): void {
        this.server.emit('room', client.id + ' left!')
    }

    @SubscribeMessage('join-canvas')
    handleJoinCanvas(client: Socket, canvas: any): void {
      console.log(`A player just the game ${client.id}:${canvas}`)
        this.server.emit('room', `[${client.id}] -> ${canvas}`);
    }

        @SubscribeMessage('draw')
    handleDrawCanvas(client: Socket, canvas: any): void {
      console.log(`A player just the game ${client.id}:${canvas}`)
        this.server.emit('room', `[${client.id}] -> ${canvas}`);
    }

        @SubscribeMessage('clear')
    handleClearDrawCanvas(client: Socket, canvas: any): void {
      console.log(`A player just the game ${client.id}:${canvas}`)
        this.server.emit('room', `[${client.id}] -> ${canvas}`);
    }

        @SubscribeMessage('leave-canvas')
    handleLeaveCanvas(client: Socket, canvas: any): void {
      console.log(`A player just the game ${client.id}:${canvas}`)
        this.server.emit('room', `[${client.id}] -> ${canvas}`);
    }
    
}