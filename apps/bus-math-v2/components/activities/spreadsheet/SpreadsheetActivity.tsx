"use client";

import { useState, useEffect } from "react";
import { SpreadsheetWrapper, type SpreadsheetData, getTemplateByKey } from "./index";
import type { SpreadsheetActivityProps } from "@/types/activities";

type SpreadsheetActivityComponentProps = Omit<SpreadsheetActivityProps, "initialData"> & {
  onSubmit?: (data: { spreadsheetData: SpreadsheetData }) => void;
  initialData?: SpreadsheetData;
};


/**
 * Renders a configurable spreadsheet activity with optional template,
 * formula validation, and submission support.
 *
 * @param title - The activity title
 * @param description - The activity description
 * @param template - The template key to use
 * @param customTemplate - Custom template data if template is 'custom'
 * @param initialData - Optional initial spreadsheet data
 * @param showColumnLabels - Whether to show column headers
 * @param showRowLabels - Whether to show row numbers
 * @param readOnly - Whether the spreadsheet is read-only
 * @param validateFormulas - Whether to validate formula syntax
 * @param onSubmit - Callback to submit the spreadsheet data
 */
export function SpreadsheetActivity({ title, description, template, customTemplate, initialData, showColumnLabels = true, showRowLabels = true, readOnly = false, validateFormulas = true, onSubmit, }: SpreadsheetActivityComponentProps) {
  const [data, setData] = useState<SpreadsheetData>(() => {
    // Use initialData if provided, otherwise use template
    if (initialData) return initialData;
    
    if (template === 'custom' && customTemplate) {
      return customTemplate.data;
    }
    
    const templateData = getTemplateByKey(template);
    return templateData?.data || [
      [{ value: "" }, { value: "" }, { value: "" }],
      [{ value: "" }, { value: "" }, { value: "" }],
      [{ value: "" }, { value: "" }, { value: "" }],
    ];
  });

  const [errors, setErrors] = useState<string[]>([]);

  // Sync with initialData changes
  useEffect(() => {
    if (initialData) {
      queueMicrotask(() => setData(initialData));
    }
  }, [initialData]);


  /**
   * Handles spreadsheet data changes, updating state and validating formulas.
   *
   * @param newData - The updated spreadsheet data
   */
  const handleChange = (newData: SpreadsheetData) => {
    setData(newData);
    
    // Validate formulas if enabled
    if (validateFormulas) {
      const formulaErrors: string[] = [];
      
      newData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (!cell) return;
          if (typeof cell.value === "string" && cell.value.startsWith("=")) {
            // Basic formula validation - in a real implementation, 
            // you'd want more sophisticated formula parsing
            try {
              // Check for balanced parentheses
              let openParens = 0;
              for (const char of cell.value) {
                if (char === "(") openParens++;
                if (char === ")") openParens--;
                if (openParens < 0) throw new Error("Unbalanced parentheses");
              }
              if (openParens !== 0) throw new Error("Unbalanced parentheses");
            } catch (error) {
              formulaErrors.push(`Cell ${String.fromCharCode(65 + colIndex)}${rowIndex + 1}: ${error}`);
            }
          }
        });
      });
      
      setErrors(formulaErrors);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({ spreadsheetData: data });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-red-800">Formula Errors:</h4>
          <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SpreadsheetWrapper
          initialData={data}
          onChange={handleChange}
          readOnly={readOnly}
          showColumnLabels={showColumnLabels}
          showRowLabels={showRowLabels}
          className="min-h-[400px]"
        />
      </div>

      {onSubmit && !readOnly && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={errors.length > 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Spreadsheet
          </button>
        </div>
      )}
    </div>
  );
}

export default SpreadsheetActivity;
