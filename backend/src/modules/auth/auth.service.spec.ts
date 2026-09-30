import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notifications/notification.service';
import { UserRole } from '../../common/enums/roles.enum';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let notificationService: Partial<NotificationService>;
  let configService: Partial<ConfigService>;

  const mockUser = {
    _id: 'usr_mock_123',
    email: 'scholar@example.com',
    name: 'Alex Scholar',
    passwordHash: '',
    role: UserRole.USER,
    hashedRefreshToken: '',
  };

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('validPassword123', 10);
    mockUser.hashedRefreshToken = await bcrypt.hash('validRefreshToken', 10);
  });

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn().mockImplementation((email: string) => {
        if (email === mockUser.email) return Promise.resolve(mockUser);
        return Promise.resolve(null);
      }),
      findById: jest.fn().mockImplementation((id: string) => {
        if (id === mockUser._id) return Promise.resolve(mockUser);
        return Promise.resolve(null);
      }),
      create: jest.fn().mockResolvedValue(mockUser),
      updateRefreshToken: jest.fn().mockResolvedValue(undefined),
      setPasswordResetToken: jest.fn().mockResolvedValue(undefined),
      clearPasswordResetToken: jest.fn().mockResolvedValue(undefined),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock_token_jwt'),
      verify: jest.fn().mockImplementation((token: string) => {
        if (token === 'validRefreshToken') {
          return { sub: mockUser._id, email: mockUser.email, name: mockUser.name, role: mockUser.role };
        }
        throw new Error('Invalid token');
      }),
    };

    notificationService = {
      sendWelcomeNotification: jest.fn().mockResolvedValue({ success: true }),
      sendPasswordResetNotification: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: NotificationService, useValue: notificationService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => defaultValue),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should successfully login with correct credentials', async () => {
    const result = await authService.login({
      email: 'scholar@example.com',
      password: 'validPassword123',
    });

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.email).toBe('scholar@example.com');
  });

  it('should throw UnauthorizedException on invalid password', async () => {
    await expect(
      authService.login({
        email: 'scholar@example.com',
        password: 'wrongPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException on unknown email', async () => {
    await expect(
      authService.login({
        email: 'unknown@example.com',
        password: 'validPassword123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
