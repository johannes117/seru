import React from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Filter, ListRestart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-full flex-col items-center justify-center py-8">
      <div className="text-center mb-12">
        <h1 className="font-mono text-5xl font-bold">{t("appName")}</h1>
        <p className="text-muted-foreground">
          Your simple spreadsheet assistant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ToolCard
          title={t("titleFilterToolPage")}
          icon={<Filter className="w-10 h-10 mb-4 text-primary" />}
          description="Filter rows from a file based on a 'no-contact' list."
          to="/filter"
        />
        <ToolCard
          title={t("titleReorderToolPage")}
          icon={<ListRestart className="w-10 h-10 mb-4 text-primary" />}
          description="Easily rearrange the columns of your spreadsheet."
          to="/reorder"
        />
      </div>
    </div>
  );
}

interface ToolCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  to: string;
}

function ToolCard({ title, icon, description, to }: ToolCardProps) {
  return (
    <Card className="w-80 text-center">
      <CardHeader>
        <div className="flex justify-center">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">{description}</p>
        <Link to={to}>
          <Button>
            Open Tool <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
