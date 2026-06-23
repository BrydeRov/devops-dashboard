import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'

@WebSocketGateway({
    cors:  { origin: '*' }
})
export class DockerLogsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    private logger = new Logger('DockerLogsGateway')
    
    handleConnection(client: Socket){
        this.logger.log(`Client connected: ${client.id}`)
    }
    handleDisconnect(client: Socket){
        this.logger.log(`Client disconnected: ${client.id}`)
    }
    emitDocketLogsUpdate(data: any){
        this.server.emit('dockerlogs_update', data)
    }
}