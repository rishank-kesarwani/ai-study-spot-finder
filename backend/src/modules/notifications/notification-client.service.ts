import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  IngestNotificationPayload,
  NotificationResponse,
  SyncNotificationPreferencesDto,
} from './interfaces/notification.interface';

@Injectable()
export class NotificationClientService {
  private readonly logger = new Logger(NotificationClientService.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly applicationId: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'notificationService.url',
      'http://localhost:3001',
    );
    this.apiKey = this.configService.get<string>(
      'notificationService.apiKey',
      'notification_service_api_key_12345',
    );
    this.applicationId = this.configService.get<string>(
      'applicationId',
      'ai-study-spot-finder',
    );

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    });
  }

  async sendNotification(
    payload: IngestNotificationPayload,
  ): Promise<NotificationResponse | null> {
    try {
      this.logger.log(
        `[Notification Service] Dispatching ${payload.channels.join(',')} notification to user ${payload.recipient.userId} (Key: ${payload.idempotencyKey})`,
      );

      const response = await this.client.post<NotificationResponse>(
        '/v1/notifications',
        payload,
      );

      this.logger.log(
        `[Notification Service] Success! Notification ID: ${response.data.notificationId} enqueued across: ${response.data.enqueuedChannels?.map((c) => c.queue).join(', ')}`,
      );
      return response.data;
    } catch (err: any) {
      this.logger.warn(
        `[Notification Service] Failed to dispatch notification: ${err.message}. Payload: ${JSON.stringify(
          {
            recipient: payload.recipient.userId,
            channels: payload.channels,
            title: payload.title,
          },
        )}`,
      );
      // Graceful fallback for non-blocking notifications
      return {
        success: false,
        message: `Notification service unavailable: ${err.message}`,
      };
    }
  }

  async syncPreferences(
    dto: SyncNotificationPreferencesDto,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.client.put('/v1/preferences', dto);
      return response.data;
    } catch (err: any) {
      this.logger.warn(
        `[Notification Service] Preferences sync failed for user ${dto.userId}: ${err.message}`,
      );
      return { success: false, message: err.message };
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 3000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
