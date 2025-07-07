import { createRoute } from "@tanstack/react-router";
import { RootRoute } from "./__root";
import DashboardPage from "../pages/DashboardPage";
import FilterToolPage from "@/pages/FilterToolPage";
import ReorderToolPage from "@/pages/ReorderToolPage";

// TODO: Steps to add a new route:
// 1. Create a new page component in the '../pages/' directory (e.g., NewPage.tsx)
// 2. Import the new page component at the top of this file
// 3. Define a new route for the page using createRoute()
// 4. Add the new route to the routeTree in RootRoute.addChildren([...])
// 5. Add a new Link in the navigation section of RootRoute if needed

export const DashboardRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: DashboardPage,
});

export const FilterToolRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/filter",
  component: FilterToolPage,
});

export const ReorderToolRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/reorder",
  component: ReorderToolPage,
});

export const rootTree = RootRoute.addChildren([
  DashboardRoute,
  FilterToolRoute,
  ReorderToolRoute,
]);
