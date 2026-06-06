import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  BusinessCardOcrInput,
  BusinessCardOcrPort,
  BusinessCardOcrResult,
  ExtractedBusinessCardFields,
} from "@/modules/business-card/application/ports/business-card-ocr.port";
import { OcrProviderUnavailableError } from "@/modules/business-card/domain/business-card.errors";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_OCR_MODEL = "gpt-4.1-mini";

const FIELD_NAMES = [
  "companyName",
  "contactName",
  "department",
  "position",
  "phone",
  "email",
  "address",
] as const;

type FieldName = (typeof FIELD_NAMES)[number];

@Injectable()
export class OpenAiBusinessCardOcrAdapter implements BusinessCardOcrPort {
  constructor(private readonly configService: ConfigService) {}

  async extractBusinessCard(
    input: BusinessCardOcrInput
  ): Promise<BusinessCardOcrResult> {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");

    if (!apiKey) {
      throw new OcrProviderUnavailableError("OPENAI_API_KEY is not configured");
    }

    const model =
      this.configService.get<string>("OPENAI_MODEL_BUSINESS_CARD_OCR") ||
      this.configService.get<string>("OPENAI_MODEL") ||
      DEFAULT_OPENAI_OCR_MODEL;
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content:
              "You extract Korean business card fields. Return JSON only with the exact requested fields.",
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Extract companyName, contactName, department, position, phone, email, and address. Use null when unknown.",
              },
              {
                type: "input_image",
                image_url: toDataUrl(input.image.contentType, input.image.buffer),
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "business_card_ocr_fields",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: FIELD_NAMES,
              properties: {
                companyName: { type: ["string", "null"] },
                contactName: { type: ["string", "null"] },
                department: { type: ["string", "null"] },
                position: { type: ["string", "null"] },
                phone: { type: ["string", "null"] },
                email: { type: ["string", "null"] },
                address: { type: ["string", "null"] },
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new OcrProviderUnavailableError(
        `OpenAI OCR request failed with status ${response.status}`
      );
    }

    const payload: unknown = await response.json();
    const extracted = parseExtractedFields(extractOutputText(payload));

    return {
      extracted,
      rawOutput: { ...extracted },
    };
  }
}

function toDataUrl(contentType: string, buffer: Buffer): string {
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

function extractOutputText(payload: unknown): string {
  const outputText = readStringProperty(payload, "output_text");

  if (outputText) {
    return outputText;
  }

  const output = readArrayProperty(payload, "output");
  const texts = output.flatMap((item) => {
    const content = readArrayProperty(item, "content");

    return content
      .map((contentItem) => readStringProperty(contentItem, "text"))
      .filter((value): value is string => Boolean(value));
  });
  const text = texts.join("\n").trim();

  if (!text) {
    throw new OcrProviderUnavailableError("OCR response was empty");
  }

  return text;
}

function parseExtractedFields(text: string): ExtractedBusinessCardFields {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new OcrProviderUnavailableError("OCR response was not valid JSON");
  }

  const object = readObject(parsed);

  return {
    companyName: readNullableString(object, "companyName"),
    contactName: readNullableString(object, "contactName"),
    department: readNullableString(object, "department"),
    position: readNullableString(object, "position"),
    phone: readNullableString(object, "phone"),
    email: readNullableString(object, "email"),
    address: readNullableString(object, "address"),
  };
}

function readObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new OcrProviderUnavailableError("OCR response was not an object");
  }

  return value as Record<string, unknown>;
}

function readNullableString(
  object: Record<string, unknown>,
  field: FieldName
): string | null {
  const value = object[field];

  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw new OcrProviderUnavailableError(`${field} must be a string or null`);
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function readStringProperty(value: unknown, key: string): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const property = record[key];

  return typeof property === "string" ? property.trim() : null;
}

function readArrayProperty(value: unknown, key: string): unknown[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  const record = value as Record<string, unknown>;
  const property = record[key];

  return Array.isArray(property) ? property : [];
}
