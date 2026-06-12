import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';

export const setupApi = (app: any) => {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as any).tenantId = req.headers['x-tenant-id'];
    (req as any).userId = req.headers['x-user-id'] as string || uuid();
    next();
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.post('/transfer', async (req: Request, res: Response) => {
    try {
      const _tenantId = (req as any).tenantId;
      res.status(200).json({ success: true });
    } catch (e: unknown) {
      if (e instanceof Error) {
        res.status(500).json({ error: e.message });
      } else {
        res.status(500).json({ error: "Unknown error" });
      }
    }
  });
};
