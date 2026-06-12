import express from 'express';
import { DailyReportProjection } from '../projections/DailyReportProjection';
import { CommandContextManager } from '../context/CommandContext';

export const dashboardRouter = express.Router();

// نفترض أن الـ dailyReport متاح هنا
// const dailyReport = new DailyReportProjection();

dashboardRouter.get('/summary', async (req, res) => {
  const tenantId = CommandContextManager.tenantId();
  // const revenue = dailyReport.getDailyRevenue(tenantId);
  
  res.json({
    date: new Date().toISOString().split('T')[0],
    totalRevenue: 0, // هنا ستوضع القيمة من الـ projection
    status: "Active"
  });
});
