import { EventBus } from "./domain/events/EventBus";
import { EventStore } from "./infrastructure/event-store/EventStore";
import { TransactionEngine } from "./application/transactions/TransactionEngine";
import { ProcessPayment } from "./application/use-cases/ProcessPayment";
import { DebtEventHandler } from "./application/handlers/DebtEventHandler";

const eventBus = new EventBus();
const eventStore = new EventStore();

// register handlers
eventBus.register("PaymentProcessed", new DebtEventHandler());
eventBus.register("LedgerEntryRecorded", new DebtEventHandler());

const engine = new TransactionEngine(eventBus, eventStore);
const processPayment = new ProcessPayment(engine);

// TEST RUN
processPayment.execute({
  tenantId: "t1",
  paymentId: "p1",
  debtId: "d1",
  amount: 1000
});
