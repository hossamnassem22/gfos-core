export type DependencyNode = {
  file: string;
  imports: string[];
};

export type Violation = {
  rule: string;
  from: string;
  to: string;
};

export type ArchitectureRule = {
  name: string;
  fromLayer: string;
  forbiddenLayers: string[];
};
