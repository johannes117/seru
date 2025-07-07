import * as XLSX from "xlsx";

export type SheetData = (string | number)[][];

export interface ParsedAddress {
  street: string;
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

/**
 * A best-effort address parser specifically for Australian addresses.
 * It works by finding a valid Australian state and 4-digit postcode, then
 * works backwards to identify the suburb/city and street address.
 */
export function parseAddress(address: string): ParsedAddress {
  const result: ParsedAddress = {
    street: "",
    city: "",
    state: "",
    postcode: "",
  };

  if (!address || typeof address !== "string") {
    return result;
  }

  // Define Australian states and territories for validation. A Set is used for efficient lookups.
  const ausStates = new Set(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']);

  // Regex to find a 2-3 letter state abbreviation followed by a 4-digit postcode.
  const ausStatePostcodeRegex = /\b([A-Z]{2,3})\b\s+(\d{4})\b/i;

  const fullAddressString = address.trim();
  const match = fullAddressString.match(ausStatePostcodeRegex);

  if (match && ausStates.has(match[1].toUpperCase())) {
    result.state = match[1].toUpperCase();
    result.postcode = match[2];

    // Everything before the match is a candidate for street/suburb
    const remaining = fullAddressString.substring(0, match.index).trim().replace(/,$/, '');
    const remainingParts = remaining.split(',').map(p => p.trim());

    // The last part of the remainder is likely the suburb/city
    result.city = remainingParts.pop() || '';

    // Whatever is left is the street address
    result.street = remainingParts.join(', ');
  } else {
    // If no state/postcode match, assume the last comma-separated part is the city/suburb
    // and the rest is the street. This is a fallback.
    const parts = address.split(',').map(p => p.trim());
    result.city = parts.pop() || '';
    result.street = parts.join(', ');
  }

  return result;
} 