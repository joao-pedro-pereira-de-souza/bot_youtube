import { describe, it, expect, beforeEach, jest} from '@jest/globals';
import {Server} from 'http';

function PromiseListenerServer(app: Server) {
  return new Promise((resolve, reject) => {
    app.on('listening', () => resolve(true));
    app.on('error', () => reject(false));
  });

}

describe('#Index Server: Unitary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });


  it('should have all server settings NODE_ENV development', async () => {

    const PORT = 2621;
    const NODE_ENV = 'development';

    process.env.NODE_ENV = NODE_ENV;
    process.env.PORT = PORT;
    process.env.RATE_LIMIT_TIME = 90000;
    process.env.RATE_LIMIT_LIMIT_REQUESTS = 3;

    const { default: setup } = await import('@middlewares/setup');
    const { default: listener } = await import('@functions/listener');

    jest.spyOn(setup, 'listen');


    const { server } = await import('@root/src/index');

    const isInitServer = await PromiseListenerServer(server);

    expect(isInitServer).toBe(true);
    expect(setup.listen).toHaveBeenCalledWith(String(PORT), listener);
  });
});
