import { useParams } from "react-router-dom";
import { MeetingNoteEditorScreen } from "@/features/meeting-note";

export function MeetingNoteDetailPage() {
  const { meetingNoteId } = useParams();

  return <MeetingNoteEditorScreen meetingNoteId={meetingNoteId ?? ""} />;
}
