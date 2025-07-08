import React from "react";
import BaseLayout from "@/layouts/BaseLayout";
import { createRootRoute } from "@tanstack/react-router";

export const RootRoute = createRootRoute({
  component: BaseLayout,
});
