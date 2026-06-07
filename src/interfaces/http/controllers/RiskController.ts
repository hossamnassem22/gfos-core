import { Request, Response } from "npm:express";
import { RiskEngine } from "../../core/risk/RiskEngine.ts";

export class RiskController {
  static async checkDebtor(req: Request, res: Response) {
    const { debtorPhone } = req.query;
    
    // محاكاة جلب سجلات المدين
    const history = []; // هنا سيتم الربط بقاعدة البيانات لجلب سوابق المدين
    const score = RiskEngine.calculateTrustScore(history);
    
    res.json({ debtorPhone, trustScore: score, status: score > 70 ? "LOW_RISK" : "HIGH_RISK" });
  }
}
