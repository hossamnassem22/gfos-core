import { Request, Response, NextFunction } from "npm:express";

export const validateAgreement = (req: Request, res: Response, next: NextFunction) => {
  const { creditorId, debtorName, totalAmountCents, policy } = req.body;

  if (!creditorId || !debtorName || !totalAmountCents || !policy) {
    return res.status(400).json({ error: "بيانات الاتفاقية ناقصة، يرجى مراجعة المدخلات" });
  }

  next();
};
