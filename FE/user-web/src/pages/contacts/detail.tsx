import { useParams } from "react-router-dom";
import { ContactDetailScreen } from "@/features/contact";

export function ContactDetailPage() {
  const { contactId } = useParams();

  return <ContactDetailScreen contactId={contactId ?? ""} />;
}
