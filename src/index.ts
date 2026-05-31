import { app } from './interfaces/http/api';
import { runMigrations } from './infrastructure/database/migrations';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    console.log('🔧 GFOS Core - Phase 0: Foundation');
    console.log('='.repeat(50));

    // Run migrations
    console.log('\n📊 Setting up database schema...');
    await runMigrations();

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 API Server running on port ${PORT}`);
      console.log(`\n📝 Test with:`);
      console.log(`   curl -X POST http://localhost:${PORT}/debts \\`);
      console.log(`     -H 'x-tenant-id: your-tenant-id' \\`);
      console.log(`     -H 'Content-Type: application/json' \\`);
      console.log(`     -d '{"customerId": "customer-id", "principal": 100000}'`);
      console.log(`\n💡 Check ledger balance:`);
      console.log(`   curl http://localhost:${PORT}/ledger/balance \\`);
      console.log(`     -H 'x-tenant-id: your-tenant-id'`);
    });
  } catch (error) {
    console.error('❌ Bootstrap failed:', error);
    process.exit(1);
  }
}

bootstrap();
