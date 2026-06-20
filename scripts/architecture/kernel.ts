export type Layer =
  | "domain"
  | "application"
  | "interfaces"
  | "infrastructure";

export interface RuleViolation {
  from: Layer;
  to: Layer;
  file: string;
  importPath: string;
}

export interface ArchitectureRule {
  name: string;
  from: Layer;
  forbid: Layer[];
}

export const RULES: ArchitectureRule[] = [
  {
    name: "Domain Isolation",
    from: "domain",
    forbid: ["application", "interfaces", "infrastructure"],
  },
  {
    name: "Application Boundaries",
    from: "application",
    forbid: ["infrastructure"],
  },
  {
    name: "Interfaces Boundaries",
    from: "interfaces",
    forbid: ["infrastructure"],
  },
];
