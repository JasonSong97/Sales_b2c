import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const systemDealActivityTypes = [
  "기타 기록",
  "전화",
  "미팅",
  "이메일",
  "단계변경",
  "회의록연결",
] as const;

async function seedDealActivityTypes() {
  for (const name of systemDealActivityTypes) {
    const existingType = await prisma.dealActivityType.findFirst({
      where: {
        userId: null,
        name,
      },
    });

    if (!existingType) {
      await prisma.dealActivityType.create({
        data: {
          name,
          isSystem: true,
        },
      });
    }
  }
}

async function main() {
  await seedDealActivityTypes();
}

void main().finally(async () => {
  await prisma.$disconnect();
});
