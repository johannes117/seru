import * as XLSX from "xlsx";
import JSZip from "jszip";

export type SheetData = (string | number)[][];

/**
 * Represents the component parts of a parsed address.
 */
export interface ParsedAddress {
  unit: string;
  streetNumber: string;
  streetName:string;
  street: string; // The full street line for reference
  city: string; // Often referred to as Suburb in Australia
  state: string;
  postcode: string;
}

export function parseSheet(file: File): Promise<SheetData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: SheetData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}

export function downloadSheet(data: SheetData, filename: string) {
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename);
}

/**
 * Splits a sheet's data into multiple chunks of a specified size.
 * Each chunk includes the original header row.
 * @param data The full sheet data.
 * @param chunkSize The maximum number of data rows per chunk.
 * @returns An array of SheetData chunks.
 */
export function splitSheet(data: SheetData, chunkSize: number): SheetData[] {
  if (!data || data.length < 2 || chunkSize <= 0) {
    return data ? [data] : [];
  }

  const headers = data[0];
  const rows = data.slice(1);
  const chunks: SheetData[] = [];

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunkRows = rows.slice(i, i + chunkSize);
    chunks.push([headers, ...chunkRows]);
  }

  return chunks;
}

/**
 * Splits a sheet's data into chunks based on custom sizes.
 * Each chunk includes the original header row.
 * @param data The full sheet data.
 * @param customSizes An array of numbers representing the size of each split.
 * @returns An array of SheetData chunks.
 */
export function splitSheetCustom(data: SheetData, customSizes: number[]): SheetData[] {
  if (!data || data.length < 2 || customSizes.length === 0) {
    return data ? [data] : [];
  }

  const headers = data[0];
  const rows = data.slice(1);
  const chunks: SheetData[] = [];
  
  let currentRowIndex = 0;
  
  for (const size of customSizes) {
    if (currentRowIndex >= rows.length) break;
    if (size <= 0) continue;
    
    const chunkRows = rows.slice(currentRowIndex, currentRowIndex + size);
    if (chunkRows.length > 0) {
      chunks.push([headers, ...chunkRows]);
      currentRowIndex += size;
    }
  }
  
  // If there are remaining rows and we've exhausted custom sizes, 
  // create a new chunk for the remaining rows
  if (currentRowIndex < rows.length) {
    const remainingRows = rows.slice(currentRowIndex);
    chunks.push([headers, ...remainingRows]);
  }
  
  return chunks;
}

/**
 * Creates a ZIP file containing multiple Excel sheets and triggers a download.
 * @param sheets An array of SheetData to be converted into Excel files.
 * @param baseFileName The base name for the output files (e.g., "my_data.xlsx").
 * @param zipFileName The name for the final ZIP file (e.g., "archive.zip").
 */
export async function downloadSheetsAsZip(
  sheets: SheetData[],
  baseFileName: string,
  zipFileName: string,
) {
  const zip = new JSZip();

  const nameWithoutExtension = baseFileName.replace(/\.[^/.]+$/, "");
  const extension = "xlsx"; // Always use xlsx since we're creating Excel files

  sheets.forEach((sheetData, index) => {
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const fileIndex = (index + 1).toString().padStart(2, "0");
    const fileName = `${nameWithoutExtension}_${fileIndex}.${extension}`;

    zip.file(fileName, wbout);
  });

  const zipBlob = await zip.generateAsync({ type: "blob" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(zipBlob);
  link.download = zipFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function parseStreetLine(streetLine: string): { unit: string; streetNumber: string; streetName: string } {
  const parts = { unit: "", streetNumber: "", streetName: "" };
  if (!streetLine) return parts;

  let rest = streetLine.trim();

  // Pattern for "Unit 5," or "Shop 3," etc. at the start
  const unitKeywordPattern = /^(Unit|Apt|Apartment|Shop|Level|Suite)\s+([a-zA-Z0-9-]+),?\s*/i;
  let match = rest.match(unitKeywordPattern);
  if (match) {
    parts.unit = `${match[1]} ${match[2]}`;
    rest = rest.substring(match[0].length).trim();
  }

  // Pattern for "4/18" at the start.
  const slashPattern = /^([a-zA-Z0-9-]+)\/(\d+[a-zA-Z]?)\s+/i;
  match = rest.match(slashPattern);
  if (match) {
    parts.unit = match[1];
    parts.streetNumber = match[2];
    rest = rest.substring(match[0].length).trim();
    parts.streetName = rest;
    return parts;
  }

  // Pattern for street number at start
  const streetNumberPattern = /^(\d+[a-zA-Z]?(-\d+[a-zA-Z]?)?)\s+/;
  match = rest.match(streetNumberPattern);
  if (match) {
    parts.streetNumber = match[1];
    rest = rest.substring(match[0].length).trim();
  }

  parts.streetName = rest;
  return parts;
}

/**
 * A best-effort address parser specifically for Australian addresses.
 * It works by finding a valid Australian state and 4-digit postcode, then
 * works backwards to identify the suburb/city and street address. It then
 * attempts to parse the street address into unit, number, and name.
 */
export function parseAddress(address: string): ParsedAddress {
  const result: ParsedAddress = {
    unit: "",
    streetNumber: "",
    streetName: "",
    street: "",
    city: "",
    state: "",
    postcode: "",
  };

  if (!address || typeof address !== "string") {
    return result;
  }

  const fullAddressString = address.trim();
  const ausStatePostcodeRegex = /\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\b\s+(\d{4})\b/i;
  const match = fullAddressString.match(ausStatePostcodeRegex);

  let streetLine = '';
  let prePostcodePart = '';

  if (match) {
    result.state = match[1].toUpperCase();
    result.postcode = match[2];
    prePostcodePart = fullAddressString.substring(0, match.index).trim().replace(/,$/, '');
  } else {
    // If no state/postcode, the whole string is the part we need to process for street/city
    prePostcodePart = fullAddressString;
  }

  // Now, consistently process the pre-postcode part for city and street
  if (prePostcodePart.includes(',')) {
      const parts = prePostcodePart.split(',').map(p => p.trim());
      result.city = parts.pop() || '';
      streetLine = parts.join(', ');
  } else {
    // Only apply the space-based heuristic if we have a state anchor, as it's less reliable.
    if (match) {
      const words = prePostcodePart.split(' ').filter(Boolean);
      if (words.length > 1) {
          result.city = words.pop() || '';
          streetLine = words.join(' ');
      } else {
          streetLine = prePostcodePart;
      }
    } else {
      // No state, no comma. Assume it's all street. This is the safest bet.
      streetLine = prePostcodePart;
    }
  }
  
  result.street = streetLine;
  const streetParts = parseStreetLine(streetLine);
  result.unit = streetParts.unit;
  result.streetNumber = streetParts.streetNumber;
  result.streetName = streetParts.streetName;

  return result;
} 