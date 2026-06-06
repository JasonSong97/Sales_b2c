import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  AiMeetingNotePort,
  GenerateMeetingNoteInput,
} from "@/modules/meeting-note/application/ports/ai-meeting-note.port";
import type { GeneratedMeetingNoteFields } from "@/modules/meeting-note/application/ports/meeting-note.repository";
import {
  AiProviderUnavailableError,
  InvalidMeetingNoteGeneratedFieldsError,
} from "@/modules/meeting-note/domain/meeting-note.errors";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

const FIELD_NAMES = [
  "meetingDate",
  "companyName",
  "contactName",
  "department",
  "productName",
  "stageText",
  "details",
  "nextPlan",
  "requiredAction",
] as const;

type FieldName = (typeof FIELD_NAMES)[number];

@Injectable()
export class OpenAiMeetingNoteAdapter implements AiMeetingNotePort {
  constructor(private readonly configService: ConfigService) {}

  async generateMeetingNote(
    input: GenerateMeetingNoteInput
  ): Promise<GeneratedMeetingNoteFields> {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");

    if (!apiKey) {
      throw new AiProviderUnavailableError("OPENAI_API_KEY is not configured");
    }

    const model =
      this.configService.get<string>("OPENAI_MODEL") ?? DEFAULT_OPENAI_MODEL;
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
              "You extract Korean B2C sales meeting notes. Return JSON only with the exact requested fields.",
          },
          {
            role: "user",
            content: createPrompt(input),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "meeting_note_fields",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: FIELD_NAMES,
              properties: {
                meetingDate: { type: ["string", "null"] },
                companyName: { type: ["string", "null"] },
                contactName: { type: ["string", "null"] },
                department: { type: ["string", "null"] },
                productName: { type: ["string", "null"] },
                stageText: { type: ["string", "null"] },
                details: { type: "string" },
                nextPlan: { type: ["string", "null"] },
                requiredAction: { type: ["string", "null"] },
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new AiProviderUnavailableError(
        `OpenAI request failed with status ${response.status}`
      );
    }

    const payload: unknown = await response.json();
    return parseGeneratedFields(extractOutputText(payload));
  }
}

function createPrompt(input: GenerateMeetingNoteInput): string {
  const hints = [
    input.meetingDate
      ? `meetingDate hint: ${input.meetingDate.toISOString()}`
      : null,
    input.companyHint ? `companyName hint: ${input.companyHint}` : null,
    input.contactHint ? `contactName hint: ${input.contactHint}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "Extract the following fixed fields from the meeting note.",
    "Use null when a field is unknown. Keep details concise but complete.",
    "meetingDate must be an ISO-8601 date/time string when known.",
    hints ? `Hints:\n${hints}` : null,
    `Raw meeting note:\n${input.rawText}`,
  ]
    .filter(Boolean)
    .join("\n\n");
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
    throw new InvalidMeetingNoteGeneratedFieldsError("AI response was empty");
  }

  return text;
}

function parseGeneratedFields(text: string): GeneratedMeetingNoteFields {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new InvalidMeetingNoteGeneratedFieldsError(
      "AI response was not valid JSON"
    );
  }

  const object = readObject(parsed);
  const details = readRequiredString(object, "details");

  if (!details) {
    throw new InvalidMeetingNoteGeneratedFieldsError("details is required");
  }

  return {
    meetingDate: parseOptionalDate(readNullableString(object, "meetingDate")),
    companyName: readNullableString(object, "companyName"),
    contactName: readNullableString(object, "contactName"),
    department: readNullableString(object, "department"),
    productName: readNullableString(object, "productName"),
    stageText: readNullableString(object, "stageText"),
    details,
    nextPlan: readNullableString(object, "nextPlan"),
    requiredAction: readNullableString(object, "requiredAction"),
  };
}

function readObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InvalidMeetingNoteGeneratedFieldsError(
      "AI response was not an object"
    );
  }

  return value as Record<string, unknown>;
}

function readRequiredString(
  object: Record<string, unknown>,
  field: FieldName
): string {
  const value = object[field];

  if (typeof value !== "string") {
    throw new InvalidMeetingNoteGeneratedFieldsError(`${field} must be a string`);
  }

  return value.trim();
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
    throw new InvalidMeetingNoteGeneratedFieldsError(
      `${field} must be a string or null`
    );
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function parseOptionalDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new InvalidMeetingNoteGeneratedFieldsError(
      "meetingDate must be a valid date"
    );
  }

  return date;
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
