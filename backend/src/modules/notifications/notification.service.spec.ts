import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationClientService } from './notification-client.service';
import { ConfigService } from '@nestjs/config';

describe('NotificationService', () => {
  let service: NotificationService;
  let clientMock: Partial<NotificationClientService>;

  beforeEach(async () => {
    clientMock = {
      sendNotification: jest.fn().mockResolvedValue({
        success: true,
        message: 'Notification enqueued successfully',
        notificationId: 'notif_12345',
        enqueuedChannels: [
          { channel: 'EMAIL', queue: 'email_critical', jobId: 'job_1' },
        ],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: NotificationClientService, useValue: clientMock },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: any) => defaultValue),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should dispatch welcome notification', async () => {
    const result = await service.sendWelcomeNotification({
      userId: 'usr_1',
      email: 'alex@example.com',
      name: 'Alex',
    });

    expect(result).toBeDefined();
    expect(clientMock.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: 'ai-study-spot-finder',
        recipient: { userId: 'usr_1', email: 'alex@example.com', name: 'Alex' },
        channels: ['EMAIL', 'IN_APP'],
      }),
    );
  });
});
