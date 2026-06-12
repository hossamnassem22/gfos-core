import express from 'express';
import { commandMiddleware } from '../context/CommandContextMiddleware';
import { recordSaleHandler } from './SaleController';

const app = express();
app.use(express.json());

// تطبيق الـ Middleware على كل المسارات
app.use(commandMiddleware);

app.post('/sales', recordSaleHandler);

app.listen(3000, () => console.log('System OS running on port 3000'));
