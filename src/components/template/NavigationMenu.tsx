import React from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  NavigationMenu as NavigationMenuBase,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";

export default function NavigationMenu() {
  const { t } = useTranslation();

  return (
    <NavigationMenuBase className="px-2 font-mono text-muted-foreground">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("titleDashboardPage")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/filter">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("titleFilterToolPage")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/reorder">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("titleReorderToolPage")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/split-address">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("titleAddressSplitterPage")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/settings">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("titleSettingsPage")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenuBase>
  );
}
