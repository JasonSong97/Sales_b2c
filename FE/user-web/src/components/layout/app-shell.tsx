import { Link, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r bg-white px-4 py-5 md:block">
        <div className="text-sm font-semibold text-primary">onehand.sales</div>
        <nav className="mt-6 grid gap-1 text-sm">
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/">
            Pipeline
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/companies">
            Companies
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/deals">
            Deals
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/schedules">
            Schedules
          </Link>
        </nav>
      </aside>
      <main className="md:pl-60">
        <Outlet />
      </main>
    </div>
  );
}
