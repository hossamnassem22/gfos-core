import { Container } from './core/di/Container.ts';
import { EventBus } from './core/events/bus/EventBus.ts';
import { TerminalUI } from './ui/TerminalUI.ts';

const container = new Container();
const eventBus = new EventBus();

// نظام المراقبة الصامت (يعلمك فقط عند وجود جديد)
eventBus.subscribe('*', (e) => console.log(`\n[نظام]: وصل تحديث جديد: ${e.type} ->`, JSON.stringify(e.payload)));

const ui = new TerminalUI(eventBus);

console.log("--- المنصة جاهزة للتشغيل الميداني ---");
console.log("استخدم الأمر التالي لإرسال طلب: ui.simulateRetailerOrder('REQ-001', 'التاجر محمد', 'غاز');");

// نجعل الـ UI متاحاً في النطاق العالمي للتجربة
(global as any).ui = ui;
