
import { Express, Request, Response, NextFunction } from 'express';

export default function Errors(app: Express) {
  app.use((error: Error, req: Request, res: Response, next: NextFunction ) => {
    if (error) {
      const response = {
        status: 503,
        message: 'Ocorreu um erro no sistema',
        data: null
      };
      res.status(response.status).json(response);
    }

    next();
  });
}
