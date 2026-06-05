import { Link, Outlet } from "react-router-dom";

export function AdminShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 w-64 border-r bg-white px-4 py-5">
        <div className="text-sm font-semibold text-primary">onehand.sales admin</div>
        <nav className="mt-6 grid gap-1 text-sm">
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/">
            Dashboard
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/users">
            Users
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/deals">
            Deals
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/audit-logs">
            Audit logs
          </Link>
        </nav>
      </aside>
      <main className="pl-64">
        <Outlet />
      </main>
    </div>
  );
}
