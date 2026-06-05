import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "companies", element: <PlaceholderPage title="Companies" /> },
      { path: "companies/:companyId", element: <PlaceholderPage title="Company detail" /> },
      { path: "contacts", element: <PlaceholderPage title="Contacts" /> },
      { path: "contacts/:contactId", element: <PlaceholderPage title="Contact detail" /> },
      { path: "products", element: <PlaceholderPage title="Products" /> },
      { path: "products/:productId", element: <PlaceholderPage title="Product detail" /> },
      { path: "deals", element: <PlaceholderPage title="Deals" /> },
      { path: "deals/:dealId", element: <PlaceholderPage title="Deal detail" /> },
      { path: "schedules", element: <PlaceholderPage title="Schedules" /> },
      { path: "meeting-notes", element: <PlaceholderPage title="Meeting notes" /> },
      { path: "business-cards", element: <PlaceholderPage title="Business cards" /> },
      { path: "import", element: <PlaceholderPage title="Import" /> },
      { path: "export", element: <PlaceholderPage title="Export" /> },
      { path: "trash", element: <PlaceholderPage title="Trash" /> },
      { path: "settings", element: <PlaceholderPage title="Settings" /> },
    ],
  },
]);
