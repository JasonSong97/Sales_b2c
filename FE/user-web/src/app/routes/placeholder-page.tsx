export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This route is ready for the MVP feature slice.
      </p>
    </section>
  );
}
