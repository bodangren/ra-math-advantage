"use client";

import { useMemo } from "react";
import Spreadsheet from "react-spreadsheet";
import type { Matrix, CellBase } from "react-spreadsheet";
import { generateColumnLabels, generateRowLabels } from "./SpreadsheetHelpers";

export interface SpreadsheetCell extends CellBase {
  value: string | number;
  readOnly?: boolean;
  className?: string;
}

export type SpreadsheetData = Matrix<SpreadsheetCell>;

export interface SpreadsheetWrapperProps {
  initialData?: SpreadsheetData;
  columnLabels?: string[];
  rowLabels?: string[];
  onChange?: (data: SpreadsheetData) => void;
  readOnly?: boolean;
  className?: string;
  showColumnLabels?: boolean;
  showRowLabels?: boolean;
}


/**
 * Renders a wrapper around the react-spreadsheet library, providing
 * auto-generated labels, read-only mode, and change propagation.
 *
 * @param initialData - The initial spreadsheet cell data
 * @param columnLabels - Optional custom column labels
 * @param rowLabels - Optional custom row labels
 * @param onChange - Callback fired when cell data changes
 * @param readOnly - Whether the spreadsheet is read-only
 * @param className - Additional CSS classes
 * @param showColumnLabels - Whether to show column headers
 * @param showRowLabels - Whether to show row numbers
 */
export function SpreadsheetWrapper({ initialData = [ [{ value: "" }, { value: "" }, { value: "" }], [{ value: "" }, { value: "" }, { value: "" }], [{ value: "" }, { value: "" }, { value: "" }], ], columnLabels, rowLabels, onChange, readOnly = false, className = "", showColumnLabels = true, showRowLabels = true, }: SpreadsheetWrapperProps) {
  // Generate standard Excel-like labels if not provided
  const finalColumnLabels = useMemo(() => {
    if (!showColumnLabels) return [];
    if (columnLabels) return columnLabels;
    const maxCols = Math.max(...initialData.map(row => row.length), 10);
    return generateColumnLabels(maxCols);
  }, [columnLabels, initialData, showColumnLabels]);

  const finalRowLabels = useMemo(() => {
    if (!showRowLabels) return [];
    if (rowLabels) return rowLabels;
    return generateRowLabels(Math.max(initialData.length, 10));
  }, [rowLabels, initialData.length, showRowLabels]);


  /**
   * Handles spreadsheet data changes, propagating to the onChange callback
   * when not in read-only mode.
   *
   * @param newData - The updated spreadsheet data
   */
  const handleChange = (newData: SpreadsheetData) => {
    if (!readOnly) {
      onChange?.(newData);
    }
  };

  return (
    <div className={`spreadsheet-wrapper ${className}`}>
      <Spreadsheet
        data={initialData}
        onChange={readOnly ? undefined : handleChange}
        columnLabels={finalColumnLabels}
        rowLabels={finalRowLabels}
        darkMode={false}
      />
    </div>
  );
}

export default SpreadsheetWrapper;
