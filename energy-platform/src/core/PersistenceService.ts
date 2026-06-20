import * as fs from 'fs';
import * as path from 'path';

// تحديد مسار التخزين للعمل في بيئة الخادم (Node.js)
const STORAGE_FILE = path.join(__dirname, '../../platform_data.json');

export const saveState = (data: any) => {
  // التحقق مما إذا كنا في بيئة خادم (Node.js)
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    console.log("[SERVER] Data persisted to file system.");
  } else {
    // حالة المتصفح (Browser)
    localStorage.setItem('platform_data', JSON.stringify(data));
  }
};

export const loadState = () => {
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    if (!fs.existsSync(STORAGE_FILE)) return { orders: [], audit: [] };
    return JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf-8'));
  } else {
    const data = localStorage.getItem('platform_data');
    return data ? JSON.parse(data) : { orders: [], audit: [] };
  }
};
