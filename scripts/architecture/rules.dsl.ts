export const ARCH_RULES_V1 = {
  version: "1.0.0",
  layers: {
    domain: {
      path: "src/domain",
      cannotImport: ["application", "infrastructure", "interfaces"]
    },

    application: {
      path: "src/application",
      cannotImport: ["infrastructure"],
      canOnlyImportFrom: ["domain"]
    },

    interfaces: {
      path: "src/interfaces",
      cannotImport: ["infrastructure"],
      canImport: ["application", "domain"]
    },

    infrastructure: {
      path: "src/infrastructure",
      cannotImport: []
    }
  }
};
