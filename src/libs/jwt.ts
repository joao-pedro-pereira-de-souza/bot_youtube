import jwt from 'jsonwebtoken';
import { DefaultResponseParams } from '@interfaces/response';

interface GenerateTokenParams {
    expiresIn?: string,
    data: object,
}
export default class {
  private static getMessageErrorVerifyToken(error_message: string): string{
    switch (error_message) {
    case 'invalid token':
      return 'Token inválido.';

    case 'jwt malformed':
      return 'Token malformado.';

    case 'jwt expired':
      return 'A sessão do token foi expirado.';
    default:
      return 'Ocorreu um erro no token enviado.';
    }
  }

  static verifyToken(token: string): DefaultResponseParams {
    try {
      const data = jwt.verify(token, String(process.env.JWT_SECURITY));
      return {
        success: true,
        data
      };
    } catch (error: any) {
      const message = error.message ? this.getMessageErrorVerifyToken(error.message): 'Ocorreu um erro ao verificar o token.';
      return {
        success: false,
        error,
        message
      };
    }
  }

  static generateToken(params: GenerateTokenParams) {
    const expiresIn = params.expiresIn || '7 days';
    return jwt.sign(params.data,  String(process.env.JWT_SECURITY), { expiresIn });
  }
}
