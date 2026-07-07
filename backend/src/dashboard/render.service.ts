import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RenderService {
    private readonly logger = new Logger('RenderService');
    private readonly apiKey = process.env.RENDER_API_KEY;
    private readonly serviceId = process.env.RENDER_SERVICE_ID;
    private readonly baseUrl = 'https://api.render.com/v1';

    private async fetch(path: string) {
        const res = await fetch(`${this.baseUrl}${path}`, {
        headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json',
        },
        });
        if (!res.ok) throw new Error(`Render API error: ${res.status}`);
        return res.json();
    }

    async getLogs(): Promise<{ timestamp: string; stream: 'stdout' | 'stderr'; message: string }[]> {
        try {
        // Render logs API — returns last 100 lines
        const data = await this.fetch(`/services/${this.serviceId}/logs?limit=100`);
        
        return data.logs.map((log: any) => ({
            timestamp: log.timestamp,
            stream: log.type === 'stderr' ? 'stderr' : 'stdout',
            message: log.message,
        }));
        } catch (error) {
        this.logger.error('Failed to fetch Render logs', error);
        return [];
        }
    }

    async getServiceInfo() {
        try {
        const data = await this.fetch(`/services/${this.serviceId}`);
        return {
            name: data.name,
            status: data.suspended === 'not_suspended' ? 'running' : 'suspended',
            state: data.serviceDetails?.env ?? 'docker',
            region: data.serviceDetails?.region ?? 'oregon',
            url: data.serviceDetails?.url ?? '',
            updatedAt: data.updatedAt,
        };
        } catch (error) {
        this.logger.error('Failed to fetch Render service info', error);
        return null;
        }
    }

    async getDeploys() {
        try {
        const data = await this.fetch(`/services/${this.serviceId}/deploys?limit=5`);
        return data.map((item: any) => ({
            id: item.deploy.id,
            status: item.deploy.status,
            createdAt: item.deploy.createdAt,
            finishedAt: item.deploy.finishedAt,
            commitMessage: item.deploy.commit?.message ?? 'Manual deploy',
            commitSHA: item.deploy.commit?.id?.slice(0, 7) ?? '',
        }));
        } catch (error) {
        this.logger.error('Failed to fetch Render deploys', error);
        return [];
        }
    }
}