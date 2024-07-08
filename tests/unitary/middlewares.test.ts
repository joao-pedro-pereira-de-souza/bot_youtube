import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import LibJwt from '@libs/jwt';
import { randomUUID } from 'node:crypto';
import { Request, Response } from 'express';
import MiddlewareAuth from '@middlewares/auth';

const mockResponse = () => {
  const res: any = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('#Middlewares: Unitary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('#setup', () => {

    it('should return all settings use aplication', async () => {
      const { default: express } = await import('express');
      const mockUseApp = jest.spyOn(express.application, 'use');

      const {default: app } = await import('@middlewares/setup');

      const haveUseApp = 3;

      expect(mockUseApp).toHaveReturnedTimes(haveUseApp);

      const jsonMiddleware = app._router.stack.find((layer: any) => layer.name === 'jsonParser');
      expect(mockUseApp).toHaveBeenNthCalledWith(1, expect.any(Function));
      expect(jsonMiddleware).toBeDefined();


      const corsMiddleware = app._router.stack.find((layer: any) => typeof layer.handle === 'function' && layer.handle.name === 'corsMiddleware');
      expect(corsMiddleware).toBeDefined();
      expect(mockUseApp).toHaveBeenNthCalledWith(2, expect.any(Function));
    });

    it('should execute routes api', async () => {
      jest.mock('@routes/index');

      const { default: Routes } = await import('@routes/index');

      await import('@middlewares/setup');

      expect(Routes).toHaveBeenCalled();

      expect(Routes).toHaveReturnedTimes(1);

    });


    it('should execute errors api', async () => {

      jest.mock('@middlewares/errors');

      const { default: Errors } = await import('@middlewares/errors');

      await import('@middlewares/setup');

      expect(Errors).toHaveBeenCalled();

      expect(Errors).toHaveReturnedTimes(1);

    });

    it.todo('should be in the call order between routes and errors');
  });

  describe('#Authentication', () => {
    it('should enter erro "Token de autenticação não encontrado." authentication', async () => {

      const req = { headers: {} } as Request;
      const res = mockResponse();
      const next = jest.fn();

      MiddlewareAuth()(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        status: 401,
        message: 'Token de autenticação não encontrado.',
        data: null
      });
      expect(next).not.toHaveBeenCalled();

    });

    it('should enter erro "Token malformado." authentication', async () => {
      const req = { headers: { authorization: 'Bearer ' } } as Request;
      const res = mockResponse();
      const next = jest.fn();

      MiddlewareAuth()(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 401,
        message: 'Token malformado.',
        data: null
      });

      expect(next).not.toHaveBeenCalled();

    });

    it('should enter erro "A sessão do token foi expirado." authentication', () => {
      jest.useFakeTimers({
        now: new Date('2024-04-13'),
      });

      const paramsGenerateToken = {
        data: {
          id: randomUUID({disableEntropyCache: true}),

        },
      };

      const token = LibJwt.generateToken(paramsGenerateToken);
      const req = { headers: { authorization:`Bearer ${token}` } } as Request;
      const res = mockResponse();
      const next = jest.fn();

      const expirationTime = 7 * 24 * 60 * 60 * 1000; // miliseconds
      const expirationDate = Date.now() + expirationTime;
      jest.advanceTimersByTime(expirationTime + 1000);
      MiddlewareAuth()(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        status: 401,
        message: 'Token malformado.',
        data: {
          message: 'A sessão do token foi expirado.',
          expired_at: new Date(expirationDate),
          is_token_expired: true
        }
      });


    });

    it('should enter erro "Token inválido." authentication', () => {
      const req = { headers: { authorization:'Bearer invalid' } } as Request;
      const res = mockResponse();
      const next = jest.fn();

      MiddlewareAuth()(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        status: 401,
        message: 'Token malformado.',
        data: {
          message: 'Token malformado.',
        }
      });

    });

    it('should call next if token is valid', () => {
      const validToken = 'validtoken';
      const req = { headers: { authorization: `Bearer ${validToken}` } } as Request;
      const res = mockResponse();
      const next = jest.fn();

      jest.spyOn(LibJwt, 'verifyToken').mockReturnValueOnce({ success: true });

      MiddlewareAuth()(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

  });

  describe('#Rate limited', () => {

    it('should enter the rate limited middleware when it is not NODE_ENV "test"', async () => {
      process.env.NODE_ENV = 'development';
      process.env.PORT = 3636;
      process.env.RATE_LIMIT_TIME = 90000;
      process.env.RATE_LIMIT_LIMIT_REQUESTS = 3;

      const { default: express } = await import('express');
      const mockUseApp = jest.spyOn(express.application, 'use');

      const moduleMiddlewareRateLimit = await import('@middlewares/rate_limited');
      const mockMiddlewareRateLimited = jest.spyOn(moduleMiddlewareRateLimit, 'default');

      await import('@middlewares/setup');


      const amountUseApplicationUsed = 3;

      expect(mockUseApp).toHaveBeenCalledTimes(amountUseApplicationUsed);
      const middleware =  mockUseApp.mock.calls[2][0] as any;

      expect(mockMiddlewareRateLimited).toHaveBeenCalledTimes(1);

      expect(middleware).toBeInstanceOf(Function);
      expect(Object.keys(middleware)).toEqual(['resetKey', 'getKey']);
    });

  });

});
