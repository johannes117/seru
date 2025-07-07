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
import { ArrowRight, CheckCircle, Spline, Settings2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

type OutputKey = keyof Omit<ParsedAddress, 'street'> | 'unitAndStreetNumber';

export default function AddressSplitterToolPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<SheetData | null>(null);
  const [resultData, setResultData] = useState<SheetData | null>(null);
  const [addressColumn, setAddressColumn] = useState<string>("");
  const [activeOutputs, setActiveOutputs] = useState<OutputKey[]>(['unit', 'streetNumber', 'streetName', 'city', 'state', 'postcode']);
  const [outputNames, setOutputNames] = useState<Record<OutputKey, string>>({
      unit: "Unit",
      streetNumber: "Street Number",
      streetName: "Street Name",
      city: "Suburb",
      state: "State",
      postcode: "Postcode",
      unitAndStreetNumber: "Unit/Street Number",
    });
  const [combineUnitAndNumber, setCombineUnitAndNumber] = useState(false);

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

  const handleToggleOutput = (key: OutputKey) => {
    setActiveOutputs(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  const handleNameChange = (key: OutputKey, name: string) => {
    setOutputNames(prev => ({ ...prev, [key]: name }));
  };

  const handleSplit = () => {
    if (!data || !addressColumn) return;

    const headers = data[0];
    const addressIndex = headers.indexOf(addressColumn);
    if (addressIndex === -1) {
      console.error("Address column not found in data");
      return;
    }

    const getOutputKeys = () => {
      let keys: OutputKey[] = [];
      if (combineUnitAndNumber) {
        if (activeOutputs.includes('unitAndStreetNumber')) keys.push('unitAndStreetNumber');
      } else {
        if (activeOutputs.includes('unit')) keys.push('unit');
        if (activeOutputs.includes('streetNumber')) keys.push('streetNumber');
      }
      ['streetName', 'city', 'state', 'postcode'].forEach((key: OutputKey) => {
        if (activeOutputs.includes(key)) keys.push(key);
      });
      return keys;
    }

    const finalOutputKeys = getOutputKeys();
    const newHeaders = [
      ...headers,
      ...finalOutputKeys.map(key => outputNames[key]),
    ];

    // Filter out empty headers just in case
    if (newHeaders.some(h => !h)) {
      console.error("Output column name cannot be empty.");
      return;
    }

    const dataRows = data.slice(1);
    const newDataRows = dataRows.map((row) => {
      const addressString = row[addressIndex]?.toString() || "";
      const parsed = parseAddress(addressString);
      const newCells = finalOutputKeys.map(key => {
        if (key === 'unitAndStreetNumber') {
          return [parsed.unit, parsed.streetNumber].filter(Boolean).join(' ').trim();
        }
        return parsed[key as keyof ParsedAddress] || "";
      });
      return [...row, ...newCells];
    });

    setResultData([newHeaders, ...newDataRows]);
  };

  const headers = (d: SheetData | null) => (d ? d[0] : []);
  const canSplit = data && addressColumn;

  const outputOptions: { key: OutputKey; label: string; disabled?: boolean }[] = [
    { key: 'unit', label: 'Unit', disabled: combineUnitAndNumber },
    { key: 'streetNumber', label: 'Street Number', disabled: combineUnitAndNumber },
    { key: 'unitAndStreetNumber', label: 'Unit & Street Number', disabled: !combineUnitAndNumber },
    { key: 'streetName', label: 'Street Name' },
    { key: 'city', label: 'Suburb/City' },
    { key: 'state', label: 'State' },
    { key: 'postcode', label: 'Postcode' },
  ];

  const visibleOutputOptions = outputOptions.filter(opt => {
    if (combineUnitAndNumber) return opt.key !== 'unit' && opt.key !== 'streetNumber';
    if (!combineUnitAndNumber) return opt.key !== 'unitAndStreetNumber';
    return true;
  });

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
            <CardTitle className="flex items-center"><Settings2 className="mr-2 h-5 w-5" />2. Configure Split</CardTitle>
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
              <h4 className="font-medium mb-4">Select Output Columns</h4>
              <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50 mb-4">
                  <Toggle
                    pressed={combineUnitAndNumber}
                    onPressedChange={(pressed) => {
                      setCombineUnitAndNumber(pressed)
                      // Toggle relevant active outputs
                      if (pressed) {
                        setActiveOutputs(prev => [...prev.filter(k => k !== 'unit' && k !== 'streetNumber'), 'unitAndStreetNumber']);
                      } else {
                        setActiveOutputs(prev => [...prev.filter(k => k !== 'unitAndStreetNumber'), 'unit', 'streetNumber']);
                      }
                    }}
                  />
                  <label className="text-sm font-medium">Combine Unit and Street Number</label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visibleOutputOptions.map(({ key, label }) => (
                  <div key={key} className="space-y-2 flex flex-col">
                    <label className="text-sm capitalize text-muted-foreground">
                      {label}
                    </label>
                    <div className="flex items-center space-x-2">
                      <Toggle pressed={activeOutputs.includes(key)} onPressedChange={() => handleToggleOutput(key)} />
                      <Input
                        value={outputNames[key]}
                        onChange={(e) => handleNameChange(key, e.target.value)}
                        disabled={!activeOutputs.includes(key)}
                      />
                    </div>
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