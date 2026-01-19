'use client'

type ChartDataPoint = {
  label: string
  value: number
  color?: string
}

type DocsChartProps = {
  data: ChartDataPoint[]
  type?: 'bar' | 'line' | 'pie'
  title?: string
  caption?: string
  width?: number
  height?: number
}

function BarChart({
  data,
  width = 800,
  height = 400,
}: {
  data: ChartDataPoint[]
  width: number
  height: number
}) {
  const maxValue = Math.max(...data.map(d => d.value))
  const barWidth = width / data.length - 10

  return (
    <svg width={width} height={height} className="overflow-visible">
      {data.map((point, index) => {
        const barHeight = (point.value / maxValue) * (height - 60)
        const x = index * (barWidth + 10) + 5
        const y = height - barHeight - 30
        const color = point.color || 'hsl(var(--primary))'

        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              className="transition-opacity hover:opacity-80"
            />
            <text
              x={x + barWidth / 2}
              y={height - 10}
              textAnchor="middle"
              className="fill-foreground text-xs"
            >
              {point.label}
            </text>
            <text
              x={x + barWidth / 2}
              y={y - 5}
              textAnchor="middle"
              className="fill-foreground text-xs font-medium"
            >
              {point.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function LineChart({
  data,
  width = 800,
  height = 400,
}: {
  data: ChartDataPoint[]
  width: number
  height: number
}) {
  const maxValue = Math.max(...data.map(d => d.value))
  const pointSpacing = (width - 40) / (data.length - 1)
  const points = data.map(
    (point, index) =>
      `${40 + index * pointSpacing},${height - 30 - (point.value / maxValue) * (height - 60)}`,
  )
  const pathData = `M ${points.join(' L ')}`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={pathData}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        className="transition-opacity hover:opacity-80"
      />
      {data.map((point, index) => {
        const x = 40 + index * pointSpacing
        const y = height - 30 - (point.value / maxValue) * (height - 60)
        const color = point.color || 'hsl(var(--primary))'

        return (
          <g key={index}>
            <circle
              cx={x}
              cy={y}
              r="4"
              fill={color}
              className="transition-opacity hover:opacity-80"
            />
            <text x={x} y={height - 10} textAnchor="middle" className="fill-foreground text-xs">
              {point.label}
            </text>
            <text
              x={x}
              y={y - 10}
              textAnchor="middle"
              className="fill-foreground text-xs font-medium"
            >
              {point.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function PieChart({
  data,
  width = 400,
  height = 400,
}: {
  data: ChartDataPoint[]
  width: number
  height: number
}) {
  const total = data.reduce((sum, point) => sum + point.value, 0)
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 20

  // Guard against total === 0 to prevent NaN in percentage calculations
  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <svg width={width} height={height} className="overflow-visible" />
        <div className="flex flex-col gap-2">
          {data.map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded"
                style={{
                  backgroundColor: point.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`,
                }}
              />
              <span className="text-sm">{point.label}: 0%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const paths = data.reduce(
    ({ paths: accPaths, currentAngle }, point, index) => {
      const percentage = point.value / total
      const angle = percentage * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle

      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
      const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
      const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

      const largeArcFlag = angle > 180 ? 1 : 0

      const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

      const color = point.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`

      return {
        paths: [...accPaths, { pathData, color, label: point.label, percentage }],
        currentAngle: currentAngle + angle,
      }
    },
    {
      paths: [] as Array<{ pathData: string; color: string; label: string; percentage: number }>,
      currentAngle: -90,
    },
  ).paths

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row">
      <svg width={width} height={height} className="overflow-visible">
        {paths.map((path, index) => (
          <path
            key={index}
            d={path.pathData}
            fill={path.color}
            className="transition-opacity hover:opacity-80"
          />
        ))}
      </svg>
      <div className="flex flex-col gap-2">
        {paths.map((path, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded" style={{ backgroundColor: path.color }} />
            <span className="text-sm">
              {path.label}: {(path.percentage * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DocsChart({
  data,
  type = 'bar',
  title,
  caption,
  width = 800,
  height = 400,
}: DocsChartProps) {
  const chartComponent = (() => {
    switch (type) {
      case 'bar':
        return <BarChart data={data} width={width} height={height} />
      case 'line':
        return <LineChart data={data} width={width} height={height} />
      case 'pie':
        return <PieChart data={data} width={width} height={height} />
      default:
        return <BarChart data={data} width={width} height={height} />
    }
  })()

  return (
    <figure className="my-8 flex flex-col items-center">
      {title && <h4 className="mb-4 text-lg font-semibold text-foreground">{title}</h4>}
      <div className="relative w-full max-w-full overflow-x-auto rounded-lg border border-border bg-muted/50 p-4">
        <div className="flex items-center justify-center">{chartComponent}</div>
      </div>
      {caption && (
        <figcaption className="mt-4 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
