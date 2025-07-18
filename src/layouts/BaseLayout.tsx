import React, { useState } from "react";
import DragWindowRegion from "@/components/DragWindowRegion";
import Sidebar, { type TabKey } from "@/components/Sidebar";
import AddressSplitterToolPage from "@/pages/AddressSplitterToolPage";
import FilterToolPage from "@/pages/FilterToolPage";
import SettingsPage from "@/pages/SettingsPage";
import RecordSplitterToolPage from "@/pages/RecordSplitterToolPage";
import PythonInterpreterPage from "@/pages/PythonInterpreterPage";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/utils/tailwind";

export default function BaseLayout() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("address-splitter");

  const pages: Record<TabKey, React.ReactNode> = {
    "address-splitter": <AddressSplitterToolPage />,
    filter: <FilterToolPage />,
    "record-splitter": <RecordSplitterToolPage />,
    "python-interpreter": <PythonInterpreterPage />,
    settings: <SettingsPage />,
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DragWindowRegion>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="mx-2"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        </DragWindowRegion>
        <main className="flex-1 overflow-y-auto">
          {Object.entries(pages).map(([key, page]) => (
            <div
              key={key}
              className={cn("h-full", activeTab === key ? "block" : "hidden")}
            >
              {page}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
