export const ArchitectureRules = {
  domain: {
    cannotImport: ["infrastructure", "interfaces", "application"],
  },
  application: {
    cannotImport: ["infrastructure"],
  },
  interfaces: {
    cannotImport: ["infrastructure"], // ممنوع direct access
    mustUse: "ports",
  },
};
