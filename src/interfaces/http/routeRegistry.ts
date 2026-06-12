type RouteKey = string;

class RouteRegistry {
  private routes = new Map<RouteKey, string>();

  register(method: string, path: string, file: string) {
    const key = `${method.toUpperCase()} ${path}`;

    if (this.routes.has(key)) {
      throw new Error(
        `DUPLICATE ROUTE DETECTED:\n${key}\n- ${this.routes.get(key)}\n- ${file}`
      );
    }

    this.routes.set(key, file);
  }

  dump() {
    return Array.from(this.routes.entries());
  }
}

export const routeRegistry = new RouteRegistry();
