---------------- MODULE CFPS_Core ----------------
EXTENDS Integers, Sequences, FiniteSets, TLC

CONSTANT Accounts, MaxEvents

VARIABLES 
    committed, 
    pending, 
    causal_graph, 
    ledger_state

vars == <<committed, pending, causal_graph, ledger_state>>

TypeOK == 
    /\ committed \subseteq 1..MaxEvents
    /\ pending \subseteq 1..MaxEvents
    /\ ledger_state \in [Accounts -> Int]

DoubleEntry == 
    \A e \in committed : Sum(e.lines, debit) = Sum(e.lines, credit)

Safety == 
    /\ DoubleEntry
    /\ \A a \in Accounts : ledger_state[a] >= 0

Init == 
    /\ committed = {}
    /\ pending = {}
    /\ causal_graph = [e \in {} |-> {}]
    /\ ledger_state = [a \in Accounts |-> 0]
===================================================
