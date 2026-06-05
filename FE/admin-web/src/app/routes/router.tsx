import { createBrowserRouter } from "react-router-dom";
import { AdminShell } from "@/app/routes/admin-shell";
import { PlaceholderPage } from "@/app/routes/placeholder-page";
import { DashboardPage } from "@/pages/dashboard";
import { LoginPage } from "@/pages/login";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <AdminShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "users", element: <PlaceholderPage title="Users" /> },
      { path: "users/:userId", element: <PlaceholderPage title="User detail" /> },
      { path: "users/:userId/deals", element: <PlaceholderPage title="User deals" /> },
      { path: "users/:userId/companies", element: <PlaceholderPage title="User companies" /> },
      { path: "users/:userId/contacts", element: <PlaceholderPage title="User contacts" /> },
      { path: "users/:userId/products", element: <PlaceholderPage title="User products" /> },
      { path: "deals", element: <PlaceholderPage title="All deals" /> },
      { path: "companies", element: <PlaceholderPage title="All companies" /> },
      { path: "contacts", element: <PlaceholderPage title="All contacts" /> },
      { path: "products", element: <PlaceholderPage title="All products" /> },
      { path: "audit-logs", element: <PlaceholderPage title="Audit logs" /> },
      { path: "settings", element: <PlaceholderPage title="Settings" /> },
    ],
  },
]);
