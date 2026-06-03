import { DomainEvent } from '../../../event-core/src/models';

export interface GoldenScenario {
  readonly name: string;
  readonly description: string;
  readonly events: DomainEvent[];
  readonly expectedFinalHash: string;
}

export const GoldenStreams: Record<string, GoldenScenario> = {
  PAYROLL_BURST: {
    name: 'Payroll Burst',
    description: 'High volume parallel payments',
    events: [], 
    expectedFinalHash: '0xabc123...' 
  },
  DUPLICATE_INJECTION: {
    name: 'Duplicate Injection',
    description: 'Idempotency check',
    events: [],
    expectedFinalHash: '0xdef456...'
  }
};
