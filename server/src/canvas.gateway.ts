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

    @SubscribeMessage('canvas')
    handleMessage(client: Socket, canvas: any): void {
      console.log(`Recieved a canvas change from ${client.id}:${canvas}`)
        this.server.emit('room', `[${client.id}] -> ${canvas}`);
    }
}