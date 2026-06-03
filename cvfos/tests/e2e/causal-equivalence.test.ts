import { GenesisRuntime } from '../../apps/genesis-runtime/src/runtime';
import { StateReconstructor } from '../../packages/runtime/src/replay/reconstructor';
import { ReconstructionValidator } from '../../packages/runtime/src/replay/validator';

async function runCausalEquivalenceTest() {
  console.log("🚀 Starting Causal Determinism Experiment...");

  // 1. مرحلة الإنتاج (Live Run)
  const liveSystem = new GenesisRuntime(kernel, persistence);
  await liveSystem.run(mockStream);
  const liveHash = await liveSystem.getSystemIdentity();

  // 2. تدمير الحالة المحلية (State Wipe)
  await GlobalState.wipe();

  // 3. إعادة البناء (Reconstruction)
  const reconstructor = new StateReconstructor(persistence, kernel);
  const reconstructedHash = await reconstructor.reconstruct();

  // 4. الإثبات الرياضي (Proof of Equivalence)
  const isEquivalent = ReconstructionValidator.validate(liveHash, reconstructedHash);
  
  if (isEquivalent) {
    console.log("✅ DETERMINISM PROVED: System is algebraically consistent.");
  }
}
