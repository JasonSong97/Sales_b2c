import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./shared/presentation/filters/http-exception.filter";

// 기능 : Nest 애플리케이션을 생성하고 전역 파이프, 필터, CORS, 포트를 설정해 서버를 실행합니다.
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: [
      configService.get<string>("USER_WEB_ORIGIN") ?? "http://localhost:5173",
      configService.get<string>("ADMIN_WEB_ORIGIN") ?? "http://localhost:5174",
    ],
    credentials: true,
  });

  const port = Number(configService.get<string>("PORT") ?? 3000);
  await app.listen(port);
}

void bootstrap();
