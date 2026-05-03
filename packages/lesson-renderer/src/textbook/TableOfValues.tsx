export interface TableOfValuesProps {
  headers: string[];
  data: (string | number)[][];
  highlightCells?: Array<{ row: number; col: number }>;
}

export function TableOfValues({ headers, data, highlightCells = [] }: TableOfValuesProps) {
  const isHighlighted = (rowIndex: number, colIndex: number) => {
    return highlightCells.some(cell => cell.row === rowIndex && cell.col === colIndex);
  };

  const formatCellValue = (value: string | number) => {
    return String(value);
  };

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left font-semibold text-foreground border-b border-border"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-muted/30 transition-colors">
              {row.map((cell, colIndex) => {
                const highlighted = isHighlighted(rowIndex, colIndex);
                const isNumber = typeof cell === 'number';
                const cellValue = formatCellValue(cell);

                return (
                  <td
                    key={colIndex}
                    className={`
                      px-4 py-3 border-b border-border last:border-b-0
                      ${isNumber ? 'font-mono-num' : ''}
                      ${highlighted ? 'bg-accent/20 font-semibold' : ''}
                    `}
                  >
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
