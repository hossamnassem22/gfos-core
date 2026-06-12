---------------- MODULE Execution_Kernel ----------------
EXTENDS Deterministic_Scheduler

ApplyLedgerTransition(state, event) ==
    [state EXCEPT ![event.debitAcc] = state[event.debitAcc] - event.amount,
                  ![event.creditAcc] = state[event.creditAcc] + event.amount]

NextState ==
    \E e \in {NextEventToCommit} :
        /\ e /= NULL
        /\ ledger_state' = ApplyLedgerTransition(ledger_state, e)
        /\ committed' = committed \cup {e}
        /\ pending' = pending \ {e}
        /\ UNCHANGED <<causal_graph>>
===================================================
