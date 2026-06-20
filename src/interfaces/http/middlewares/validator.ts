export function validate(schema: any) {
  return async (req: any, rep: any) => {
    const body = req.body;

    for (const key of Object.keys(schema)) {
      if (schema[key].required && !body?.[key]) {
        return rep.code(400).send({
          error: "VALIDATION_ERROR",
          field: key
        });
      }
    }
  };
}
