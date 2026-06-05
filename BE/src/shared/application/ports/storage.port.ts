export const STORAGE_PORT = Symbol("STORAGE_PORT");

export type StorageProviderName = "supabase";

export interface StoredObject {
  storageProvider: StorageProviderName;
  bucket: string;
  objectKey: string;
  contentType: string | null;
  sizeBytes: number | null;
  fileName: string | null;
}

export interface UploadObjectInput {
  bucket: string;
  objectKey: string;
  body: Buffer | Uint8Array | ArrayBuffer;
  contentType?: string;
  fileName?: string;
  upsert?: boolean;
}

export interface CreateSignedDownloadUrlInput {
  bucket: string;
  objectKey: string;
  expiresInSeconds: number;
}

export interface SignedDownloadUrl {
  url: string;
  expiresInSeconds: number;
}

export interface StoragePort {
  uploadObject(input: UploadObjectInput): Promise<StoredObject>;
  createSignedDownloadUrl(
    input: CreateSignedDownloadUrlInput
  ): Promise<SignedDownloadUrl>;
  removeObject(bucket: string, objectKey: string): Promise<void>;
}
