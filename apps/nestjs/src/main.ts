import { NestFactory } from "@nestjs/core";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";

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

  await app.listen(process.env.PORT ?? 8080, "0.0.0.0");
}

void bootstrap();
