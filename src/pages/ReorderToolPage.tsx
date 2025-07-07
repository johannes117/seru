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
import { ArrowDown, CheckCircle, ArrowUpDown } from "lucide-react";

export default function ReorderToolPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<SheetData | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [resultData, setResultData] = useState<SheetData | null>(null);

  const handleFileLoad = async (file: File | null) => {
    if (!file) {
      setData(null);
      setColumnOrder([]);
      setResultData(null);
      return;
    }
    const sheetData = await parseSheet(file);
    setData(sheetData);
    if (sheetData && sheetData.length > 0) {
      setColumnOrder(sheetData[0].map(h => h.toString()));
    }
    setResultData(null);
  };

  const handleColumnOrderChange = (position: number, newColumn: string) => {
    const newOrder = [...columnOrder];
    newOrder[position] = newColumn;
    setColumnOrder(newOrder);
  };

  const handleReorder = () => {
    if (!data || columnOrder.length === 0) return;

    const originalHeaders = data[0].map(h => h.toString());
    const columnIndexMap = new Map(originalHeaders.map((h, i) => [h, i]));

    // Create new ordered indices
    const newIndices = columnOrder.map(col => columnIndexMap.get(col)).filter(idx => idx !== undefined) as number[];

    // Reorder all rows
    const reorderedData = data.map(row => 
      newIndices.map(idx => row[idx])
    );

    setResultData(reorderedData);
  };

  const availableColumns = data ? data[0].map(h => h.toString()) : [];
  const canReorder = data && columnOrder.length > 0 && columnOrder.every(col => col !== "");

  return (
    <div className="flex h-full flex-col p-4 space-y-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">{t("titleReorderToolPage")}</h1>
        <p className="text-muted-foreground">
          Upload a file to rearrange its columns.
        </p>
      </div>

      <FileUploader
        title="Upload Spreadsheet File"
        onFileSelect={handleFileLoad}
      />

      {data && <DataTable data={data} />}

      {data && availableColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Configure Column Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the desired order for your columns:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {columnOrder.map((selectedColumn, position) => (
                <div key={position} className="space-y-2">
                  <label className="text-sm font-medium">Position {position + 1}</label>
                  <Select
                    value={selectedColumn}
                    onValueChange={(value) => handleColumnOrderChange(position, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select column for position ${position + 1}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColumns.map((col, i) => (
                        <SelectItem key={i} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button onClick={handleReorder} disabled={!canReorder} size="lg">
          Reorder Columns <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {resultData && (
        <Card className="bg-green-50/50 dark:bg-green-900/20 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700 dark:text-green-400">
              <CheckCircle className="mr-2" />
              Reordering Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Successfully reordered <strong>{resultData[0].length}</strong> columns.
            </p>
            <DataTable data={resultData} />
            <Button
              onClick={() =>
                downloadSheet(resultData, "reordered_data.xlsx")
              }
            >
              Download Reordered File
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 