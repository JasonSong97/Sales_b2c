import { useParams } from "react-router-dom";
import { DealDetailScreen } from "@/features/deal";

export function DealDetailPage() {
  const { dealId } = useParams();

  return <DealDetailScreen dealId={dealId ?? ""} />;
}
