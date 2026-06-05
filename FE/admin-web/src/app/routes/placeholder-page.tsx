export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This admin route is ready for table, filters, and row detail panels.
      </p>
    </section>
  );
}
