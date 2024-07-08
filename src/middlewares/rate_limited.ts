import { Router, Request, Response } from 'express';
import {rateLimit} from 'express-rate-limit';

function handler(req: Request, res: Response) {
  const response = {
    status: 429,
    message: 'Limite de taxa excedido. Tente novamente mais tarde.',
    data: null
  };
  return res.status(response.status).json(response);
}

export const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_TIME),
  limit: Number(process.env.RATE_LIMIT_LIMIT_REQUESTS),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler

});

const MiddlewareRateLimit = (app: Router) => {
  app.use(limiter);
};

export default MiddlewareRateLimit;
