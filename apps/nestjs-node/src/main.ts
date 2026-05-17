import "reflect-metadata";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NestFactory } from "@nestjs/core";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { config } from "dotenv";
import { AppModule } from "./app.module.js";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

const port = Number(process.env.PORT) || 8083;

async function bootstrap() {
  const adapter = new FastifyAdapter({});

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      logger:
        process.env.NODE_ENV === "production"
          ? ["error", "warn", "fatal"]
          : ["error", "warn", "fatal", "log"],
    }
  );

  await app.listen(port, "0.0.0.0");
  console.log(`NestJS (Node) listening on http://127.0.0.1:${port}`);
}

void bootstrap();
