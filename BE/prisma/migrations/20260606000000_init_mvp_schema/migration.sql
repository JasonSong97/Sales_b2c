-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('KAKAO', 'GOOGLE', 'NAVER', 'APPLE');

-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('INITIAL_CONTACT', 'IN_DISCUSSION', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "DealLikelihoodStatus" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "NextActionStatus" AS ENUM ('NONE', 'SCHEDULED', 'DUE_SOON', 'OVERDUE', 'DONE');

-- CreateEnum
CREATE TYPE "ProductConnectionTargetType" AS ENUM ('COMPANY', 'CONTACT', 'DEAL');

-- CreateEnum
CREATE TYPE "ProductConnectionType" AS ENUM ('INTERESTED', 'DELIVERED', 'PROPOSED', 'COMPETITOR', 'MAINTENANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "ScheduleSource" AS ENUM ('INTERNAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "TagTargetType" AS ENUM ('COMPANY', 'CONTACT', 'PRODUCT', 'DEAL', 'SCHEDULE', 'MEETING_NOTE');

-- CreateEnum
CREATE TYPE "TagLogAction" AS ENUM ('TAG_CREATED', 'TAG_UPDATED', 'TAG_DELETED', 'TAG_ASSIGNED', 'TAG_UNASSIGNED');

-- CreateEnum
CREATE TYPE "PersonalMemoTargetType" AS ENUM ('COMPANY', 'CONTACT', 'PRODUCT', 'DEAL');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('ADMIN_SENSITIVE_RAW_VIEW', 'ADMIN_USER_STATUS_CHANGED', 'ADMIN_DATA_UPDATED', 'ADMIN_PAYMENT_STATUS_CHANGED', 'USER_EXPORT_WITH_SENSITIVE_DATA', 'TRASH_RESTORE', 'PERMANENT_DELETE');

-- CreateEnum
CREATE TYPE "AuditTargetType" AS ENUM ('USER', 'COMPANY', 'CONTACT', 'PRODUCT', 'DEAL', 'SCHEDULE', 'MEETING_NOTE', 'PERSONAL_MEMO', 'IMPORT_JOB', 'EXPORT_JOB', 'PAYMENT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SCHEDULE_REMINDER', 'DEAL_DUE_REMINDER', 'NEXT_ACTION_REMINDER', 'MEETING_NOTE_GENERATED', 'TRASH_PERMANENT_DELETE_WARNING');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'BROWSER_PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ', 'CANCELED');

-- CreateEnum
CREATE TYPE "BrowserPushSubscriptionStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "ImportTargetType" AS ENUM ('COMPANY', 'CONTACT', 'PRODUCT', 'DEAL');

-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('UPLOADED', 'PREVIEW_READY', 'MAPPING_PENDING', 'MAPPING_READY', 'VALIDATION_FAILED', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ImportRowStatus" AS ENUM ('PENDING', 'VALID', 'VALIDATION_FAILED', 'IMPORTED', 'SKIPPED', 'FAILED');

-- CreateEnum
CREATE TYPE "ExportTargetType" AS ENUM ('COMPANY', 'CONTACT', 'PRODUCT', 'DEAL', 'SCHEDULE', 'MEETING_NOTE', 'WEEKLY_SCHEDULE_REPORT');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('PDF', 'EXCEL');

-- CreateEnum
CREATE TYPE "ExportJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BusinessCardScanStatus" AS ENUM ('UPLOADED', 'OCR_PROCESSING', 'OCR_COMPLETED', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "FileStorageProvider" AS ENUM ('SUPABASE_STORAGE', 'AWS_S3');

-- CreateEnum
CREATE TYPE "AiJobType" AS ENUM ('BUSINESS_CARD_OCR', 'MEETING_NOTE_GENERATION', 'IMPORT_COLUMN_MAPPING');

-- CreateEnum
CREATE TYPE "AiJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ExternalCalendarProvider" AS ENUM ('GOOGLE');

-- CreateEnum
CREATE TYPE "ExternalCalendarConnectionStatus" AS ENUM ('CONNECTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AuthSessionStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AuthDeviceStatus" AS ENUM ('ACTIVE', 'REPLACED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AuthDeviceSlot" AS ENUM ('MOBILE', 'PERSONAL_LAPTOP', 'WORK_LAPTOP');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "permanentDeleteAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOAuthAccount" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "providerEmail" TEXT,
    "accessTokenHash" TEXT,
    "refreshTokenHash" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthDevice" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "deviceSlot" "AuthDeviceSlot" NOT NULL,
    "deviceIdHash" TEXT NOT NULL,
    "label" TEXT,
    "status" "AuthDeviceStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastSeenAt" TIMESTAMP(3),
    "replacedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "authDeviceId" UUID NOT NULL,
    "status" "AuthSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "refreshTokenHash" TEXT,
    "userAgent" TEXT,
    "ipAddressHash" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSetting" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "defaultScheduleReminderMinutes" INTEGER NOT NULL DEFAULT 30,
    "defaultNextActionReminderMinutes" INTEGER NOT NULL DEFAULT 1440,
    "emailNotificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "browserPushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sensitiveSaveWarningEnabled" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "industry" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "permanentDeleteAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "logDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "permanentDeleteAt" TIMESTAMP(3),

    CONSTRAINT "CompanyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyId" UUID,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "position" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "permanentDeleteAt" TIMESTAMP(3),

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "logDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "permanentDeleteAt" TIMESTAMP(3),

    CONSTRAINT "ContactLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "unitPrice" DECIMAL(18,2),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "permanentDeleteAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "logDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "permanentDeleteAt" TIMESTAMP(3),

    CONSTRAINT "ProductLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductConnection" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "targetType" "ProductConnectionTargetType" NOT NULL,
    "targetId" UUID NOT NULL,
    "connectionType" "ProductConnectionType" NOT NULL,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "permanentDeleteAt" TIMESTAMP(3),

    CONSTRAINT "ProductConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyId" UUID,
    "contactId" UUID,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "stage" "DealStage" NOT NULL DEFAULT 'INITIAL_CONTACT',
    "likelihoodStatus" "DealLikelihoodStatus" NOT NULL DEFAULT 'NEUTRAL',
    "likelihoodPercent" INTEGER,
    "nextActionTitle" TEXT,
    "nextActionDueAt" TIMESTAMP(3),
    "nextActionStatus" "NextActionStatus" NOT NULL DEFAULT 'NONE',
    "expectedCloseDate" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "permanentDeleteAt" TIMESTAMP(3),

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealActivityType" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "name" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealActivityType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealActivity" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "typeId" UUID NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "isAutoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "permanentDeleteAt" TIMESTAMP(3),

    CONSTRAINT "DealActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyId" UUID,
    "contactId" UUID,
    "dealId" UUID,
    "title" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "memo" TEXT,
    "source" "ScheduleSource" NOT NULL DEFAULT 'INTERNAL',
    "externalCalendarId" TEXT,
    "externalEventId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "permanentDeleteAt" TIMESTAMP(3),

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleReminder" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "scheduleId" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingNote" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dealId" UUID,
    "companyId" UUID,
    "contactId" UUID,
    "meetingDate" TIMESTAMP(3),
    "companyName" TEXT,
    "contactName" TEXT,
    "department" TEXT,
    "productName" TEXT,
    "stageText" TEXT,
    "details" TEXT,
    "nextPlan" TEXT,
    "requiredAction" TEXT,
    "rawTextCiphertext" TEXT NOT NULL,
    "rawTextKeyVersion" TEXT NOT NULL,
    "aiOutput" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "permanentDeleteAt" TIMESTAMP(3),

    CONSTRAINT "MeetingNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessCardScan" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyId" UUID,
    "contactId" UUID,
    "status" "BusinessCardScanStatus" NOT NULL DEFAULT 'UPLOADED',
    "imageStorageProvider" "FileStorageProvider" NOT NULL DEFAULT 'SUPABASE_STORAGE',
    "imageBucket" TEXT NOT NULL,
    "imageObjectKey" TEXT NOT NULL,
    "imageContentType" TEXT,
    "imageSizeBytes" INTEGER,
    "extractedCompany" TEXT,
    "extractedName" TEXT,
    "extractedDepartment" TEXT,
    "extractedPosition" TEXT,
    "extractedPhone" TEXT,
    "extractedEmail" TEXT,
    "extractedAddress" TEXT,
    "aiOutput" JSONB,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessCardScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagAssignment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "targetType" "TagTargetType" NOT NULL,
    "targetId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TagAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "assignmentId" UUID,
    "action" "TagLogAction" NOT NULL,
    "tagNameSnapshot" TEXT NOT NULL,
    "tagColorSnapshot" TEXT,
    "targetType" "TagTargetType",
    "targetId" UUID,
    "targetTitleSnapshot" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TagLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalMemo" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "targetType" "PersonalMemoTargetType" NOT NULL,
    "targetId" UUID NOT NULL,
    "memoDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT,
    "contentCiphertext" TEXT NOT NULL,
    "contentKeyVersion" TEXT NOT NULL,
    "isSensitive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "permanentDeleteAt" TIMESTAMP(3),

    CONSTRAINT "PersonalMemo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "targetType" TEXT,
    "targetId" UUID,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrowserPushSubscription" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "endpointHash" TEXT NOT NULL,
    "endpointCiphertext" TEXT NOT NULL,
    "p256dhCiphertext" TEXT NOT NULL,
    "authCiphertext" TEXT NOT NULL,
    "contentKeyVersion" TEXT NOT NULL,
    "status" "BrowserPushSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "userAgent" TEXT,
    "deviceLabel" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrowserPushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "targetType" "ImportTargetType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileStorageProvider" "FileStorageProvider",
    "fileBucket" TEXT,
    "fileObjectKey" TEXT,
    "fileContentType" TEXT,
    "fileSizeBytes" INTEGER,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'UPLOADED',
    "aiMapping" JSONB,
    "userMapping" JSONB,
    "resultSummary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJobRow" (
    "id" UUID NOT NULL,
    "importJobId" UUID NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "rawData" JSONB NOT NULL,
    "mappedData" JSONB,
    "status" "ImportRowStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "targetId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportJobRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportJob" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "targetType" "ExportTargetType" NOT NULL,
    "format" "ExportFormat" NOT NULL,
    "status" "ExportJobStatus" NOT NULL DEFAULT 'PENDING',
    "includeSensitiveData" BOOLEAN NOT NULL DEFAULT false,
    "sensitiveWarningAccepted" BOOLEAN NOT NULL DEFAULT false,
    "fileName" TEXT,
    "fileStorageProvider" "FileStorageProvider",
    "fileBucket" TEXT,
    "fileObjectKey" TEXT,
    "fileContentType" TEXT,
    "fileSizeBytes" INTEGER,
    "filter" JSONB,
    "resultSummary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalCalendarConnection" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "ExternalCalendarProvider" NOT NULL,
    "providerAccountId" TEXT,
    "accessTokenHash" TEXT,
    "refreshTokenHash" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "status" "ExternalCalendarConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalCalendarConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiJob" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "AiJobType" NOT NULL,
    "status" "AiJobStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'OPENAI',
    "inputSummary" JSONB,
    "output" JSONB,
    "errorMessage" TEXT,
    "targetType" TEXT,
    "targetId" UUID,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorUserId" UUID,
    "action" "AuditAction" NOT NULL,
    "targetType" "AuditTargetType" NOT NULL,
    "targetId" UUID,
    "targetUserId" UUID,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_permanentDeleteAt_idx" ON "User"("permanentDeleteAt");

-- CreateIndex
CREATE INDEX "UserOAuthAccount_userId_idx" ON "UserOAuthAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOAuthAccount_provider_providerUserId_key" ON "UserOAuthAccount"("provider", "providerUserId");

-- CreateIndex
CREATE INDEX "AuthDevice_userId_idx" ON "AuthDevice"("userId");

-- CreateIndex
CREATE INDEX "AuthDevice_userId_deviceSlot_status_idx" ON "AuthDevice"("userId", "deviceSlot", "status");

-- CreateIndex
CREATE INDEX "AuthDevice_userId_deviceIdHash_idx" ON "AuthDevice"("userId", "deviceIdHash");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE INDEX "AuthSession_authDeviceId_idx" ON "AuthSession"("authDeviceId");

-- CreateIndex
CREATE INDEX "AuthSession_status_idx" ON "AuthSession"("status");

-- CreateIndex
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_key" ON "UserSetting"("userId");

-- CreateIndex
CREATE INDEX "Company_userId_idx" ON "Company"("userId");

-- CreateIndex
CREATE INDEX "Company_userId_name_idx" ON "Company"("userId", "name");

-- CreateIndex
CREATE INDEX "Company_userId_deletedAt_idx" ON "Company"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Company_userId_permanentDeleteAt_idx" ON "Company"("userId", "permanentDeleteAt");

-- CreateIndex
CREATE INDEX "CompanyLog_userId_idx" ON "CompanyLog"("userId");

-- CreateIndex
CREATE INDEX "CompanyLog_companyId_idx" ON "CompanyLog"("companyId");

-- CreateIndex
CREATE INDEX "CompanyLog_userId_logDate_idx" ON "CompanyLog"("userId", "logDate");

-- CreateIndex
CREATE INDEX "CompanyLog_userId_deletedAt_idx" ON "CompanyLog"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "CompanyLog_userId_permanentDeleteAt_idx" ON "CompanyLog"("userId", "permanentDeleteAt");

-- CreateIndex
CREATE INDEX "Contact_userId_idx" ON "Contact"("userId");

-- CreateIndex
CREATE INDEX "Contact_companyId_idx" ON "Contact"("companyId");

-- CreateIndex
CREATE INDEX "Contact_userId_name_idx" ON "Contact"("userId", "name");

-- CreateIndex
CREATE INDEX "Contact_userId_phone_idx" ON "Contact"("userId", "phone");

-- CreateIndex
CREATE INDEX "Contact_userId_email_idx" ON "Contact"("userId", "email");

-- CreateIndex
CREATE INDEX "Contact_userId_deletedAt_idx" ON "Contact"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Contact_userId_permanentDeleteAt_idx" ON "Contact"("userId", "permanentDeleteAt");

-- CreateIndex
CREATE INDEX "ContactLog_userId_idx" ON "ContactLog"("userId");

-- CreateIndex
CREATE INDEX "ContactLog_contactId_idx" ON "ContactLog"("contactId");

-- CreateIndex
CREATE INDEX "ContactLog_userId_logDate_idx" ON "ContactLog"("userId", "logDate");

-- CreateIndex
CREATE INDEX "ContactLog_userId_deletedAt_idx" ON "ContactLog"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "ContactLog_userId_permanentDeleteAt_idx" ON "ContactLog"("userId", "permanentDeleteAt");

-- CreateIndex
CREATE INDEX "Product_userId_idx" ON "Product"("userId");

-- CreateIndex
CREATE INDEX "Product_userId_name_idx" ON "Product"("userId", "name");

-- CreateIndex
CREATE INDEX "Product_userId_category_idx" ON "Product"("userId", "category");

-- CreateIndex
CREATE INDEX "Product_userId_deletedAt_idx" ON "Product"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Product_userId_permanentDeleteAt_idx" ON "Product"("userId", "permanentDeleteAt");

-- CreateIndex
CREATE INDEX "ProductLog_userId_idx" ON "ProductLog"("userId");

-- CreateIndex
CREATE INDEX "ProductLog_productId_idx" ON "ProductLog"("productId");

-- CreateIndex
CREATE INDEX "ProductLog_userId_logDate_idx" ON "ProductLog"("userId", "logDate");

-- CreateIndex
CREATE INDEX "ProductLog_userId_deletedAt_idx" ON "ProductLog"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "ProductLog_userId_permanentDeleteAt_idx" ON "ProductLog"("userId", "permanentDeleteAt");

-- CreateIndex
CREATE INDEX "ProductConnection_userId_idx" ON "ProductConnection"("userId");

-- CreateIndex
CREATE INDEX "ProductConnection_productId_idx" ON "ProductConnection"("productId");

-- CreateIndex
CREATE INDEX "ProductConnection_targetType_targetId_idx" ON "ProductConnection"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "ProductConnection_userId_targetType_targetId_idx" ON "ProductConnection"("userId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "ProductConnection_userId_deletedAt_idx" ON "ProductConnection"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "ProductConnection_userId_permanentDeleteAt_idx" ON "ProductConnection"("userId", "permanentDeleteAt");

-- CreateIndex
CREATE INDEX "Deal_userId_idx" ON "Deal"("userId");

-- CreateIndex
CREATE INDEX "Deal_companyId_idx" ON "Deal"("companyId");

-- CreateIndex
CREATE INDEX "Deal_contactId_idx" ON "Deal"("contactId");

-- CreateIndex
CREATE INDEX "Deal_userId_stage_idx" ON "Deal"("userId", "stage");

-- CreateIndex
CREATE INDEX "Deal_userId_likelihoodStatus_idx" ON "Deal"("userId", "likelihoodStatus");

-- CreateIndex
CREATE INDEX "Deal_userId_nextActionStatus_idx" ON "Deal"("userId", "nextActionStatus");

-- CreateIndex
CREATE INDEX "Deal_userId_nextActionDueAt_idx" ON "Deal"("userId", "nextActionDueAt");

-- CreateIndex
CREATE INDEX "Deal_userId_expectedCloseDate_idx" ON "Deal"("userId", "expectedCloseDate");

-- CreateIndex
CREATE INDEX "Deal_userId_deletedAt_idx" ON "Deal"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Deal_userId_permanentDeleteAt_idx" ON "Deal"("userId", "permanentDeleteAt");

-- CreateIndex
CREATE INDEX "DealActivityType_userId_idx" ON "DealActivityType"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DealActivityType_userId_name_key" ON "DealActivityType"("userId", "name");

-- CreateIndex
CREATE INDEX "DealActivity_userId_idx" ON "DealActivity"("userId");

-- CreateIndex
CREATE INDEX "DealActivity_dealId_idx" ON "DealActivity"("dealId");

-- CreateIndex
CREATE INDEX "DealActivity_typeId_idx" ON "DealActivity"("typeId");

-- CreateIndex
CREATE INDEX "DealActivity_userId_activityDate_idx" ON "DealActivity"("userId", "activityDate");

-- CreateIndex
CREATE INDEX "DealActivity_userId_deletedAt_idx" ON "DealActivity"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "DealActivity_userId_permanentDeleteAt_idx" ON "DealActivity"("userId", "permanentDeleteAt");

-- CreateIndex
CREATE INDEX "Schedule_userId_idx" ON "Schedule"("userId");

-- CreateIndex
CREATE INDEX "Schedule_companyId_idx" ON "Schedule"("companyId");

-- CreateIndex
CREATE INDEX "Schedule_contactId_idx" ON "Schedule"("contactId");

-- CreateIndex
CREATE INDEX "Schedule_dealId_idx" ON "Schedule"("dealId");

-- CreateIndex
CREATE INDEX "Schedule_userId_startAt_idx" ON "Schedule"("userId", "startAt");

-- CreateIndex
CREATE INDEX "Schedule_userId_source_idx" ON "Schedule"("userId", "source");

-- CreateIndex
CREATE INDEX "Schedule_userId_externalEventId_idx" ON "Schedule"("userId", "externalEventId");

-- CreateIndex
CREATE INDEX "Schedule_userId_deletedAt_idx" ON "Schedule"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Schedule_userId_permanentDeleteAt_idx" ON "Schedule"("userId", "permanentDeleteAt");

-- CreateIndex
CREATE INDEX "ScheduleReminder_userId_idx" ON "ScheduleReminder"("userId");

-- CreateIndex
CREATE INDEX "ScheduleReminder_scheduleId_idx" ON "ScheduleReminder"("scheduleId");

-- CreateIndex
CREATE INDEX "ScheduleReminder_userId_remindAt_idx" ON "ScheduleReminder"("userId", "remindAt");

-- CreateIndex
CREATE INDEX "ScheduleReminder_status_idx" ON "ScheduleReminder"("status");

-- CreateIndex
CREATE INDEX "MeetingNote_userId_idx" ON "MeetingNote"("userId");

-- CreateIndex
CREATE INDEX "MeetingNote_dealId_idx" ON "MeetingNote"("dealId");

-- CreateIndex
CREATE INDEX "MeetingNote_companyId_idx" ON "MeetingNote"("companyId");

-- CreateIndex
CREATE INDEX "MeetingNote_contactId_idx" ON "MeetingNote"("contactId");

-- CreateIndex
CREATE INDEX "MeetingNote_userId_meetingDate_idx" ON "MeetingNote"("userId", "meetingDate");

-- CreateIndex
CREATE INDEX "MeetingNote_userId_deletedAt_idx" ON "MeetingNote"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "MeetingNote_userId_permanentDeleteAt_idx" ON "MeetingNote"("userId", "permanentDeleteAt");

-- CreateIndex
CREATE INDEX "BusinessCardScan_userId_idx" ON "BusinessCardScan"("userId");

-- CreateIndex
CREATE INDEX "BusinessCardScan_companyId_idx" ON "BusinessCardScan"("companyId");

-- CreateIndex
CREATE INDEX "BusinessCardScan_contactId_idx" ON "BusinessCardScan"("contactId");

-- CreateIndex
CREATE INDEX "BusinessCardScan_userId_status_idx" ON "BusinessCardScan"("userId", "status");

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- CreateIndex
CREATE INDEX "TagAssignment_userId_idx" ON "TagAssignment"("userId");

-- CreateIndex
CREATE INDEX "TagAssignment_targetType_targetId_idx" ON "TagAssignment"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "TagAssignment_userId_targetType_targetId_idx" ON "TagAssignment"("userId", "targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "TagAssignment_tagId_targetType_targetId_key" ON "TagAssignment"("tagId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "TagLog_userId_idx" ON "TagLog"("userId");

-- CreateIndex
CREATE INDEX "TagLog_tagId_idx" ON "TagLog"("tagId");

-- CreateIndex
CREATE INDEX "TagLog_assignmentId_idx" ON "TagLog"("assignmentId");

-- CreateIndex
CREATE INDEX "TagLog_userId_action_idx" ON "TagLog"("userId", "action");

-- CreateIndex
CREATE INDEX "TagLog_userId_targetType_targetId_idx" ON "TagLog"("userId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "TagLog_userId_occurredAt_idx" ON "TagLog"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "PersonalMemo_userId_idx" ON "PersonalMemo"("userId");

-- CreateIndex
CREATE INDEX "PersonalMemo_targetType_targetId_idx" ON "PersonalMemo"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "PersonalMemo_userId_targetType_targetId_idx" ON "PersonalMemo"("userId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "PersonalMemo_userId_targetType_targetId_memoDate_idx" ON "PersonalMemo"("userId", "targetType", "targetId", "memoDate");

-- CreateIndex
CREATE INDEX "PersonalMemo_userId_deletedAt_idx" ON "PersonalMemo"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "PersonalMemo_userId_permanentDeleteAt_idx" ON "PersonalMemo"("userId", "permanentDeleteAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_scheduledAt_idx" ON "Notification"("userId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");

-- CreateIndex
CREATE INDEX "Notification_targetType_targetId_idx" ON "Notification"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "BrowserPushSubscription_endpointHash_key" ON "BrowserPushSubscription"("endpointHash");

-- CreateIndex
CREATE INDEX "BrowserPushSubscription_userId_idx" ON "BrowserPushSubscription"("userId");

-- CreateIndex
CREATE INDEX "BrowserPushSubscription_userId_status_idx" ON "BrowserPushSubscription"("userId", "status");

-- CreateIndex
CREATE INDEX "ImportJob_userId_idx" ON "ImportJob"("userId");

-- CreateIndex
CREATE INDEX "ImportJob_userId_targetType_idx" ON "ImportJob"("userId", "targetType");

-- CreateIndex
CREATE INDEX "ImportJob_userId_status_idx" ON "ImportJob"("userId", "status");

-- CreateIndex
CREATE INDEX "ImportJob_createdAt_idx" ON "ImportJob"("createdAt");

-- CreateIndex
CREATE INDEX "ImportJobRow_importJobId_idx" ON "ImportJobRow"("importJobId");

-- CreateIndex
CREATE INDEX "ImportJobRow_importJobId_status_idx" ON "ImportJobRow"("importJobId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ImportJobRow_importJobId_rowNumber_key" ON "ImportJobRow"("importJobId", "rowNumber");

-- CreateIndex
CREATE INDEX "ExportJob_userId_idx" ON "ExportJob"("userId");

-- CreateIndex
CREATE INDEX "ExportJob_userId_targetType_idx" ON "ExportJob"("userId", "targetType");

-- CreateIndex
CREATE INDEX "ExportJob_userId_status_idx" ON "ExportJob"("userId", "status");

-- CreateIndex
CREATE INDEX "ExportJob_createdAt_idx" ON "ExportJob"("createdAt");

-- CreateIndex
CREATE INDEX "ExternalCalendarConnection_userId_idx" ON "ExternalCalendarConnection"("userId");

-- CreateIndex
CREATE INDEX "ExternalCalendarConnection_status_idx" ON "ExternalCalendarConnection"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalCalendarConnection_userId_provider_key" ON "ExternalCalendarConnection"("userId", "provider");

-- CreateIndex
CREATE INDEX "AiJob_userId_idx" ON "AiJob"("userId");

-- CreateIndex
CREATE INDEX "AiJob_userId_type_idx" ON "AiJob"("userId", "type");

-- CreateIndex
CREATE INDEX "AiJob_userId_status_idx" ON "AiJob"("userId", "status");

-- CreateIndex
CREATE INDEX "AiJob_targetType_targetId_idx" ON "AiJob"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_targetUserId_idx" ON "AuditLog"("targetUserId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "UserOAuthAccount" ADD CONSTRAINT "UserOAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthDevice" ADD CONSTRAINT "AuthDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_authDeviceId_fkey" FOREIGN KEY ("authDeviceId") REFERENCES "AuthDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyLog" ADD CONSTRAINT "CompanyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyLog" ADD CONSTRAINT "CompanyLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactLog" ADD CONSTRAINT "ContactLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactLog" ADD CONSTRAINT "ContactLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductLog" ADD CONSTRAINT "ProductLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductLog" ADD CONSTRAINT "ProductLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductConnection" ADD CONSTRAINT "ProductConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductConnection" ADD CONSTRAINT "ProductConnection_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealActivityType" ADD CONSTRAINT "DealActivityType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealActivity" ADD CONSTRAINT "DealActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealActivity" ADD CONSTRAINT "DealActivity_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealActivity" ADD CONSTRAINT "DealActivity_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "DealActivityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleReminder" ADD CONSTRAINT "ScheduleReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleReminder" ADD CONSTRAINT "ScheduleReminder_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNote" ADD CONSTRAINT "MeetingNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNote" ADD CONSTRAINT "MeetingNote_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNote" ADD CONSTRAINT "MeetingNote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNote" ADD CONSTRAINT "MeetingNote_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessCardScan" ADD CONSTRAINT "BusinessCardScan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessCardScan" ADD CONSTRAINT "BusinessCardScan_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessCardScan" ADD CONSTRAINT "BusinessCardScan_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagAssignment" ADD CONSTRAINT "TagAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagAssignment" ADD CONSTRAINT "TagAssignment_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagLog" ADD CONSTRAINT "TagLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalMemo" ADD CONSTRAINT "PersonalMemo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrowserPushSubscription" ADD CONSTRAINT "BrowserPushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJobRow" ADD CONSTRAINT "ImportJobRow_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportJob" ADD CONSTRAINT "ExportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCalendarConnection" ADD CONSTRAINT "ExternalCalendarConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiJob" ADD CONSTRAINT "AiJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
