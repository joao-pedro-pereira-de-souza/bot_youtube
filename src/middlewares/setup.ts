import express from 'express';
import cors from 'cors';


import Routes from '@routes/index';
import Errors from '@middlewares/errors';
import RateLimited from '@middlewares/rate_limited';

const app = express();

app.use(express.json());
app.use(cors());


if (process.env.NODE_ENV !== 'test') {
  RateLimited(app);
}

Routes(app);

Errors(app);

export default app;
