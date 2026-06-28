---------------- MODULE Deterministic_Scheduler ----------------
EXTENDS CFPS_Core

CausalDepth(e) == 
    IF causal_graph[e] = {} THEN 0 
    ELSE 1 + Max({CausalDepth(p) : p \in causal_graph[e]})

SchedulerKey(e) == <<CausalDepth(e), e>> 

ready_events == {e \in pending : \A p \in causal_graph[e] : p \in committed}

NextEventToCommit ==
    LET ready == ready_events
    IN IF ready = {} THEN NULL 
       ELSE Head(SortBy(SchedulerKey, ready))
===================================================
