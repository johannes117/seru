import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ToggleTheme from "@/components/ToggleTheme";
import { Settings, Palette, Info } from "lucide-react";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col p-4 space-y-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-3xl font-bold flex items-center">
          <Settings className="mr-3" />
          {t("titleSettingsPage")}
        </h1>
        <p className="text-muted-foreground">
          Customize your Seru experience with these settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Theme</h4>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark mode
                </p>
              </div>
              <ToggleTheme />
            </div>
          </CardContent>
        </Card>

        {/* Application Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="mr-2 h-5 w-5" />
              About Seru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium">Version</h4>
                <p className="text-muted-foreground">0.2.0</p>
              </div>
              <div>
                <h4 className="font-medium">Built with</h4>
                <p className="text-muted-foreground">Electron + React + TypeScript</p>
              </div>
              <div>
                <h4 className="font-medium">Features</h4>
                <p className="text-muted-foreground">Filter Tool, Address Splitter Tool, Record Splitter Tool</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Seru is a simple spreadsheet manipulation tool designed to help you filter and reorder your data with ease.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 