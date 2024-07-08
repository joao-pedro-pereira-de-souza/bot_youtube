declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: number | null;
      RATE_LIMIT_TIME?: number | null;
      RATE_LIMIT_LIMIT_REQUESTS?: number | null;
      CRYPTO_SECURITY: string

      DB_USERNAME: string
      DB_PASSWORD: string
      DB_NAME: string

      DATABASE_URL: string

      MERCADO_PAGO_INTEGRATION: string

      MERCADO_PAGO_PUBLIC_SENDBOX: string
      MERCADO_PAGO_ACCESS_TOKEN_SENDBOX: string

      MERCADO_PAGO_PUBLIC_PRODUCTION: string
      MERCADO_PAGO_ACCESS_TOKEN_PRODUCTION: string
    }
  }
}

export {};
