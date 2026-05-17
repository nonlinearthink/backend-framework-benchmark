import { Elysia } from "elysia";

const port = Number(process.env.PORT);
const hostname = process.env.HOST;

const app = new Elysia()
  .get("/", () => "Hello Backend Framework Benchmark!")
  .listen({ port, hostname });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
