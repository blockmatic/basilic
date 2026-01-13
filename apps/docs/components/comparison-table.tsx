type ComparisonTableProps = {
  headers: string[]
  rows: Array<{
    label: string
    values: (string | React.ReactNode)[]
  }>
  caption?: string
}

export function ComparisonTable({ headers, rows, caption }: ComparisonTableProps) {
  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse border border-border">
        {caption && <caption className="mb-2 text-left text-sm font-medium">{caption}</caption>}
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="border-r border-border px-4 py-3 text-left font-semibold">Feature</th>
            {headers.map((header, index) => (
              <th
                key={index}
                className={`px-4 py-3 text-left font-semibold ${
                  index < headers.length - 1 ? 'border-r border-border' : ''
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-border ${
                rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'
              }`}
            >
              <td className="border-r border-border px-4 py-3 font-medium">{row.label}</td>
              {row.values.map((value, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-4 py-3 ${
                    colIndex < row.values.length - 1 ? 'border-r border-border' : ''
                  }`}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
