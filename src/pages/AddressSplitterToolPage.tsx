import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  downloadSheet,
  parseAddress,
  parseSheet,
  type ParsedAddress,
  type SheetData,
} from "@/helpers/file_helpers";
import FileUploader from "@/components/FileUploader";
import DataTable from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Spline } from "lucide-react";

type OutputColumnNames = {
  [K in keyof Omit<ParsedAddress, 'country'>]: string;
};

export default function AddressSplitterToolPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<SheetData | null>(null);
  const [resultData, setResultData] = useState<SheetData | null>(null);
  const [addressColumn, setAddressColumn] = useState<string>("");
  const [outputColumns, setOutputColumns] = useState<OutputColumnNames>({
    street: "Street",
    city: "Suburb", // Changed default to 'Suburb' for AU context
    state: "State",
    postcode: "Postcode",
  });

  const handleFileLoad = async (file: File | null) => {
    if (!file) {
      setData(null);
      setResultData(null);
      return;
    }
    const sheetData = await parseSheet(file);
    setData(sheetData);
    setResultData(null);
  };

  const handleOutputColumnNameChange = (
    key: keyof OutputColumnNames,
    value: string,
  ) => {
    setOutputColumns((prev) => ({ ...prev, [key]: value }));
  };

  const handleSplit = () => {
    if (!data || !addressColumn) return;

    const headers = data[0];
    const addressIndex = headers.indexOf(addressColumn);

    if (addressIndex === -1) {
      // Should not happen if UI is correct, but good to have
      console.error("Address column not found in data");
      return;
    }

    const newHeaders = [
      ...headers,
      ...Object.values(outputColumns),
    ];

    const dataRows = data.slice(1);
    const newDataRows = dataRows.map((row) => {
      const addressString = row[addressIndex]?.toString() || "";
      const parsed = parseAddress(addressString);
      return [...row, ...Object.values(parsed)];
    });

    setResultData([newHeaders, ...newDataRows]);
  };

  const headers = (d: SheetData | null) => (d ? d[0] : []);
  const canSplit = data && addressColumn;

  return (
    <div className="flex flex-col p-4 space-y-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">{t("titleAddressSplitterPage")}</h1>
        <p className="text-muted-foreground">
          Separate a single address column into its component parts.
        </p>
      </div>

      <FileUploader
        title="Upload Spreadsheet File"
        onFileSelect={handleFileLoad}
      />

      {data && <DataTable data={data} />}

      {data && (
        <Card>
          <CardHeader>
            <CardTitle>2. Configure Split</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Select Address Column</h4>
              <Select onValueChange={setAddressColumn} value={addressColumn}>
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue placeholder="Select column to split..." />
                </SelectTrigger>
                <SelectContent>
                  {headers(data).map((h, i) => (
                    <SelectItem key={i} value={h.toString()}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <h4 className="font-medium mb-2">Define Output Column Names</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(outputColumns).map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-sm capitalize text-muted-foreground">
                      {key}
                    </label>
                    <Input
                      value={outputColumns[key as keyof OutputColumnNames]}
                      onChange={(e) =>
                        handleOutputColumnNameChange(
                          key as keyof OutputColumnNames,
                          e.target.value,
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button onClick={handleSplit} disabled={!canSplit} size="lg">
          Split Address <Spline className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {resultData && (
        <Card className="bg-green-50/50 dark:bg-green-900/20 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700 dark:text-green-400">
              <CheckCircle className="mr-2" />
              Splitting Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataTable data={resultData} />
            <Button
              onClick={() =>
                downloadSheet(resultData, "split_address_data.xlsx")
              }
            >
              Download Split File <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 