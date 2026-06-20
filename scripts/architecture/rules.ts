export type RuleViolation = {
  file: string;
  rule: string;
  from: string;
  to: string;
  importPath: string;
};

export type ArchitectureRule = {
  name: string;
  from: string[];
  deny: string[];
  allow?: string[];
};

export const ARCHITECTURE_RULES: ArchitectureRule[] = [
  {
    name: "Domain Isolation",
    from: ["domain"],
    deny: ["infrastructure", "interfaces", "application"],
  },
  {
    name: "Application Isolation",
    from: ["application"],
    deny: ["infrastructure"],
  },
  {
    name: "Interfaces Isolation",
    from: ["interfaces"],
    deny: ["infrastructure"],
  },
  {
    name: "Infrastructure Dependency Rule",
    from: ["infrastructure"],
    deny: [],
  },
];
