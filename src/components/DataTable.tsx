import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import type { SheetData } from "@/helpers/file_helpers";

interface DataTableProps {
  data: SheetData;
  maxRows?: number;
}

export default function DataTable({ data, maxRows = 5 }: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <p className="text-muted-foreground text-center p-4">No data to display.</p>
    );
  }

  const headers = data[0];
  const rows = data.slice(1, maxRows + 1);

  return (
    <div className="rounded-md border max-h-80 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 