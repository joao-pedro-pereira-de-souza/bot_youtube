import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { randomUUID } from 'node:crypto';

describe('#Libs: Unitary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('#jwt', () => {
    it('should enter erro "Ocorreu um erro no token enviado." (jwt) authentication', async () => {
      const {default: jwt} = await import('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Erro incomum');
      });

      const { default: customJwt } = await import('@libs/jwt');

      const responseVerify = customJwt.verifyToken('jest');

      const expectedCatch = {
        success: false,
        error: expect.any(Error),
        message: 'Ocorreu um erro no token enviado.'
      };
      expect(responseVerify).toEqual(expectedCatch);
    });

    it('should enter erro "Token malformado." (jwt) authentication', async () => {
      const {default: jwt} = await import('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('invalid token');
      });

      const { default: customJwt } = await import('@libs/jwt');

      const responseVerify = customJwt.verifyToken('jest');

      const expectedCatch = {
        success: false,
        error: expect.any(Error),
        message: 'Token inválido.'
      };
      expect(responseVerify).toEqual(expectedCatch);

    });

    it('should enter erro catch (jwt) authentication', async () => {
      const {default: jwt} = await import('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error();
      });

      const { default: customJwt } = await import('@libs/jwt');

      const responseVerify = customJwt.verifyToken('jest');

      const expectedCatch = {
        success: false,
        error: expect.any(Error),
        message: 'Ocorreu um erro ao verificar o token.'
      };
      expect(responseVerify).toEqual(expectedCatch);

    });

    it('should have all params in the default generateToken', async () => {

      const JWT_SECURITY = 'senha123';
      process.env.JWT_SECURITY = JWT_SECURITY;
      const { default: jwt } = await import('jsonwebtoken');
      jest.spyOn(jwt, 'sign');

      const {default: LibJwt} = await import('@libs/jwt');
      const paramsGenerateToken = {
        data: {
          id: randomUUID({disableEntropyCache: true}),

        },
      };

      const token = LibJwt.generateToken(paramsGenerateToken);

      expect(token).toEqual(expect.any(String));
      expect(jwt.sign).toHaveBeenCalledWith(paramsGenerateToken.data, JWT_SECURITY, { expiresIn: '7 days' });
    });
  });
});
