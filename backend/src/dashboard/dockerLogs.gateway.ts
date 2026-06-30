import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket
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
    // Track active log streams per client so we can clean them up
    private activeStreams = new Map<string, any>();

    async handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);

        try {
            const logsData = await this.dashboardService.getDockerLogs();
            client.emit('dockerlogs_update', logsData);
        } catch (error) {
            this.logger.error('Error fetching docker logs', error);
            client.emit('error', 'Failed to load docker logs');
        }
    }

    handleDisconnect(client: Socket){
        this.logger.log(`Client disconnected: ${client.id}`)
        this.stopStream(client.id);
    }

    @SubscribeMessage('subscribe_live_logs')
    async handleSubscribeLiveLogs(
        @MessageBody() data: { containerName: string },
        @ConnectedSocket() client: Socket,
    ) {
        // Stop any previous stream for this client first
        this.stopStream(client.id);

        this.logger.log(`Starting live stream for ${data.containerName} -> ${client.id}`);

        const stream = await this.dashboardService.streamContainerLogs(
        data.containerName,
        (line) => {
            client.emit('live_log_line', { container: data.containerName, ...line });
        },
        );

        this.activeStreams.set(client.id, stream);
    }

    @SubscribeMessage('unsubscribe_live_logs')
    handleUnsubscribeLiveLogs(@ConnectedSocket() client: Socket) {
        this.stopStream(client.id);
    }

    private stopStream(clientId: string) {
        const stream = this.activeStreams.get(clientId);
        if (stream) {
        stream.destroy();
        this.activeStreams.delete(clientId);
        }
    }

    emitDockerLogsUpdate(data: any){
        this.server.emit('dockerlogs_update', data)
    }
}