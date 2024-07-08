import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Express, Request, Response, NextFunction } from 'express';
import MiddlewareAuth from '@middlewares/auth';
import LibJwt from '@libs/jwt';
import TestAgent from 'supertest/lib/agent';
import { randomUUID } from 'node:crypto';
import {Response as ResponseSuperTest} from 'supertest';

describe('#Middlewares: E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('#Errors', () => {


    const pathRequest = '/test';
    function MockRouteError(req: Request, res: Response, next: NextFunction) {
      try {
        throw new Error('Error test');
      } catch (error) {
        next(error);
      }

    }
    function MockRoutesError(app: Express) {
      app.get(pathRequest, MockRouteError);
    }

    it('should execute the error middleware block on an http request', async() => {
      const { default: supertest } = await import('supertest');

      const Routes = await import('@routes/index');
      jest.spyOn(Routes, 'default').mockImplementation((app) => MockRoutesError(app));

      const { default: app } = await import('@middlewares/setup');
      const serverApi = supertest(app);

      const response = await serverApi.get(pathRequest);

      expect(response.status).toBe(503);
      const bodyParse = response.text ? JSON.parse(response.text) : {};

      const expectedBody = {
        status: 503,
        message: 'Ocorreu um erro no sistema',
        data: null
      };

      expect(bodyParse).toEqual(expectedBody);
    });

  });

  describe('#Authentication', () => {


    const pathRequest = '/test';
    function MockRouteAuth(req: Request, res: Response, next: NextFunction) {
      try {

        const response = {
          status: 200,
          message: 'Routa executada com sucesso',
          data: null
        };
        res.status(response.status).json(response);
      } catch (error) {
        next(error);
      }

    }
    function MockRoutesAuth(app: Express) {
      app.get(pathRequest, MiddlewareAuth(), MockRouteAuth);
    }

    it('should enter authentication not found error', async() => {
      const { default: supertest } = await import('supertest');

      const Routes = await import('@routes/index');
      jest.spyOn(Routes, 'default').mockImplementation((app) => MockRoutesAuth(app));

      const { default: app } = await import('@middlewares/setup');
      const serverApi = supertest(app);

      const response = await serverApi.get(pathRequest);

      expect(response.status).toBe(401);
      const bodyParse = response.text ? JSON.parse(response.text) : {};

      const expectedBody = {
        status: 401,
        message: 'Token de autenticação não encontrado.',
        data: null
      };

      expect(bodyParse).toEqual(expectedBody);
    });

    it('should enter authentication success', async() => {
      const { default: supertest } = await import('supertest');

      const Routes = await import('@routes/index');
      jest.spyOn(Routes, 'default').mockImplementation((app) => MockRoutesAuth(app));

      const { default: app } = await import('@middlewares/setup');
      const serverApi = supertest(app);

      const paramsGenerateToken = {
        data: {
          id: randomUUID({disableEntropyCache: true}),

        },
      };

      const token = LibJwt.generateToken(paramsGenerateToken);

      const response = await serverApi.get(pathRequest)
        .set('authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      const bodyParse = response.text ? JSON.parse(response.text) : {};

      const expectedBody = {
        status: 200,
        message: 'Routa executada com sucesso',
        data: null
      };

      expect(bodyParse).toEqual(expectedBody);
    });


  });

  describe('#RateLimit', () => {

    const pathRequest = '/test';
    async function LoopRequests(count: number, requests: any[], apiRequest: TestAgent ) {
      try {
        if (count === 0) {
          return requests;
        }

        const response = await apiRequest.get(pathRequest).expect('Content-Type', /json/);
        requests.push(response);
        await LoopRequests(count - 1, requests, apiRequest);


      } catch (error) {
        return [];
      }

    }

    function MockRoute(req: Request, res: Response, next: NextFunction) {
      try {

        const response = {
          status: 200,
          message: 'Routa executada com sucesso',
          data: null
        };
        res.status(response.status).json(response);
      } catch (error) {
        next(error);
      }

    }
    function MockRoutesRateLimit(app: Express) {
      app.get(pathRequest, MockRoute);
    }

    it('should return an error when the request limit is reached', async () => {
      jest.useFakeTimers();

      const RATE_LIMIT_TIME = 90000;
      process.env.NODE_ENV = 'development';
      process.env.RATE_LIMIT_TIME = RATE_LIMIT_TIME;
      process.env.RATE_LIMIT_LIMIT_REQUESTS = 3;
      const { default: supertest } = await import('supertest');

      const Routes = await import('@routes/index');
      jest.spyOn(Routes, 'default').mockImplementation((app) => MockRoutesRateLimit(app));

      const { default: app } = await import('@middlewares/setup');
      const serverApi = supertest(app);

      const limitRequests = Number(process.env.RATE_LIMIT_LIMIT_REQUESTS) + 1;

      const requests: any[] = [];
      await LoopRequests(limitRequests, requests, serverApi);

      const requestRateLimit = requests.pop() as ResponseSuperTest;
      const requestLastSuccess = requests.pop() as ResponseSuperTest;


      expect(requestRateLimit.status).toEqual(429);
      expect(requestLastSuccess.status).toEqual(200);

      const bodyRateLimitExpected = {
        status: 429,
        message: expect.any(String),
        data: null
      };
      expect(requestRateLimit.body).toEqual(bodyRateLimitExpected);

      const bodySuccessExpected = {
        status: 200,
        message: expect.any(String),
        data: null
      };
      expect(requestLastSuccess.body).toEqual(bodySuccessExpected);

      jest.advanceTimersByTime(RATE_LIMIT_TIME + 1000);
      const responseNewRequest = await serverApi.get(pathRequest);

      expect(responseNewRequest.status).toEqual(200);
      expect(responseNewRequest.body).toEqual(bodySuccessExpected);

    });
  });

});
