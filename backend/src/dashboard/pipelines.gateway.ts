import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@WebSocketGateway({
    cors: { origin: '*' }
})
export class PipelinesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('PipelinesGateway');

    constructor(
        @Inject(forwardRef(() => DashboardService)) private readonly dashboardService: DashboardService,
    ) {}

    async handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);

        try {
            const pipelinesData = await this.dashboardService.getPipelines();
            client.emit('pipelines_update', pipelinesData);
        } catch (error) {
            this.logger.error('Error fetching pipelines', error);
            client.emit('error', 'Failed to load pipelines');
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    emitPipelinesUpdate(data: any) {
        this.server.emit('pipelines_update', data);
    }
}