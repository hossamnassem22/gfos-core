FROM denoland/deno:latest

WORKDIR /app

# Copy deno.json and deno.lock for dependency caching
COPY deno.json deno.lock* ./

# Cache dependencies
RUN deno cache --reload src/server.ts

# Copy source code
COPY src ./src
COPY scripts ./scripts
COPY tests ./tests

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD deno run --allow-net https://deno.land/std@0.177.0/http/file_server.ts --check http://localhost:3000/health || exit 1

# Run the server
CMD ["deno", "run", "--allow-net", "--allow-read", "src/server.ts"]
