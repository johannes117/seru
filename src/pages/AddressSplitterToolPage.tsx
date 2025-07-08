import React, { useState, useMemo } from "react";
import {
  downloadSheet,
  parseAddress,
  parseSheet,
  type ParsedAddress,
  type SheetData,
} from "@/helpers/file_helpers";
import FileUploader from "@/components/FileUploader";
import DataTable from "@/components/DataTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";

type OutputKey = keyof Omit<ParsedAddress, 'street'> | 'unitAndStreetNumber' | 'fullStreet';

const outputOptions: { key: OutputKey; label: string; }[] = [
    { key: 'unit', label: 'Unit' },
    { key: 'streetNumber', label: 'Street Number' },
    { key: 'streetName', label: 'Street Name' },
    { key: 'unitAndStreetNumber', label: 'Unit & Street Number' },
    { key: 'fullStreet', label: 'Street Address' },
    { key: 'city', label: 'Suburb/City' },
    { key: 'state', label: 'State' },
    { key: 'postcode', label: 'Postcode' },
];

export default function AddressSplitterToolPage() {
  const [data, setData] = useState<SheetData | null>(null);
  const [resultData, setResultData] = useState<SheetData | null>(null);
  const [addressColumn, setAddressColumn] = useState<string>("");
  const [addressColumnSearch, setAddressColumnSearch] = useState("");
  const [activeOutputs, setActiveOutputs] = useState<OutputKey[]>(['fullStreet', 'city', 'state', 'postcode']);
  const [outputNames, setOutputNames] = useState<Record<OutputKey, string>>({
      unit: "Unit",
      streetNumber: "Street Number",
      streetName: "Street Name",
      city: "Suburb",
      state: "State",
      postcode: "Postcode",
      unitAndStreetNumber: "Unit/Street Number",
      fullStreet: "Street Address",
    });
  const [combineFullStreet, setCombineFullStreet] = useState(true);
  const [combineUnitAndNumber, setCombineUnitAndNumber] = useState(false);
  const [hideInputBlanks, setHideInputBlanks] = useState(false);
  const [hideInputBlanksCol, setHideInputBlanksCol] = useState('');

  const handleFileLoad = async (file: File | null) => {
    if (!file) {
      setData(null);
      setResultData(null);
      return;
    }

    try {
      const sheetData = await parseSheet(file);
      setData(sheetData);
      setResultData(null);
    } catch (error) {
      console.error("Error loading file:", error);
    }
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
      const keys: OutputKey[] = [];
      if (combineFullStreet) {
        if (activeOutputs.includes('fullStreet')) keys.push('fullStreet');
      } else if (combineUnitAndNumber) {
         if (activeOutputs.includes('unitAndStreetNumber')) keys.push('unitAndStreetNumber');
         if (activeOutputs.includes('streetName')) keys.push('streetName');
      } else {
        if (activeOutputs.includes('unit')) keys.push('unit');
        if (activeOutputs.includes('streetNumber')) keys.push('streetNumber');
        if (activeOutputs.includes('streetName')) keys.push('streetName');
      }

      (['city', 'state', 'postcode'] as OutputKey[]).forEach((key) => {
        if (activeOutputs.includes(key)) keys.push(key);
      });
      return keys;
    };

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
        if (key === 'fullStreet') {
          return parsed.street;
        }
        if (key === 'unitAndStreetNumber') {
          return [parsed.unit, parsed.streetNumber].filter(Boolean).join(', ').trim();
        }
        return parsed[key as keyof ParsedAddress] || "";
      });
      return [...row, ...newCells];
    });

    setResultData([newHeaders, ...newDataRows]);
  };

  const headers = (d: SheetData | null) => (d ? d[0] : []);
  const canSplit = data && addressColumn;

  const displayData = useMemo(() => {
    if (!data || !hideInputBlanks || !hideInputBlanksCol) return data;
    const header = data[0];
    const columnIndex = header.indexOf(hideInputBlanksCol);
    if (columnIndex === -1) return data;

    const body = data.slice(1).filter(row => {
        const cellValue = row[columnIndex];
        return cellValue !== null && cellValue !== undefined && cellValue.toString().trim() !== '';
    });
    return [header, ...body];
  }, [data, hideInputBlanks, hideInputBlanksCol]);

  const visibleOutputOptions = useMemo(() => {
    let options = outputOptions;
    if (combineFullStreet) {
        options = options.filter(opt => !['unit', 'streetNumber', 'streetName', 'unitAndStreetNumber'].includes(opt.key));
    } else if (combineUnitAndNumber) {
        options = options.filter(opt => !['unit', 'streetNumber', 'fullStreet'].includes(opt.key));
    } else {
        options = options.filter(opt => !['unitAndStreetNumber', 'fullStreet'].includes(opt.key));
    }
    return options;
  }, [combineFullStreet, combineUnitAndNumber]);

  return (
    <div className="flex flex-col p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Address Splitter Tool</h1>
        <p className="text-muted-foreground">Upload a file and split address columns into separate components.</p>
      </div>

      <FileUploader
        title="Upload Spreadsheet File"
        acceptedFileTypes=".csv, .xlsx, .xls"
        onFileSelect={handleFileLoad}
      />

      {data && (
        <Card>
            <CardHeader><CardTitle>1. Preview Input Data</CardTitle></CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="hide-blanks-input"
                            checked={hideInputBlanks}
                            onCheckedChange={(checked) => setHideInputBlanks(checked === true)}
                        />
                        <label htmlFor="hide-blanks-input" className="text-sm font-medium whitespace-nowrap">Hide rows with blank cells in column:</label>
                    </div>
                    <Select onValueChange={setHideInputBlanksCol} value={hideInputBlanksCol} disabled={!hideInputBlanks}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                            {headers(data).map((h, i) => (
                                <SelectItem key={i} value={h.toString()}>{h}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {displayData && <DataTable data={displayData} />}
            </CardContent>
        </Card>)}

      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              2. Configure Address Splitting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Select Address Column</h4>
              <Input
                placeholder="Search for a column..."
                value={addressColumnSearch}
                onChange={(e) => setAddressColumnSearch(e.target.value)}
                className="mb-2 w-full md:w-1/2"
              />
              <Select onValueChange={setAddressColumn} value={addressColumn}>
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue placeholder="Select column to split..." />
                </SelectTrigger>
                <SelectContent>
                  {headers(data)
                    .filter(h => h.toString().toLowerCase().includes(addressColumnSearch.toLowerCase()))
                    .map((h, i) => (
                      <SelectItem key={i} value={h.toString()}>
                        {h}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <h4 className="font-medium mb-4">Select Output Columns</h4>
              <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50 mb-2">
                  <Checkbox
                    id="combineFullStreet"
                    checked={combineFullStreet}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true;
                      setCombineFullStreet(isChecked);
                      if (isChecked) {
                          setCombineUnitAndNumber(false);
                          setActiveOutputs(prev => [...prev.filter(k => !['unit', 'streetNumber', 'streetName', 'unitAndStreetNumber'].includes(k)), 'fullStreet']);
                      } else {
                          setActiveOutputs(prev => [...prev.filter(k => k !== 'fullStreet'), 'unit', 'streetNumber', 'streetName']);
                      }
                    }}
                  />
                  <label htmlFor="combineFullStreet" className="text-sm font-medium">Combine Unit, Street Number, and Street Name</label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50 mb-4">
                  <Checkbox
                    checked={combineUnitAndNumber}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true;
                      setCombineUnitAndNumber(isChecked);
                      if (isChecked) {
                        setActiveOutputs(prev => [...prev.filter(k => k !== 'unit' && k !== 'streetNumber'), 'unitAndStreetNumber']);
                      } else {
                        setActiveOutputs(prev => [...prev.filter(k => k !== 'unitAndStreetNumber'), 'unit', 'streetNumber']);
                      }
                    }}
                  />
                  <label className="text-sm font-medium">Combine Unit and Street Number (only)</label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visibleOutputOptions.map(({ key, label }) => (
                  <div key={key} className="space-y-2 flex flex-col">
                    <label className="text-sm capitalize text-muted-foreground">
                      {label}
                    </label>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={activeOutputs.includes(key)} 
                        onCheckedChange={() => handleToggleOutput(key)} 
                      />
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