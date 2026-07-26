import "dotenv/config";
import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";
import { TrpcModule } from "./trpc/trpc.module.js";

const DEFAULT_PORT = 4000;
const DEFAULT_CORS_ORIGIN = "http://localhost:3000";

function parseCorsOrigins(rawOrigins: string): string[] {
  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: parseCorsOrigins(process.env.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN),
    credentials: true,
  });

  TrpcModule.applyMiddleware(app);

  const port = process.env.PORT ?? DEFAULT_PORT;
  await app.listen(port);
}

void bootstrap();
