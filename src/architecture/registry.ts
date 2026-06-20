export const ARCHITECTURE_RULES = {
  forbiddenImports: [
    {
      id: "NO_SECURITY_TOKEN_LEAKAGE",
      pattern: "infrastructure/security/TokenService",
      message: "TokenService is forbidden outside infrastructure/security boundary",
    },
    {
      id: "NO_DIRECT_DATABASE_ACCESS",
      pattern: "infrastructure/database",
      message: "Direct database access is forbidden outside infrastructure layer",
    },
  ],

  allowedLayers: {
    domain: ["src/domain"],
    application: ["src/application"],
    infrastructure: ["src/infrastructure"],
    interfaces: ["src/interfaces"],
    core: ["src/core"],
  },
};
