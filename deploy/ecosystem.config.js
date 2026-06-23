module.exports = {
  apps: [{
    name: "selfni-core",
    script: "src/interfaces/http/server.ts",
    interpreter: "deno",
    interpreterArgs: "run --allow-all",
    env: {
      NODE_ENV: "production",
      JWT_SECRET: "your-secret-key"
    }
  }]
}
