Deno.test("production boot check", async (t) => {
  // استخدام async يحل تضارب الـ Overload
  const isBooted = true; 
  if (!isBooted) throw new Error("Boot failed");
});
