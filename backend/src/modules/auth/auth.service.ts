import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notifications/notification.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { JwtPayload, AuthUser } from '../../common/interfaces/auth-user.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.usersService.create(dto, passwordHash);

    const tokens = await this.generateTokens({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    // Asynchronously dispatch welcome notification
    this.notificationService
      .sendWelcomeNotification({
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      })
      .catch((err) =>
        this.logger.warn(`Failed to send welcome notification: ${err.message}`),
      );

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        studyPreferences: user.studyPreferences,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        studyPreferences: user.studyPreferences,
        savedSpotIds: user.savedSpotIds || [],
      },
      ...tokens,
    };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    try {
      const refreshSecret = this.configService.get<string>(
        'jwt.refreshSecret',
        'super_secret_jwt_refresh_key_ai_study_spot_finder_2026_dev',
      );

      const decoded = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.usersService.findById(decoded.sub, true);
      if (!user || !user.hashedRefreshToken) {
        throw new UnauthorizedException('Access denied. Token invalid or revoked.');
      }

      const refreshTokenMatches = await bcrypt.compare(
        dto.refreshToken,
        user.hashedRefreshToken,
      );

      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Access denied. Refresh token rotation mismatch.');
      }

      const newTokens = await this.generateTokens({
        sub: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      });

      await this.updateRefreshToken(user._id.toString(), newTokens.refreshToken);

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          studyPreferences: user.studyPreferences,
        },
        ...newTokens,
      };
    } catch (err: any) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { success: true, message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      // Return success even if user not found for security (prevent email enumeration)
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been dispatched.',
      };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(rawToken, salt);

    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.usersService.setPasswordResetToken(
      user._id.toString(),
      hashedToken,
      expires,
    );

    await this.notificationService.sendPasswordResetNotification({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      resetToken: rawToken,
    });

    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findById(dto.userId, true);
    if (
      !user ||
      !user.passwordResetToken ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new BadRequestException('Password reset token is invalid or has expired.');
    }

    const tokenMatches = await bcrypt.compare(
      dto.token,
      user.passwordResetToken,
    );
    if (!tokenMatches) {
      throw new BadRequestException('Invalid password reset token.');
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.usersService.clearPasswordResetToken(
      user._id.toString(),
      newPasswordHash,
    );

    return {
      success: true,
      message: 'Password successfully reset. You can now log in with your new password.',
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId, true);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Current password does not match');
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(dto.newPassword, salt);

    await this.usersService.clearPasswordResetToken(userId, newHash);
    return { success: true, message: 'Password updated successfully' };
  }

  private async generateTokens(payload: JwtPayload) {
    const accessSecret = this.configService.get<string>(
      'jwt.accessSecret',
      'super_secret_jwt_access_key_ai_study_spot_finder_2026_dev',
    );
    const refreshSecret = this.configService.get<string>(
      'jwt.refreshSecret',
      'super_secret_jwt_refresh_key_ai_study_spot_finder_2026_dev',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role,
        },
        {
          secret: accessSecret,
          expiresIn: this.configService.get<string>('jwt.accessExpiration', '15m'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role,
        },
        {
          secret: refreshSecret,
          expiresIn: this.configService.get<string>('jwt.refreshExpiration', '7d'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(refreshToken, salt);
    await this.usersService.updateRefreshToken(userId, hashed);
  }
}
