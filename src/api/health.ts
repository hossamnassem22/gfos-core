import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};
