import { currentLoad, mem, fsSize } from 'systeminformation';
import { Injectable, Logger } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PipelinesGateway } from './pipelines.gateway';
import { DockerLogsGateway } from './dockerLogs.gateway';
import Docker from 'dockerode';
import * as fs from 'fs';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const RENDER_API_KEY = process.env.RENDER_API_KEY;
const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID;
const RENDER_BASE_URL = 'https://api.render.com/v1';
const RENDER_OWNER_ID = process.env.RENDER_OWNER_ID;
@Injectable()
export class DashboardService {
  private logger = new Logger('DashboardService')
  private lastData: string = ''
  private docker: Docker | null = null;
  private dockerAvailable: boolean = false;

  constructor(private pipelinesGateway: PipelinesGateway, private dockerLogsGateway: DockerLogsGateway) {
    const socketPath = process.env.SOCKET_PATH;

    if (!IS_PRODUCTION && socketPath && fs.existsSync(socketPath)) {
      this.docker = new Docker({ socketPath } as Docker.DockerOptions);
      this.dockerAvailable = true;
      this.logger.log('🐳 Docker available — using live Docker data');
    } else {
      this.dockerAvailable = false;
      this.logger.warn('☁️ Docker not available — using Render API');
    }
  }

  // ─── DOCKER LOG PARSING ──────────────────────────────────────────────────────

  private parseDockerLogs(raw: string): { timestamp: string; stream: 'stdout' | 'stderr'; message: string }[] {
    const lines = raw.split('\n');
    const result: { timestamp: string; stream: 'stdout' | 'stderr'; message: string }[] = [];

    for (const line of lines) {
      if (!line || line.length < 8) continue;

      const streamType = line.charCodeAt(0) === 2 ? 'stderr' : 'stdout';
      const cleaned = line.slice(8);
      const noAnsi = cleaned.replace(/\x1b\[[0-9;]*m/g, '');
      const match = noAnsi.match(/^(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\s*(.*)/);

      if (!match) continue;
      const message = match[2].trim();
      if (!message) continue;

      result.push({ timestamp: match[1], stream: streamType, message });
    }

    return result;
  }

  // ─── RENDER API ──────────────────────────────────────────────────────────────

  private async getRenderLogs() {
    try {
      const res = await fetch(
        `${RENDER_BASE_URL}/logs?ownerId=${RENDER_OWNER_ID}&resource=${RENDER_SERVICE_ID}&limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${RENDER_API_KEY}`,
            'Accept': 'application/json',
          },
        }
      );

      const resServerData = await fetch(
        // https://api.render.com/v1/services/srv-xxxxxxx
        `${RENDER_BASE_URL}/services/${RENDER_SERVICE_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${RENDER_API_KEY}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!res.ok && !resServerData.ok) throw new Error(`Render API error: ${res.status}`);
      const data = { serverData: await resServerData.json(), logs: await res.json() };

      const backendLogs = data?.logs?.map((item: any) => ({
        timestamp: item.timestamp,
        stream: 'stdout' as const,
        message: item.message,
      }));

      return {
        serverData: data?.serverData,
        logs: {
          'nestjsreactdocker_project-backend-1': backendLogs,
          'nestjsreactdocker_project-frontend-1': [{
            timestamp: new Date().toISOString(),
            stream: 'stdout' as const,
            message: 'ℹ️ Static site — logs not available on Render free tier',
          }],
          'nestjsreactdocker_project-postgres-1': [{
            timestamp: new Date().toISOString(),
            stream: 'stdout' as const,
            message: 'ℹ️ Managed PostgreSQL — logs not available on Render free tier',
          }]
        }
      };
    } catch (error) {
      this.logger.error('Failed to fetch Render logs', error);
      return {};
    }
  }

  private async getRenderContainers() {
    try {
      const data = await this.getRenderLogs();
      return [{
        id: RENDER_SERVICE_ID?.slice(-12) ?? 'render-svc',
        name: data?.serverData?.name,
        status: `Up (${data?.serverData?.serviceDetails?.region ?? 'unknown'})`,
        state: data?.serverData?.suspended === 'not_suspended' ? 'running' : 'suspended',
        image: 'render/docker',
      }];
    } catch (error) {
      this.logger.error('Failed to fetch Render service info', error);
      return [];
    }
  }

  // ─── PUBLIC METHODS ───────────────────────────────────────────────────────────

  async getDockerLogs() {
    if (this.dockerAvailable) {
      return this.getLocalDockerLogs();
    }
    return this.getRenderLogs();
  }

  async getContainers() {
    if (this.dockerAvailable) {
      return this.getLocalContainers();
    }
    return this.getRenderContainers();
  }

  async streamContainerLogs(
    containerName: string,
    onLine: (line: { timestamp: string; stream: 'stdout' | 'stderr'; message: string }) => void,
  ) {
    if (!this.dockerAvailable || !this.docker) {
      // In production, poll Render logs every 3s as a "live" approximation
      const interval = setInterval(async () => {
        try {
          const data = await this.getRenderLogs();
          const logs = data['nestjsreactdocker_project-backend-1'] ?? [];
          logs.slice(-5).forEach(onLine); // emit last 5 lines
        } catch (e) {
          this.logger.error('Render live poll error', e);
        }
      }, 3000);

      // Return a fake stream-like object so DockerLogsGateway can call .destroy()
      return { destroy: () => clearInterval(interval) };
    }

    // Local Docker live streaming
    const containers: Docker.ContainerInfo[] = await this.docker.listContainers({ all: true });
    const found = containers.find(
      (c) => c.Names?.[0]?.replace('/', '') === containerName,
    );
    if (!found) throw new Error(`Container ${containerName} not found`);

    const containerInstance = this.docker.getContainer(found.Id);
    const logStream = await containerInstance.logs({
      stdout: true,
      stderr: true,
      follow: true,
      timestamps: true,
      tail: 0,
    });

    logStream.on('data', (chunk: Buffer) => {
      const parsed = this.parseDockerLogs(chunk.toString('utf-8'));
      parsed.forEach((line) => onLine(line));
    });

    logStream.on('error', (err) => {
      this.logger.error('Live log stream error', err);
    });

    return logStream;
  }

  // ─── LOCAL DOCKER ─────────────────────────────────────────────────────────────

  private async getLocalDockerLogs() {
    const containers: Docker.ContainerInfo[] = await this.docker!.listContainers({ all: true });
    const logs: { [key: string]: { timestamp: string; stream: 'stdout' | 'stderr'; message: string }[] } = {};

    for (const container of containers) {
      const containerInstance = this.docker!.getContainer(container.Id);
      const logStream = await containerInstance.logs({
        stdout: true,
        stderr: true,
        follow: false,
        tail: 100,
        timestamps: true,
      });

      const name = container.Names?.[0]?.replace('/', '') ?? 'unknown';
      logs[name] = this.parseDockerLogs(logStream.toString('utf-8'));
    }

    return logs;
  }

  private async getLocalContainers() {
    const containers: Docker.ContainerInfo[] = await this.docker!.listContainers({ all: true });

    return containers.map((c: Docker.ContainerInfo) => ({
      id: c.Id.slice(0, 12),
      name: c.Names?.[0]?.replace('/', '') ?? '',
      status: c.Status ?? '',
      state: c.State ?? '',
      image: c.Image ?? '',
    }));
  }

  // ─── METRICS ──────────────────────────────────────────────────────────────────

  async getMetrics() {
    const [cpu, memory, disk] = await Promise.all([
      currentLoad(),
      mem(),
      fsSize(),
    ]);

    const uptime = process?.uptime()
    const hours = Math.floor(uptime / 3600)
    const mins = Math.floor((uptime % 3600) / 60)

    return {
      cpu: Math.round(cpu.currentLoad),
      memory: Math.round((memory.active / memory.total) * 100),
      uptime: `${hours}h ${mins}m`,
      disk: Math.round(disk[0].use),
    };
  }

  // ─── PIPELINES ────────────────────────────────────────────────────────────────

  async getPipelines() {
    const octokit = new Octokit({
      auth: process?.env.GITHUB_TOKEN || 'token'
    });

    const { data } = await octokit.actions.listWorkflowRunsForRepo({
      owner: process?.env.GITHUB_OWNER || 'default',
      repo: process?.env.GITHUB_REPO || 'somerepo',
    });

    return data.workflow_runs.map(run => ({
      id: run?.id,
      name: `${run?.name} #${run?.run_number}`,
      commit: run?.head_sha.substring(0, 7),
      commit_message: run?.display_title,
      branch: run?.head_branch,
      status: run.status,
      conclusion: run?.conclusion,
      createdAt: run?.created_at,
      duration: (new Date(run.updated_at).getTime() - new Date(run.created_at).getTime()) / 1000,
      url: run?.html_url
    }))
  }

  // ─── CRON JOBS ────────────────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkPipelines() {
    this.logger.log('Checking pipelines . . .')
    try {
      const pipelines = await this.getPipelines()
      const newData = JSON.stringify(pipelines)

      if (newData !== this.lastData) {
        this.logger.log('Pipelines changed, emitting update')
        this.pipelinesGateway.emitPipelinesUpdate(pipelines)
      }
    } catch (error) {
      this.logger.error('Error checking pipelines')
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async checkDockerLogs() {
    try {
      const logs = await this.getDockerLogs()
      const data = JSON.stringify(logs)
      if (data !== this.lastData) {
        this.logger.log('Docker logs changed, emitting update')
        this.dockerLogsGateway.emitDockerLogsUpdate(logs)
      }
    } catch (error) {
      this.logger.error('Error checking docker logs')
      this.logger.error(error)
    }
  }
}