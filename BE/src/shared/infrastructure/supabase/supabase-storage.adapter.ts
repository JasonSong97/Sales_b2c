import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  type CreateSignedDownloadUrlInput,
  type SignedDownloadUrl,
  type StoragePort,
  type StoredObject,
  type UploadObjectInput,
} from "@/shared/application/ports/storage.port";
import { getRequiredConfig } from "./supabase-env";

@Injectable()
export class SupabaseStorageAdapter implements StoragePort {
  private client: SupabaseClient | null = null;

  constructor(private readonly configService: ConfigService) {}

  async uploadObject(input: UploadObjectInput): Promise<StoredObject> {
    const { error } = await this.getClient()
      .storage.from(input.bucket)
      .upload(input.objectKey, input.body, {
        contentType: input.contentType,
        upsert: input.upsert ?? false,
      });

    if (error) {
      throw new Error(`Supabase storage upload failed: ${error.message}`);
    }

    return {
      storageProvider: "supabase",
      bucket: input.bucket,
      objectKey: input.objectKey,
      contentType: input.contentType ?? null,
      sizeBytes: this.getSizeBytes(input.body),
      fileName: input.fileName ?? null,
    };
  }

  async createSignedDownloadUrl(
    input: CreateSignedDownloadUrlInput
  ): Promise<SignedDownloadUrl> {
    const { data, error } = await this.getClient()
      .storage.from(input.bucket)
      .createSignedUrl(input.objectKey, input.expiresInSeconds);

    if (error) {
      throw new Error(`Supabase signed URL creation failed: ${error.message}`);
    }

    return {
      url: data.signedUrl,
      expiresInSeconds: input.expiresInSeconds,
    };
  }

  async removeObject(bucket: string, objectKey: string): Promise<void> {
    const { error } = await this.getClient()
      .storage.from(bucket)
      .remove([objectKey]);

    if (error) {
      throw new Error(`Supabase storage remove failed: ${error.message}`);
    }
  }

  private getClient(): SupabaseClient {
    if (!this.client) {
      const supabaseUrl = getRequiredConfig(this.configService, "SUPABASE_URL");
      const serviceRoleKey = getRequiredConfig(
        this.configService,
        "SUPABASE_SERVICE_ROLE_KEY"
      );

      this.client = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }

    return this.client;
  }

  private getSizeBytes(body: Buffer | Uint8Array | ArrayBuffer): number {
    if (body instanceof ArrayBuffer) {
      return body.byteLength;
    }

    return body.byteLength;
  }
}
