FROM denoland/deno:alpine-1.40.0
WORKDIR /app
COPY . .
RUN deno cache src/main.ts
EXPOSE 8080
CMD ["run", "--allow-net", "--allow-env", "src/main.ts"]
