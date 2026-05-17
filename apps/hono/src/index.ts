import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Backend Framework Benchmark!");
});

export default app;
export const port = process.env.PORT;
