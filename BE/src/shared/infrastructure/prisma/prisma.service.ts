import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // 기능 : Nest 모듈 초기화 시 Prisma DB 연결을 엽니다.
  async onModuleInit() {
    await this.$connect();
  }

  // 기능 : Nest 모듈 종료 시 Prisma DB 연결을 닫습니다.
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
