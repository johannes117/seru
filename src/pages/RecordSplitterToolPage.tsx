import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  parseSheet,
  splitSheet,
  downloadSheetsAsZip,
  type SheetData,
} from "@/helpers/file_helpers";
import FileUploader from "@/components/FileUploader";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combine, CheckCircle, Settings2 } from "lucide-react";

export default function RecordSplitterToolPage() {
  const { t } = useTranslation();
  const [originalData, setOriginalData] = useState<SheetData | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const [splitSize, setSplitSize] = useState<number>(10000);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [splitCount, setSplitCount] = useState<number>(0);

  const handleFileLoad = async (file: File | null) => {
    if (!file) {
      setOriginalData(null);
      setOriginalFileName("");
      setIsComplete(false);
      setSplitCount(0);
      return;
    }

    try {
      const sheetData = await parseSheet(file);
      setOriginalData(sheetData);
      setOriginalFileName(file.name);
      setIsComplete(false);
      setSplitCount(0);
    } catch (error) {
      console.error("Error loading file:", error);
    }
  };

  const handleSplitAndDownload = async () => {
    if (!originalData || splitSize <= 0) return;

    setIsProcessing(true);
    setIsComplete(false);

    // Give UI time to update
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const chunks = splitSheet(originalData, splitSize);
      setSplitCount(chunks.length);
      const zipFileName = `${originalFileName.replace(/\.[^/.]+$/, "")}_split.zip`;
      await downloadSheetsAsZip(chunks, originalFileName, zipFileName);
      setIsComplete(true);
    } catch (error) {
      console.error("Error splitting or zipping file:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalRows = useMemo(() => {
    if (!originalData || originalData.length < 2) return 0;
    return originalData.length - 1; // Subtract header row
  }, [originalData]);

  const canSplit = originalData && splitSize > 0 && !isProcessing;

  return (
    <div className="flex flex-col p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{t("titleRecordSplitterPage")}</h1>
        <p className="text-muted-foreground">
          Upload a spreadsheet to split it into multiple smaller files.
        </p>
      </div>

      <FileUploader
        title="Upload Spreadsheet File"
        acceptedFileTypes=".csv, .xlsx, .xls"
        onFileSelect={handleFileLoad}
      />

      {originalData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>1. Preview Input Data</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={originalData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                2. Configure Splitting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="split-size"
                  className="font-medium mb-2 block"
                >
                  Maximum records per file
                </label>
                <Input
                  id="split-size"
                  type="number"
                  value={splitSize}
                  onChange={(e) =>
                    setSplitSize(Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  className="w-full md:w-1/2"
                  min="1"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Your file with {totalRows.toLocaleString()} records will be
                  split into approximately {Math.ceil(totalRows / splitSize)}{" "}
                  files.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={handleSplitAndDownload}
              disabled={!canSplit}
              size="lg"
            >
              {isProcessing ? "Processing..." : "Split and Download ZIP"}
              <Combine className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {isComplete && (
        <Card className="bg-green-50/50 dark:bg-green-900/20 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700 dark:text-green-400">
              <CheckCircle className="mr-2" />
              Splitting Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Your file was successfully split into{" "}
              <strong>{splitCount}</strong> smaller files and downloaded as a
              ZIP archive.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 