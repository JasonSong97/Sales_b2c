import { Search, Plus } from "lucide-react";

const deals = [
  {
    title: "Renewal discussion",
    company: "Acme Korea",
    stage: "In discussion",
    amount: "$42,000",
    likelihood: "Positive",
    nextAction: "Send revised quote",
    due: "Today",
  },
  {
    title: "New logistics rollout",
    company: "Blue Harbor",
    stage: "Initial contact",
    amount: "$18,500",
    likelihood: "Neutral",
    nextAction: "Schedule demo",
    due: "Tomorrow",
  },
];

export function HomePage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Deal pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review active deals, next actions, and schedule pressure.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium">
            <Search className="h-4 w-4" />
            Search
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" />
            New deal
          </button>
        </div>
      </header>

      <div className="mt-5 flex gap-2 overflow-x-auto">
        {["All", "Initial contact", "In discussion", "Won", "Lost"].map((stage) => (
          <button
            className="h-9 shrink-0 rounded-md border px-3 text-sm font-medium first:bg-primary first:text-primary-foreground"
            key={stage}
          >
            {stage}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border bg-white">
        <div className="grid grid-cols-[1.3fr_1fr_0.9fr_0.8fr_0.9fr_1fr_0.7fr] border-b bg-muted px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>Deal</span>
          <span>Company</span>
          <span>Stage</span>
          <span>Amount</span>
          <span>Likelihood</span>
          <span>Next action</span>
          <span>Due</span>
        </div>
        {deals.map((deal) => (
          <button
            className="grid w-full grid-cols-[1.3fr_1fr_0.9fr_0.8fr_0.9fr_1fr_0.7fr] px-4 py-4 text-left text-sm hover:bg-muted/60"
            key={deal.title}
          >
            <span className="font-medium">{deal.title}</span>
            <span>{deal.company}</span>
            <span>{deal.stage}</span>
            <span className="font-medium">{deal.amount}</span>
            <span>{deal.likelihood}</span>
            <span>{deal.nextAction}</span>
            <span>{deal.due}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
