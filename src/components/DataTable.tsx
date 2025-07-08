import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import type { SheetData } from "@/helpers/file_helpers";
import { Button } from "./ui/button";

interface DataTableProps {
  data: SheetData;
  initialRows?: number;
}

const ROWS_TO_LOAD = 50;

export default function DataTable({ data, initialRows = 5 }: DataTableProps) {
  const [visibleRowCount, setVisibleRowCount] = useState(initialRows);

  // Reset visible rows when data changes
  useEffect(() => {
    setVisibleRowCount(initialRows);
  }, [data, initialRows]);

  if (!data || data.length === 0) {
    return (
      <p className="text-muted-foreground text-center p-4">No data to display.</p>
    );
  }

  const headers = useMemo(() => data[0], [data]);
  const allRows = useMemo(() => data.slice(1), [data]);
  const totalRows = allRows.length;

  const visibleRows = useMemo(
    () => allRows.slice(0, visibleRowCount),
    [allRows, visibleRowCount],
  );

  const showMore = () => {
    setVisibleRowCount((prev) => Math.min(prev + ROWS_TO_LOAD, totalRows));
  };

  const showAll = () => {
    setVisibleRowCount(totalRows);
  };

  return (
    <div className="rounded-md border">
      <div className="max-h-80 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalRows > initialRows && (
        <div className="p-2 border-t text-sm text-muted-foreground flex items-center justify-between">
          <p>
            Showing {visibleRows.length} of {totalRows} rows
          </p>
          {visibleRows.length < totalRows && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={showMore}>
                Show {Math.min(ROWS_TO_LOAD, totalRows - visibleRowCount)} More
              </Button>
              <Button variant="outline" size="sm" onClick={showAll}>
                Show All
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 