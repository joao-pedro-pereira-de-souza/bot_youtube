import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('#Main route: E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should execute the main request successfully', async () => {
    const pathRequest = '/';
    const { default: supertest } = await import('supertest');
    const { default: app } = await import('@middlewares/setup');
    const serverApi = supertest(app);

    const response = await serverApi.get(pathRequest);

    expect(response.status).toBe(200);
    const bodyParse = response.text ? JSON.parse(response.text) : {};

    const expectedBody = {
      data: {
        name: expect.any(String),
        version: expect.any(String),
        description: expect.any(String),
      }
    };

    expect(bodyParse).toEqual(expectedBody);
  });
});
