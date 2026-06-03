# استخدام نسخة خفيفة ومستقرة من Node.js
FROM node:20-alpine

# تحديد مسار العمل
WORKDIR /app

# نسخ ملفات التعريف وتثبيت الاعتمادات
COPY package*.json ./
RUN npm install

# نسخ الكود المصدري وبناء المشروع
COPY . .
RUN npm run build

# تشغيل التطبيق في بيئة الإنتاج
CMD ["node", "dist/index.js"]
