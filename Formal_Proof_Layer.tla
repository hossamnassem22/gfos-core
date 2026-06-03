---------------- MODULE Formal_Proof_Layer ----------------
EXTENDS Execution_Kernel

THEOREM SafetyTheorem == Init /\ [][NextState]_vars => []Safety

THEOREM LivenessTheorem == 
    /\ Safety 
    /\ WF_vars(NextState) 
    => \A e \in pending : <>(e \in committed)

THEOREM ReplayConsistency ==
    \A t1, t2 \in ValidTraces : t1 = t2 => StateHash(t1) = StateHash(t2)
===================================================
