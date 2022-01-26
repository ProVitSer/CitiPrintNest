import { Injectable } from '@nestjs/common';
import * as net from 'net';
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, 
    SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class NetServerService implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    
    @WebSocketServer()
    server: Server;

    private initListenTCP() {
        console.log('wss initialized');
        const clientTcp = net.createServer((connection) => {
            connection.on('data', (data) => {
                console.log(data)
            })
        }).listen(9989);
        console.log(clientTcp);
        // clientTcp.on('connect', () => {
        //     console.log('connect')
        // });

        // clientTcp.on('error', function (error) {
        //     console.log(error);
        // });
      
        // clientTcp.on('close', function (error) {
        //     console.log('Connection closed!', error);
        // });

        // clientTcp.on('data', (data) => {
        //     console.log('message was received', data);
        // });
    }

    public afterInit() {
        this.initListenTCP();

    }
    
    public handleConnection(client: WebSocket, ...args: any[]){
        console.log(`Подключился новый пользователь ${client}`)
    }
    
    public handleDisconnect(client: WebSocket){
        console.log(`Отключился пользователь ${client}`)
    }
}
