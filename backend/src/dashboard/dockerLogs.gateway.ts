import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Inject, forwardRef } from '@nestjs/common';
@WebSocketGateway({
    cors:  { origin: '*' }
})
export class DockerLogsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    constructor(@Inject(forwardRef(() => DashboardService)) private readonly dashboardService: DashboardService) {}

    private logger = new Logger('DockerLogsGateway')
    
    async handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);

        try {
            const pipelinesData = await this.dashboardService.getPipelines();
            client.emit('pipelines_update', pipelinesData);
            const logsData = await this.dashboardService.getDockerLogs();
            client.emit('dockerlogs_update', logsData);
        } catch (error) {
            this.logger.error('Error fetching docker logs', error);
            client.emit('error', 'Failed to load docker logs');
        }
    }

    handleDisconnect(client: Socket){
        this.logger.log(`Client disconnected: ${client.id}`)
    }
    emitDockerLogsUpdate(data: any){
        this.server.emit('dockerlogs_update', data)
    }
}