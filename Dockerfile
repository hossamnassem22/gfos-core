FROM denoland/deno:1.46.0

WORKDIR /app

COPY . .

ENV DENO_ENV=production

RUN deno cache src/main.ts

EXPOSE 3000

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "src/main.ts"]
