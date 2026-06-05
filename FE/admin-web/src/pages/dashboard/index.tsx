const metrics = [
  { label: "Users", value: "0" },
  { label: "Deals", value: "0" },
  { label: "Companies", value: "0" },
  { label: "Raw views", value: "0" },
];

export function DashboardPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <header className="border-b pb-5">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Operational metrics, recent records, and audit signals.
        </p>
      </header>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {metrics.map((metric) => (
          <div className="rounded-lg border bg-white p-4" key={metric.label}>
            <div className="text-xs font-medium text-muted-foreground">
              {metric.label}
            </div>
            <div className="mt-2 text-2xl font-semibold">{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border bg-white">
        <div className="border-b px-4 py-3 text-sm font-medium">
          Recent audit logs
        </div>
        <div className="px-4 py-8 text-sm text-muted-foreground">
          Audit table will be connected in the Admin goal.
        </div>
      </div>
    </section>
  );
}
