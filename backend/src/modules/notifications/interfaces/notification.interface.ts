export type NotificationChannel = 'EMAIL' | 'PUSH' | 'IN_APP';
export type NotificationPriority = 'HIGH' | 'NORMAL' | 'LOW';

export interface NotificationRecipient {
  userId: string;
  email?: string;
  deviceToken?: string;
  name?: string;
}

export interface IngestNotificationPayload {
  applicationId: string;
  recipient: NotificationRecipient;
  channels: NotificationChannel[];
  priority?: NotificationPriority;
  templateId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  idempotencyKey: string;
  scheduledAt?: string;
}

export interface EnqueuedChannelResult {
  channel: string;
  queue: string;
  jobId: string;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  notificationId?: string;
  enqueuedChannels?: EnqueuedChannelResult[];
  status?: string;
}

export interface SyncNotificationPreferencesDto {
  userId: string;
  applicationId: string;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
  weeklyDigest?: boolean;
  spotAlerts?: boolean;
}
