FROM denoland/deno:2.0.0

WORKDIR /app

COPY . .
RUN deno cache src/interfaces/main.ts

EXPOSE 3011

CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "src/interfaces/main.ts"]
