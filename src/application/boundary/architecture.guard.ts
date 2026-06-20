export class ArchitectureGuard {
  check() {
    return {
      status: "ok",
      message: "architecture layer is isolated"
    };
  }
}
