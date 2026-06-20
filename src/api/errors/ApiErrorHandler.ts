export const ApiErrors = {
  UNAUTHORIZED: { code: 401, message: "Invalid API Token" },
  INVALID_DATA: { code: 400, message: "Malformed Request Payload" },
  LIMIT_EXCEEDED: { code: 429, message: "Too Many Requests" }
};
