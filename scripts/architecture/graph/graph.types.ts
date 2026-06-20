export type ModuleType =
  | "domain"
  | "application"
  | "interfaces"
  | "infrastructure";

export interface GraphNode {
  id: string;
  type: ModuleType;
  path: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  fromType: ModuleType;
  toType: ModuleType;
  file: string;
  line?: number;
}

export interface ArchitectureGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}
