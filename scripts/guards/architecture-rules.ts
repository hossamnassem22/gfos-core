export const ARCHITECTURE_RULES = {
  domain: {
    cannotImportFrom: [
      "infrastructure",
      "interfaces",
      "application"
    ]
  },

  application: {
    cannotImportFrom: [
      "infrastructure"
    ]
  },

  interfaces: {
    cannotImportFrom: [
      "infrastructure" // 🚨 أهم rule عندك الآن
    ]
  },

  infrastructure: {
    cannotImportFrom: []
  }
};
