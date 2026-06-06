import { z } from "zod";
import type {
  CreateMeetingNoteInput,
  GeneratedMeetingNote,
  MeetingNote,
  MeetingNoteDetail,
  UpdateMeetingNoteInput,
} from "@/features/meeting-note/types/meeting-note";

export const meetingNoteFormSchema = z.object({
  meetingDate: z.string().min(1, "회의 날짜를 입력해주세요."),
  companyName: z.string().max(160).optional(),
  contactName: z.string().max(120).optional(),
  department: z.string().max(120).optional(),
  productName: z.string().max(160).optional(),
  stageText: z.string().max(120).optional(),
  details: z.string().trim().min(1, "상세내용을 입력해주세요.").max(4000),
  nextPlan: z.string().max(2000).optional(),
  requiredAction: z.string().max(2000).optional(),
  dealId: z.string().optional(),
  dealSearch: z.string().optional(),
});

export type MeetingNoteFormValues = z.infer<typeof meetingNoteFormSchema>;

export const emptyMeetingNoteFormValues: MeetingNoteFormValues = {
  meetingDate: toDateTimeLocalValue(new Date()),
  companyName: "",
  contactName: "",
  department: "",
  productName: "",
  stageText: "",
  details: "",
  nextPlan: "",
  requiredAction: "",
  dealId: "",
  dealSearch: "",
};

export function toCreateMeetingNoteInput(
  rawText: string,
  values: MeetingNoteFormValues
): CreateMeetingNoteInput {
  return {
    rawText: rawText.trim(),
    meetingDate: toIsoString(values.meetingDate),
    companyName: toOptionalText(values.companyName),
    contactName: toOptionalText(values.contactName),
    department: toOptionalText(values.department),
    productName: toOptionalText(values.productName),
    stageText: toOptionalText(values.stageText),
    details: values.details.trim(),
    nextPlan: toOptionalText(values.nextPlan),
    requiredAction: toOptionalText(values.requiredAction),
  };
}

export function toUpdateMeetingNoteInput(
  meetingNoteId: string,
  rawText: string,
  values: MeetingNoteFormValues
): UpdateMeetingNoteInput {
  return {
    meetingNoteId,
    ...toCreateMeetingNoteInput(rawText, values),
  };
}

export function toMeetingNoteFormValues(
  detail: MeetingNoteDetail | null,
  fallback: MeetingNote | null
): MeetingNoteFormValues {
  const meetingNote = detail?.meetingNote ?? fallback;

  if (!meetingNote) {
    return emptyMeetingNoteFormValues;
  }

  return {
    meetingDate: meetingNote.meetingDate
      ? toDateTimeLocalValue(meetingNote.meetingDate)
      : toDateTimeLocalValue(new Date()),
    companyName: meetingNote.companyName ?? "",
    contactName: meetingNote.contactName ?? "",
    department: meetingNote.department ?? "",
    productName: meetingNote.productName ?? "",
    stageText: meetingNote.stageText ?? "",
    details: meetingNote.details,
    nextPlan: meetingNote.nextPlan ?? "",
    requiredAction: meetingNote.requiredAction ?? "",
    dealId: meetingNote.dealId ?? "",
    dealSearch: meetingNote.dealTitle ?? "",
  };
}

export function toGeneratedMeetingNoteFormValues(
  generated: GeneratedMeetingNote,
  current: MeetingNoteFormValues
): MeetingNoteFormValues {
  return {
    ...current,
    meetingDate: generated.meetingDate
      ? toDateTimeLocalValue(generated.meetingDate)
      : current.meetingDate,
    companyName: generated.companyName ?? current.companyName,
    contactName: generated.contactName ?? current.contactName,
    department: generated.department ?? current.department,
    productName: generated.productName ?? current.productName,
    stageText: generated.stageText ?? current.stageText,
    details: generated.details,
    nextPlan: generated.nextPlan ?? current.nextPlan,
    requiredAction: generated.requiredAction ?? current.requiredAction,
  };
}

export function toDateTimeLocalValue(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const local = new Date(date.getTime() - offsetMs);

  return local.toISOString().slice(0, 16);
}

function toIsoString(value: string) {
  const date = new Date(value);

  return date.toISOString();
}

function toOptionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : undefined;
}
