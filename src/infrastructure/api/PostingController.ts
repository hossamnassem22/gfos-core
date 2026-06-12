import { Request, Response } from 'express';

export class PostingController {
  /**
   * معالجة طلبات الترحيل المالي.
   * تم استبدال 'any' بـ Request و Response لضمان السلامة البرمجية.
   */
  async handlePost(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      // منطق الترحيل
      res.status(200).json({ status: 'posted', data });
    } catch (e: unknown) {
      if (e instanceof Error) {
        res.status(500).json({ error: e.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
