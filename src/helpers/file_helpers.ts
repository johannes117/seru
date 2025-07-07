import * as XLSX from "xlsx";

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

  const ausStates = new Set(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']);
  const ausStatePostcodeRegex = /\b([A-Z]{2,3})\b\s+(\d{4})\b/i;

  const fullAddressString = address.trim();
  const match = fullAddressString.match(ausStatePostcodeRegex);

  let streetLine = '';
  if (match && ausStates.has(match[1].toUpperCase())) {
    result.state = match[1].toUpperCase();
    result.postcode = match[2];

    const remaining = fullAddressString.substring(0, match.index).trim().replace(/,$/, '');

    if (remaining.includes(',')) {
        const remainingParts = remaining.split(',').map(p => p.trim());
        result.city = remainingParts.pop() || '';
        streetLine = remainingParts.join(', ');
    } else {
        // Handle cases like "789 Queen Street Brisbane" where city is not comma-separated
        const words = remaining.split(' ').filter(Boolean);
        if (words.length > 1) {
            result.city = words.pop() || '';
            streetLine = words.join(' ');
        } else {
            streetLine = remaining;
        }
    }
  } else {
    // Fallback for addresses without a clear state/postcode match
    streetLine = address;
  }
  
  result.street = streetLine;
  const streetParts = parseStreetLine(streetLine);
  result.unit = streetParts.unit;
  result.streetNumber = streetParts.streetNumber;
  result.streetName = streetParts.streetName;

  return result;
} 