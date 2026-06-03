import { PartyRegistry, Party, PartyRole } from './domain/party-registry';

PartyRegistry.register(new Party('P001', 'صاحب المحل', PartyRole.OWNER));
PartyRegistry.register(new Party('P002', 'مواطن', PartyRole.CITIZEN));
console.log("✅ المرحلة الثانية تعمل بنجاح.");
