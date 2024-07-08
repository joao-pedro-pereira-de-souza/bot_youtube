import { Express } from 'express';

import {name, version, description} from '@root/package.json';
export default function Routes(app: Express){
  app.get('/', (req, res) => {
    res.status(200).json({
      data: {
        name,
        version,
        description
      }
    });
  });
}
