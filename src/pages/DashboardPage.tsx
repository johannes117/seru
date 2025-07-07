import React from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Filter, ListRestart, Spline } from "lucide-react";

export default function DashboardPage() {
  const { t } = useTranslation();

  const tools = [
    {
      id: "filter",
      title: t("titleFilterToolPage"),
      icon: <Filter className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />,
      description: "Filter rows from a file based on a 'no-contact' list.",
      to: "/filter",
    },
    {
      id: "reorder",
      title: t("titleReorderToolPage"),
      icon: <ListRestart className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />,
      description: "Easily rearrange the columns of your spreadsheet.",
      to: "/reorder",
    },
    {
      id: "split-address",
      title: t("titleAddressSplitterPage"),
      icon: <Spline className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />,
      description: "Separate a single address column into multiple parts.",
      to: "/split-address",
    },
  ];

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-mono tracking-tight text-foreground">
          {t("appName")}
        </h1>
        <p className="mt-3 md:mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
          Your simple, powerful spreadsheet assistant. Streamline your
          data-wrangling tasks.
        </p>
      </header>

      <main>
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">
            Available Tools
          </h2>
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              title={tool.title}
              icon={tool.icon}
              description={tool.description}
              to={tool.to}
            />
          ))}
        </div>
      </main>
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
    <Link to={to} className="group block">
      <Card className="transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:border-primary/50 group-hover:-translate-y-1">
        <CardContent className="flex items-center p-6 space-x-6">
          <div className="flex-shrink-0 bg-primary/10 p-4 rounded-lg">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="flex-shrink-0">
            <ArrowRight className="h-6 w-6 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
