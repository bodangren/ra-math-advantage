import type { ChartConfig } from "@/components/ui/chart";

export interface ChartSeries {
  key: string;
  label: string;
  color?: string;
}

export interface ChartDataPoint {
  [key: string]: string | number | null | undefined;
}

export interface ChartSegment {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export const DEFAULT_CHART_COLORS = [
  "hsl(222, 47%, 11%)",
  "hsl(210, 84%, 53%)",
  "hsl(142, 70%, 45%)",
  "hsl(6, 78%, 57%)",
  "hsl(27, 96%, 55%)",
  "hsl(271, 90%, 65%)"
];


/**
 * Build a Recharts ChartConfig from an array of series definitions.
 *
 * @param series - Array of series with key, label, and optional color
 * @returns A ChartConfig mapping keys to label and color
 */
export function buildChartConfig(series: ChartSeries[]): ChartConfig {
  return series.reduce<ChartConfig>((config, item, index) => {
    config[item.key] = {
      label: item.label,
      color: item.color ?? DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]
    };
    return config;
  }, {});
}


/**
 * Format a numeric value as a localized currency string.
 *
 * @param value - The amount to format
 * @param currency - ISO 4217 currency code (default "USD")
 * @returns A formatted currency string or "—" for non-finite values
 */
export function formatCurrency(value: number, currency = "USD") : string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}
