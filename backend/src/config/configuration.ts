export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  applicationId: process.env.APPLICATION_ID || 'ai-study-spot-finder',
  publicAccessEnabled: process.env.PUBLIC_ACCESS_ENABLED !== 'false',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'super_secret_jwt_access_key_ai_study_spot_finder_2026_dev',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_ai_study_spot_finder_2026_dev',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    passwordResetSecret: process.env.PASSWORD_RESET_SECRET || 'super_secret_pwd_reset_key_ai_study_spot_finder_2026_dev',
    passwordResetExpiration: process.env.PASSWORD_RESET_EXPIRATION || '1h',
  },

  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-study-spot-finder',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  aiPlatform: {
    url: process.env.AI_PLATFORM_URL || 'http://localhost:5000',
    apiKey: process.env.AI_PLATFORM_API_KEY || 'platform_master_key_dev_12345',
    timeoutMs: parseInt(process.env.AI_PLATFORM_TIMEOUT_MS || '60000', 10),
  },

  notificationService: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3001',
    apiKey: process.env.NOTIFICATION_SERVICE_API_KEY || 'notification_service_api_key_12345',
  },

  throttler: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    aiLimit: parseInt(process.env.THROTTLE_AI_LIMIT || '20', 10),
    authLimit: parseInt(process.env.THROTTLE_AUTH_LIMIT || '10', 10),
  },
});
