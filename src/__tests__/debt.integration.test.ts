export const testDebtIntegration = async () => {
  try {
    // محاكاة عملية تكامل
    const result = await Promise.resolve(true);
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Integration failed:", error.message);
    }
    throw error;
  }
};

export const testFailureScenario = async () => {
  try {
    throw new Error("Simulated Failure");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }
    return "Unknown failure";
  }
};
