import { AuthSessionStatus, UserStatus } from "@prisma/client";
import {
  type DeletedUserRecord,
  type UpdateUserSettingInput,
  type UserRepository,
  type UserSettingRecord,
} from "@/modules/user/application/ports/user.repository";
import { DeletedResourceError } from "@/shared/domain/errors/common.errors";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getOrCreateSetting(userId: string): Promise<UserSettingRecord> {
    const setting = await this.prismaService.userSetting.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    return this.mapSetting(setting);
  }

  async updateSetting(
    userId: string,
    input: UpdateUserSettingInput
  ): Promise<UserSettingRecord> {
    const data = this.mapSettingUpdate(input);
    const setting = await this.prismaService.userSetting.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return this.mapSetting(setting);
  }

  async softDeleteUserAndRevokeSessions(
    userId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeletedUserRecord> {
    return this.prismaService.$transaction(async (transaction) => {
      const user = await transaction.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.status === UserStatus.DELETED || user.deletedAt) {
        throw new DeletedResourceError("write", "User is already deleted");
      }

      const deletedUser = await transaction.user.update({
        where: { id: userId },
        data: {
          status: UserStatus.DELETED,
          deletedAt: now,
          permanentDeleteAt,
        },
      });

      await transaction.authSession.updateMany({
        where: {
          userId,
          status: AuthSessionStatus.ACTIVE,
        },
        data: {
          status: AuthSessionStatus.REVOKED,
          revokedAt: now,
        },
      });

      return {
        id: deletedUser.id,
        status: "DELETED",
        deletedAt: now,
        permanentDeleteAt,
      };
    });
  }

  private mapSetting(setting: {
    readonly sensitiveSaveWarningEnabled: boolean;
  }): UserSettingRecord {
    return {
      sensitiveWarningEnabled: setting.sensitiveSaveWarningEnabled,
    };
  }

  private mapSettingUpdate(
    input: UpdateUserSettingInput
  ): {
    sensitiveSaveWarningEnabled?: boolean;
  } {
    const data: {
      sensitiveSaveWarningEnabled?: boolean;
    } = {};

    if (input.sensitiveWarningEnabled !== undefined) {
      data.sensitiveSaveWarningEnabled = input.sensitiveWarningEnabled;
    }

    return data;
  }
}

