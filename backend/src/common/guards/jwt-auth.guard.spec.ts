import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_OPTIONAL_AUTH_KEY } from '../decorators/optional-auth.decorator';
import { UserRole } from '../enums/roles.enum';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let configService: Partial<ConfigService>;

  const mockExecutionContext = (
    handlerOverride?: any,
    classOverride?: any,
  ): ExecutionContext => {
    return {
      getHandler: jest.fn().mockReturnValue(handlerOverride || {}),
      getClass: jest.fn().mockReturnValue(classOverride || {}),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ headers: {} }),
        getResponse: jest.fn().mockReturnValue({}),
      }),
    } as unknown as ExecutionContext;
  };

  const mockUser = {
    userId: 'usr_123',
    email: 'scholar@studyspot.ai',
    name: 'Alex Scholar',
    role: UserRole.USER,
  };

  beforeEach(() => {
    reflector = new Reflector();
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'publicAccessEnabled') return true;
        return undefined;
      }),
    };
    guard = new JwtAuthGuard(reflector, configService as ConfigService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true immediately if route is marked @Public()', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return true;
        return undefined;
      });

      const context = mockExecutionContext();
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('should return null or user for @Public() routes without throwing', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return true;
        return undefined;
      });

      const context = mockExecutionContext();
      expect(guard.handleRequest(null, null, null, context)).toBeNull();
      expect(guard.handleRequest(null, mockUser, null, context)).toEqual(mockUser);
    });

    describe('@OptionalAuth() routes with PUBLIC_ACCESS_ENABLED=true', () => {
      beforeEach(() => {
        configService.get = jest.fn((key: string) => {
          if (key === 'publicAccessEnabled') return true;
          return undefined;
        });
        guard = new JwtAuthGuard(reflector, configService as ConfigService);

        jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
          if (key === IS_PUBLIC_KEY) return false;
          if (key === IS_OPTIONAL_AUTH_KEY) return true;
          return undefined;
        });
      });

      it('should return null when anonymous user visits (no token / error)', () => {
        const context = mockExecutionContext();
        const result = guard.handleRequest(new Error('No auth token'), null, null, context);
        expect(result).toBeNull();
      });

      it('should return authenticated user when valid token is supplied', () => {
        const context = mockExecutionContext();
        const result = guard.handleRequest(null, mockUser, null, context);
        expect(result).toEqual(mockUser);
      });
    });

    describe('@OptionalAuth() routes with PUBLIC_ACCESS_ENABLED=false', () => {
      beforeEach(() => {
        configService.get = jest.fn((key: string) => {
          if (key === 'publicAccessEnabled') return false;
          return undefined;
        });
        guard = new JwtAuthGuard(reflector, configService as ConfigService);

        jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
          if (key === IS_PUBLIC_KEY) return false;
          if (key === IS_OPTIONAL_AUTH_KEY) return true;
          return undefined;
        });
      });

      it('should throw UnauthorizedException when anonymous user visits with public access disabled', () => {
        const context = mockExecutionContext();
        expect(() =>
          guard.handleRequest(new Error('No auth token'), null, null, context),
        ).toThrow(UnauthorizedException);
      });

      it('should return authenticated user when valid token is supplied even if public access is disabled', () => {
        const context = mockExecutionContext();
        const result = guard.handleRequest(null, mockUser, null, context);
        expect(result).toEqual(mockUser);
      });
    });

    describe('Normal protected routes (not @Public, not @OptionalAuth)', () => {
      beforeEach(() => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      });

      it('should throw UnauthorizedException when no user is present', () => {
        const context = mockExecutionContext();
        expect(() =>
          guard.handleRequest(null, null, null, context),
        ).toThrow(UnauthorizedException);
      });

      it('should throw UnauthorizedException when an error occurred in passport', () => {
        const context = mockExecutionContext();
        expect(() =>
          guard.handleRequest(new Error('JWT expired'), null, null, context),
        ).toThrow(UnauthorizedException);
      });

      it('should return authenticated user when valid user is present', () => {
        const context = mockExecutionContext();
        const result = guard.handleRequest(null, mockUser, null, context);
        expect(result).toEqual(mockUser);
      });
    });
  });
});
