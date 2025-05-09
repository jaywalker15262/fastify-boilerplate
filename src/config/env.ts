import { Static, Type } from '@sinclair/typebox';
import envSchema from 'env-schema';

enum NodeEnv {
  development = 'development',
  production = 'production',
  test = 'test',
}

export enum LogLevel {
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
}

const schema = Type.Object({
  POSTGRES_URL: Type.String(),
  POSTGRES_PASSWORD: Type.String(),
  POSTGRES_USER: Type.String(),
  POSTGRES_DB: Type.String(),
  LOG_LEVEL: Type.Enum(LogLevel),
  NODE_ENV: Type.Enum(NodeEnv),
  HOST: Type.String({ default: '0.0.0.0' }),
  PORT: Type.Number({ default: 3000 }),
  JWT_SECRET: Type.String(),
  JWT_EXPIRES_IN: Type.String({ default: '1h' }),
  JWT_REFRESH_EXPIRES_IN: Type.String({ default: '7d' }),
  APP_URL: Type.String(),
  OPENAI_API_KEY: Type.String(),
  SERPAI_API_KEY: Type.String(),
  RECAPTCHA_SECRET_KEY: Type.String(),
});

const env = envSchema<Static<typeof schema>>({
  dotenv: true,
  schema,
});

export default {
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === NodeEnv.development,
  isProduction: env.NODE_ENV === NodeEnv.production,
  version: process.env.npm_package_version ?? '0.0.0',
  log: {
    level: env.LOG_LEVEL,
  },
  server: {
    host: env.HOST,
    port: env.PORT,
  },
  db: {
    url: `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_URL}/${env.POSTGRES_DB}?sslmode=disable`,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  appUrl: env.APP_URL,
  openaiApiKey: env.OPENAI_API_KEY,
  serpaiApiKey: env.SERPAI_API_KEY,
  recaptchaSecretKey: env.RECAPTCHA_SECRET_KEY,
};
