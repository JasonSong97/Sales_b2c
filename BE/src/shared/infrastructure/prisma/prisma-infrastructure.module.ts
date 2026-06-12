import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// 역할 : PrismaInfrastructureModule Prisma 서비스 provider를 공유 인프라 모듈로 제공합니다.
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaInfrastructureModule {}
