import type { ArchitectureRule } from "./types.ts";

export const RULES: ArchitectureRule[] = [
  {
    name: "DOMAIN_ISOLATION",
    fromLayer: "src/domain",
    forbiddenLayers: ["src/application", "src/infrastructure"],
  },
  {
    name: "APPLICATION_CANNOT_USE_INFRASTRUCTURE",
    fromLayer: "src/application",
    forbiddenLayers: ["src/infrastructure"],
  },
];
