import { JournalEntry } from '../phase1_core/domain/ledger-entry';
import { Money } from '../phase1_core/domain/money';
import { Party, PartyRole, PartyRegistry } from '../phase2_parties/domain/party-registry';
import { WorkflowService } from './domain/workflow-service';

// 1. تسجيل الطرف
const citizen = new Party('CIT-001', 'أحمد المواطن', PartyRole.CITIZEN);
PartyRegistry.register(citizen);

// 2. إنشاء قيد جديد
const entry = new JournalEntry('TXN-100');

// 3. ربط الدين بالمواطن
WorkflowService.createDebtEntry(entry, citizen, Money.fromCents(50000n));

console.log("✅ اكتملت دورة العمل بنجاح عبر المراحل الثلاث.");
