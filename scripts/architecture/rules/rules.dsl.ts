export const ARCHITECTURE_RULES_V1 = {
  version: "1.0.0",

  layers: [
    "domain",
    "application",
    "interfaces",
    "infrastructure"
  ],

  forbiddenEdges: [
    {
      from: "domain",
      to: ["application", "interfaces", "infrastructure"]
    },
    {
      from: "application",
      to: ["infrastructure"]
    },
    {
      from: "interfaces",
      to: ["infrastructure"]
    }
  ]
};
