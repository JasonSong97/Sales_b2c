import { DealDetailPanel } from "@/features/deal/components/deal-detail-panel";

type DealDetailScreenProps = {
  readonly dealId: string;
};

export function DealDetailScreen({ dealId }: DealDetailScreenProps) {
  return <DealDetailPanel dealId={dealId} variant="page" />;
}
