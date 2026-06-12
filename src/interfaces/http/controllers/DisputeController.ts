import { Request, Response } from "npm:express";
import { DisputeEngine } from "../../core/dispute/DisputeEngine.ts";

export class DisputeController {
  static async open(req: Request, res: Response) {
    const { agreementId, reason } = req.body;
    const dispute = DisputeEngine.initiateDispute(agreementId, reason);
    
    // هنا يتم حفظ البيانات في قاعدة البيانات
    res.status(201).json({ message: "تم فتح تذكرة نزاع للطرفين", dispute });
  }
}
