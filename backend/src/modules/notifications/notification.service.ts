import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationClientService } from './notification-client.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly applicationId: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly client: NotificationClientService,
    private readonly configService: ConfigService,
  ) {
    this.applicationId = this.configService.get<string>(
      'applicationId',
      'ai-study-spot-finder',
    );
    this.frontendUrl = this.configService.get<string>(
      'frontendUrl',
      'http://localhost:3000',
    );
  }

  async sendWelcomeNotification(user: {
    userId: string;
    email: string;
    name: string;
  }) {
    const idempotencyKey = `welcome_${user.userId}`;
    return this.client.sendNotification({
      applicationId: this.applicationId,
      idempotencyKey,
      recipient: {
        userId: user.userId,
        email: user.email,
        name: user.name,
      },
      channels: ['EMAIL', 'IN_APP'],
      priority: 'HIGH',
      title: 'Welcome to AI Study Spot Finder! ☕📚',
      body: `Hi ${user.name || 'there'}! Welcome to your personalized study intelligence. Discover the quietest libraries, high-speed WiFi cafes, and cozy nooks tailored to your workflow.`,
      data: {
        actionUrl: `${this.frontendUrl}/explore`,
        type: 'WELCOME',
      },
    });
  }

  async sendPasswordResetNotification(user: {
    userId: string;
    email: string;
    name: string;
    resetToken: string;
  }) {
    const idempotencyKey = `pwd_reset_${user.userId}_${Date.now()}`;
    const resetLink = `${this.frontendUrl}/auth/reset-password?token=${user.resetToken}&userId=${user.userId}`;

    return this.client.sendNotification({
      applicationId: this.applicationId,
      idempotencyKey,
      recipient: {
        userId: user.userId,
        email: user.email,
        name: user.name,
      },
      channels: ['EMAIL'],
      priority: 'HIGH',
      title: 'Password Reset Request - AI Study Spot Finder',
      body: `You requested a password reset. Click the link below to set a new password. If you did not request this, please ignore this email. Link valid for 1 hour: ${resetLink}`,
      data: {
        resetLink,
        type: 'PASSWORD_RESET',
      },
    });
  }

  async sendSpotSavedNotification(
    user: { userId: string; email?: string; name: string },
    spot: { id: string; name: string; address: string },
  ) {
    const idempotencyKey = `spot_saved_${user.userId}_${spot.id}_${Date.now()}`;
    return this.client.sendNotification({
      applicationId: this.applicationId,
      idempotencyKey,
      recipient: {
        userId: user.userId,
        email: user.email,
        name: user.name,
      },
      channels: ['IN_APP'],
      priority: 'LOW',
      title: `Saved "${spot.name}" to your study spots! 🔖`,
      body: `"${spot.name}" located at ${spot.address} is now bookmarked in your study spots.`,
      data: {
        spotId: spot.id,
        actionUrl: `${this.frontendUrl}/spots/${spot.id}`,
        type: 'SPOT_SAVED',
      },
    });
  }

  async sendCheckInNotification(
    user: { userId: string; email?: string; name: string },
    spot: { id: string; name: string },
  ) {
    const idempotencyKey = `checkin_${user.userId}_${spot.id}_${new Date().toISOString().slice(0, 10)}`;
    return this.client.sendNotification({
      applicationId: this.applicationId,
      idempotencyKey,
      recipient: {
        userId: user.userId,
        email: user.email,
        name: user.name,
      },
      channels: ['IN_APP'],
      priority: 'NORMAL',
      title: `Checked into ${spot.name} 📍`,
      body: `Happy studying! Don't forget to submit a noise & WiFi rating to help the community.`,
      data: {
        spotId: spot.id,
        actionUrl: `${this.frontendUrl}/spots/${spot.id}?review=true`,
        type: 'CHECK_IN',
      },
    });
  }
}
