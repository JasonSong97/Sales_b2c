export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-5">
      <section className="w-full max-w-sm rounded-lg border bg-white p-6">
        <p className="text-sm font-semibold text-primary">onehand.sales admin</p>
        <h1 className="mt-3 text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin role verification will be connected in the auth goal.
        </p>
        <button className="mt-6 h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground">
          Continue
        </button>
      </section>
    </main>
  );
}
