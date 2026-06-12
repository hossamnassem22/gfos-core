---------------- MODULE Scheduler ----------------
EXTENDS CFPS_Model

SchedulerKey(e) == <<CausalDepth(e), e>> 

ready_events == {e \in pending : \A p \in causal_graph[e] : p \in committed}

NextEventToCommit ==
    LET ready == ready_events
    IN IF ready = {} THEN NULL 
       ELSE CHOOSE e \in ready : \A other \in ready : SchedulerKey(e) <= SchedulerKey(other)

===================================================
