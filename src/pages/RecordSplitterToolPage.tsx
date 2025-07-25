import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  parseSheet,
  splitSheet,
  splitSheetCustom,
  downloadSheetsAsZip,
  type SheetData,
} from "@/helpers/file_helpers";
import FileUploader from "@/components/FileUploader";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Combine, CheckCircle, Settings2, Trash2, Plus, X } from "lucide-react";

export default function RecordSplitterToolPage() {
  const { t } = useTranslation();
  const [originalData, setOriginalData] = useState<SheetData | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const [splitSize, setSplitSize] = useState<number>(10000);
  const [splitMode, setSplitMode] = useState<"even" | "custom">("even");
  const [customSizes, setCustomSizes] = useState<number[]>([1000]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [splitCount, setSplitCount] = useState<number>(0);
  const [resetKey, setResetKey] = useState(0);

  const handleClearProgress = () => {
    setOriginalData(null);
    setOriginalFileName("");
    setSplitSize(10000);
    setSplitMode("even");
    setCustomSizes([1000]);
    setIsProcessing(false);
    setIsComplete(false);
    setSplitCount(0);
    setResetKey((prev) => prev + 1);
  };

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

  const addCustomSize = () => {
    setCustomSizes([...customSizes, 1000]);
  };

  const removeCustomSize = (index: number) => {
    if (customSizes.length > 1) {
      setCustomSizes(customSizes.filter((_, i) => i !== index));
    }
  };

  const updateCustomSize = (index: number, value: number) => {
    const newSizes = [...customSizes];
    newSizes[index] = value;
    setCustomSizes(newSizes);
  };

  const handleSplitAndDownload = async () => {
    if (!originalData) return;
    
    if (splitMode === "even" && splitSize <= 0) return;
    if (splitMode === "custom" && customSizes.some(size => size <= 0 || isNaN(size))) return;

    setIsProcessing(true);
    setIsComplete(false);

    // Give UI time to update
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const chunks = splitMode === "even" 
        ? splitSheet(originalData, splitSize)
        : splitSheetCustom(originalData, customSizes.filter(size => size > 0 && !isNaN(size)));
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

  const estimatedFileCount = useMemo(() => {
    if (splitMode === "even") {
      return Math.ceil(totalRows / splitSize);
    } else {
      const validSizes = customSizes.filter(size => size > 0 && !isNaN(size));
      if (validSizes.length === 0) return 0;
      const totalCustomSize = validSizes.reduce((sum, size) => sum + size, 0);
      return totalCustomSize >= totalRows ? validSizes.length : validSizes.length + 1;
    }
  }, [splitMode, totalRows, splitSize, customSizes]);

  const canSplit = useMemo(() => {
    if (!originalData || isProcessing) return false;
    if (splitMode === "even") return splitSize > 0;
    return customSizes.length > 0 && customSizes.every(size => size > 0 && !isNaN(size));
  }, [originalData, isProcessing, splitMode, splitSize, customSizes]);

  return (
    <div className="flex flex-col p-4 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{t("titleRecordSplitterPage")}</h1>
          <p className="text-muted-foreground">
            Upload a spreadsheet to split it into multiple smaller files.
          </p>
        </div>
        {originalData && (
          <Button variant="outline" onClick={handleClearProgress}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <FileUploader
        key={resetKey}
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
            <CardContent className="space-y-6">
              <div>
                <Label className="font-medium mb-3 block">Splitting Mode</Label>
                <RadioGroup
                  value={splitMode}
                  onValueChange={(value: "even" | "custom") => setSplitMode(value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="even" id="even" />
                    <Label htmlFor="even">Even Split - Same size for all files</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Custom Split - Define size for each file</Label>
                  </div>
                </RadioGroup>
              </div>

              {splitMode === "even" ? (
                <div>
                  <Label htmlFor="split-size" className="font-medium mb-2 block">
                    Maximum records per file
                  </Label>
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
                    split into approximately {estimatedFileCount} files.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="font-medium">File Sizes</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCustomSize}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add File
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {customSizes.map((size, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Label className="w-16 text-sm">File {index + 1}:</Label>
                        <Input
                          type="number"
                          value={size || ""}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                            updateCustomSize(index, isNaN(value) ? 0 : value);
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (isNaN(value) || value <= 0) {
                              updateCustomSize(index, 1);
                            }
                          }}
                          className="w-32"
                          min="1"
                        />
                        <Label className="text-sm text-muted-foreground">records</Label>
                        {customSizes.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomSize(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    {(() => {
                      const validSizes = customSizes.filter(size => size > 0 && !isNaN(size));
                      const totalSpecified = validSizes.reduce((sum, size) => sum + size, 0);
                      return (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Total specified: {totalSpecified.toLocaleString()} records
                            {totalSpecified < totalRows && totalSpecified > 0 && (
                              <span className="block mt-1">
                                Remaining {(totalRows - totalSpecified).toLocaleString()} records will be added to a new file.
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Will create approximately {estimatedFileCount} files.
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
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