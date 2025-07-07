import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import FileUploader from "@/components/FileUploader";
import DataTable from "@/components/DataTable";
import {
  downloadSheet,
  parseSheet,
  type SheetData,
} from "@/helpers/file_helpers";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, CheckCircle } from "lucide-react";

export default function FilterToolPage() {
  const { t } = useTranslation();
  const [mainData, setMainData] = useState<SheetData | null>(null);
  const [noContactData, setNoContactData] = useState<SheetData | null>(null);
  const [mainEmailCol, setMainEmailCol] = useState<string>("");
  const [noContactEmailCol, setNoContactEmailCol] = useState<string>("");
  const [resultData, setResultData] = useState<SheetData | null>(null);
  const [removedCount, setRemovedCount] = useState(0);

  const handleFileLoad =
    (setter: React.Dispatch<React.SetStateAction<SheetData | null>>) =>
    async (file: File | null) => {
      if (!file) {
        setter(null);
        return;
      }
      const data = await parseSheet(file);
      setter(data);
      setResultData(null); // Reset result on new file load
    };

  const handleFilter = () => {
    if (!mainData || !noContactData || !mainEmailCol || !noContactEmailCol)
      return;

    const mainHeader = mainData[0];
    const noContactHeader = noContactData[0];
    const mainEmailIndex = mainHeader.indexOf(mainEmailCol);
    const noContactEmailIndex = noContactHeader.indexOf(noContactEmailCol);

    const noContactEmails = new Set(
      noContactData
        .slice(1)
        .map((row) => row[noContactEmailIndex]?.toString().toLowerCase())
        .filter(Boolean),
    );

    let removed = 0;
    const filteredData = mainData.slice(1).filter((row) => {
      const email = row[mainEmailIndex]?.toString().toLowerCase();
      if (email && noContactEmails.has(email)) {
        removed++;
        return false;
      }
      return true;
    });

    setRemovedCount(removed);
    setResultData([mainHeader, ...filteredData]);
  };

  const headers = (data: SheetData | null) => (data ? data[0] : []);
  const canFilter = mainData && noContactData && mainEmailCol && noContactEmailCol;

  return (
    <div className="flex flex-col p-4 space-y-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">{t("titleFilterToolPage")}</h1>
        <p className="text-muted-foreground">
          Upload a main file and a "no-contact" file to filter out matching
          rows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploader
          title="1. Main Data File"
          onFileSelect={handleFileLoad(setMainData)}
        />
        <FileUploader
          title="2. No-Contact List File"
          onFileSelect={handleFileLoad(setNoContactData)}
        />
      </div>

      {mainData && <DataTable data={mainData} />}
      {noContactData && <DataTable data={noContactData} />}

      {mainData && noContactData && (
        <Card>
          <CardHeader>
            <CardTitle>3. Configure Columns</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select onValueChange={setMainEmailCol}>
              <SelectTrigger>
                <SelectValue placeholder="Select Main Email Column" />
              </SelectTrigger>
              <SelectContent>
                {headers(mainData).map((h, i) => (
                  <SelectItem key={i} value={h.toString()}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setNoContactEmailCol}>
              <SelectTrigger>
                <SelectValue placeholder="Select No-Contact Email Column" />
              </SelectTrigger>
              <SelectContent>
                {headers(noContactData).map((h, i) => (
                  <SelectItem key={i} value={h.toString()}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button onClick={handleFilter} disabled={!canFilter} size="lg">
          Filter Emails <ArrowDown className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {resultData && (
        <Card className="bg-green-50/50 dark:bg-green-900/20 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700 dark:text-green-400">
              <CheckCircle className="mr-2" />
              Processing Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Removed <strong>{removedCount}</strong> matching row(s).
            </p>
            <DataTable data={resultData} />
            <Button
              onClick={() =>
                downloadSheet(resultData, "filtered_data.xlsx")
              }
            >
              Download Filtered File
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
