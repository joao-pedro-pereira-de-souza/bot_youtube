import { Request, Response, NextFunction } from 'express';
import LibJwt from '@libs/jwt';

function Authentication() {
  return (req: Request, res: Response, next: NextFunction) => {

    const token = req.headers['authorization'];

    if (!token) {

      const response = {
        status: 401,
        message: 'Token de autenticação não encontrado.',
        data: null
      };
      return res.status(response.status).json(response);
    }

    const [bearer, hash] = token.split(' ');

    if (!bearer || !hash) {
      const response = {
        status: 401,
        message: 'Token malformado.',
        data: null
      };
      return res.status(response.status).json(response);

    }

    const responseVerify = LibJwt.verifyToken(hash);
    if (!responseVerify.success) {

      const data: any = { message: responseVerify.message };
      if (responseVerify.error.message === 'jwt expired') {
        data.expired_at = responseVerify.error?.expiredAt;
        data.is_token_expired = true;


      }

      const response = {
        status: 401,
        message: 'Token malformado.',
        data
      };
      return res.status(response.status).json(response);
    }

    next();
  };
}


export default Authentication;
