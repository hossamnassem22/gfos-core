---------------- MODULE Execution ----------------
EXTENDS Scheduler

ApplyLedgerTransition(state, event) ==
    [state EXCEPT ![event.debitAcc] = state[event.debitAcc] - event.amount,
                  ![event.creditAcc] = state[event.creditAcc] + event.amount]

CommitEvent(e) ==
    /\ e = NextEventToCommit
    /\ ledger_state' = ApplyLedgerTransition(ledger_state, e)
    /\ committed' = committed \cup {e}
    /\ pending' = pending \ {e}
    /\ linear_order' = Append(linear_order, e)

===================================================
